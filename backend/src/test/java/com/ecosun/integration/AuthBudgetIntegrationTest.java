package com.ecosun.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthBudgetIntegrationTest {
    private static final String TEST_PASSWORD = "Integracao123";

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void exigeAutenticacaoEImpedeUsuarioComumDeAcessarDadosAdministrativos() throws Exception {
        UserSession user = registerUser();

        assertThat(get("/orcamentos", null).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(post("/categorias", null, Map.of("nome", "Categoria")).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(post("/categorias", user.token, Map.of("nome", "Categoria")).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(get("/estatisticas", user.token).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(get("/usuarios", user.token).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void tokenRefleteAlteracaoDePermissaoEContaInativa() throws Exception {
        UserSession user = registerUser();

        assertThat(get("/usuarios", user.token).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        jdbcTemplate.update("UPDATE Usuario SET NivelAcesso = 'ADMIN' WHERE Id = ?", user.id);
        assertThat(get("/usuarios", user.token).getStatusCode()).isEqualTo(HttpStatus.OK);

        jdbcTemplate.update("UPDATE Usuario SET StatusUsuario = 'INATIVO' WHERE Id = ?", user.id);
        assertThat(get("/usuarios/me", user.token).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void logoutRevogaTokenNoServidor() throws Exception {
        UserSession user = registerUser();

        ResponseEntity<String> logout = post("/auth/logout", user.token, Map.of());
        assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(get("/usuarios/me", user.token).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void persisteSenhaComoHashBcrypt() throws Exception {
        UserSession user = registerUser();

        String storedPassword = jdbcTemplate.queryForObject(
                "SELECT Senha FROM Usuario WHERE Id = ?", String.class, user.id);

        assertThat(storedPassword).matches("^\\$2[aby]\\$\\d{2}\\$.*");
        assertThat(storedPassword).isNotEqualTo(TEST_PASSWORD);
    }

    @Test
    void cadastraAutenticaCriaOrcamentoEConsultaDadosPersistidos() throws Exception {
        UserSession owner = registerUser();

        ResponseEntity<String> created = post("/orcamentos", owner.token, Map.of(
                "usuarioId", owner.id,
                "nome", "Orcamento de integracao",
                "email", owner.email,
                "precoTotal", 1450.75,
                "produtosSelecionados", "[]"));

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode createdBudget = objectMapper.readTree(created.getBody());
        int budgetId = createdBudget.get("id").asInt();

        ResponseEntity<String> listed = get("/orcamentos/usuario/" + owner.id, owner.token);

        assertThat(listed.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode budgets = objectMapper.readTree(listed.getBody());
        assertThat(budgets.size()).isEqualTo(1);
        assertThat(budgets.get(0).get("id").asInt()).isEqualTo(budgetId);
        assertThat(budgets.get(0).get("nome").asText()).isEqualTo("Orcamento de integracao");
        assertThat(budgets.get(0).get("precoTotal").asDouble()).isEqualTo(1450.75);
    }

    @Test
    void impedeQueUsuarioConsulteOrcamentosDeOutraConta() throws Exception {
        UserSession owner = registerUser();
        UserSession other = registerUser();

        ResponseEntity<String> created = post("/orcamentos", owner.token, Map.of(
                "usuarioId", owner.id,
                "nome", "Orcamento privado",
                "email", owner.email));

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.OK);
        int budgetId = objectMapper.readTree(created.getBody()).get("id").asInt();

        ResponseEntity<String> otherUserList = get("/orcamentos/usuario/" + owner.id, other.token);
        ResponseEntity<String> otherUserBudget = get("/orcamentos/" + budgetId, other.token);

        assertThat(otherUserList.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(otherUserBudget.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<String> attemptedTransfer = put("/orcamentos/" + budgetId, owner.token, Map.of(
            "usuarioId", other.id, "nome", "Tentativa de transferência", "email", owner.email));
        assertThat(attemptedTransfer.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(get("/orcamentos/" + budgetId, other.token).getStatusCode())
            .isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(get("/orcamentos/" + budgetId, owner.token).getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void rejeitaUploadQueFingeSerImagemEProdutoComCamposInvalidos() throws Exception {
        UserSession admin = registerUser();
        jdbcTemplate.update("UPDATE Usuario SET NivelAcesso = 'ADMIN' WHERE Id = ?", admin.id);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(admin.token);
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("nome", "Painel inválido");
        form.add("descricao", "Teste de upload");
        form.add("preco", "100.00");
        form.add("categoriaId", "1");
        form.add("foto", new ByteArrayResource("conteudo falso".getBytes()) {
            @Override
            public String getFilename() {
                return "imagem.png";
            }
        });

        ResponseEntity<String> upload = restTemplate.postForEntity(url("/produtos/upload"),
                new HttpEntity<>(form, headers), String.class);
        ResponseEntity<String> invalidProduct = post("/produtos", admin.token, Map.of(
                "nome", " ", "descricao", "Produto inválido", "preco", 100, "categoriaId", 1));
        ResponseEntity<String> invalidCategory = post("/categorias", admin.token, Map.of("nome", " "));
        ResponseEntity<String> invalidBudget = post("/orcamentos", admin.token, Map.of(
            "usuarioId", admin.id, "nome", " "));

        assertThat(upload.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(upload.getBody()).doesNotContain("Exception", "SQLException", "org.springframework");
        assertThat(invalidProduct.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalidCategory.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalidBudget.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private UserSession registerUser() throws Exception {
        String email = "integration-" + UUID.randomUUID() + "@example.com";
        ResponseEntity<String> response = post("/auth/register", null, Map.of(
                "nome", "Usuario de integracao",
                "email", email,
            "senha", TEST_PASSWORD));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode user = objectMapper.readTree(response.getBody());
        ResponseEntity<String> login = post("/auth/login", null, Map.of(
            "email", email,
            "senha", TEST_PASSWORD));

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode authenticatedUser = objectMapper.readTree(login.getBody());
        return new UserSession(email, user.get("id").asInt(), authenticatedUser.get("token").asText());
    }

    private ResponseEntity<String> post(String path, String token, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) headers.setBearerAuth(token);
        return restTemplate.postForEntity(url(path), new HttpEntity<>(body, headers), String.class);
    }

    private ResponseEntity<String> get(String path, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return restTemplate.exchange(url(path), org.springframework.http.HttpMethod.GET,
                new HttpEntity<>(headers), String.class);
    }

    private ResponseEntity<String> put(String path, String token, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) headers.setBearerAuth(token);
        return restTemplate.exchange(url(path), org.springframework.http.HttpMethod.PUT,
                new HttpEntity<>(body, headers), String.class);
    }

    private String url(String path) {
        return "http://localhost:" + port + "/api" + path;
    }

    private static final class UserSession {
        private final String email;
        private final int id;
        private final String token;

        private UserSession(String email, int id, String token) {
            this.email = email;
            this.id = id;
            this.token = token;
        }
    }
}