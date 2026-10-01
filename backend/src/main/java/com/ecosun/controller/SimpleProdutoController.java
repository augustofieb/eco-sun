package com.ecosun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Base64;

@RestController
@RequestMapping("/produtos")
public class SimpleProdutoController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllProdutos() {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas FROM Produto WHERE status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(normalizeProducts(produtos));
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<?> getProdutosByCategoria(@PathVariable Integer categoriaId) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl FROM Produto WHERE categoria_id = ? AND status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, categoriaId);
            return ResponseEntity.ok(normalizeProducts(produtos));
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProdutos(@RequestParam String query) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl FROM Produto WHERE status_produto = 'ATIVO' AND (nome LIKE ? OR descricao LIKE ? OR CAST(id AS VARCHAR) LIKE ?)";
            String searchPattern = "%" + query + "%";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, searchPattern, searchPattern, searchPattern);
            return ResponseEntity.ok(normalizeProducts(produtos));
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduto(@RequestBody Map<String, Object> request) {
        try {
            ProductInput input = readProductInput(request);
            String validationError = validateProduct(input);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);

            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas) VALUES (?, ?, ?, ?, 'ATIVO', ?, ?)";
            jdbcTemplate.update(sql, input.nome, input.descricao, input.preco, input.categoriaId,
                    input.fotoUrl, input.especificacoesTecnicas);

            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dados de produto inválidos");
        }
    }

    @PostMapping("/upload")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProdutoWithUpload(
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam("categoriaId") Integer categoriaId,
            @RequestParam(value = "especificacoesTecnicas", required = false) String especificacoesTecnicas,
            @RequestParam(value = "foto", required = false) MultipartFile foto) {
        try {
            String fotoBase64 = null;
            if (foto != null && !foto.isEmpty()) {
                if (foto.getSize() > ImageUploadValidator.MAX_IMAGE_BYTES) {
                    return ResponseEntity.badRequest().body("Imagem acima do limite de 5 MB");
                }
                byte[] fotoBytes = foto.getBytes();
                String imageType = ImageUploadValidator.detectImageType(fotoBytes, foto.getContentType());
                fotoBase64 = "data:" + imageType + ";base64," + Base64.getEncoder().encodeToString(fotoBytes);
            }

            if (especificacoesTecnicas == null || especificacoesTecnicas.trim().isEmpty()) {
                especificacoesTecnicas = "{}";
            }
            ProductInput input = new ProductInput(nome, descricao, preco, categoriaId, null, especificacoesTecnicas);
            String validationError = validateProduct(input);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);

            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas) VALUES (?, ?, ?, ?, 'ATIVO', ?, ?)";
            jdbcTemplate.update(sql, input.nome, input.descricao, input.preco, input.categoriaId,
                    fotoBase64, input.especificacoesTecnicas);

            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dados de produto ou imagem inválidos");
        }
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduto(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            ProductInput input = readProductInput(request);
            String validationError = validateProduct(input);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);

            String sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, fotoUrl = ?, especificacoes_tecnicas = ? WHERE id = ?";
            jdbcTemplate.update(sql, input.nome, input.descricao, input.preco, input.categoriaId,
                    input.fotoUrl, input.especificacoesTecnicas, id);

            return ResponseEntity.ok("{\"message\":\"Produto atualizado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dados de produto inválidos");
        }
    }

    @PutMapping("/upload/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProdutoWithUpload(
            @PathVariable Integer id,
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam("categoriaId") Integer categoriaId,
            @RequestParam(value = "especificacoesTecnicas", required = false) String especificacoesTecnicas,
            @RequestParam(value = "foto", required = false) MultipartFile foto) {
        try {
            String fotoBase64 = null;
            if (foto != null && !foto.isEmpty()) {
                if (foto.getSize() > ImageUploadValidator.MAX_IMAGE_BYTES) {
                    return ResponseEntity.badRequest().body("Imagem acima do limite de 5 MB");
                }
                byte[] fotoBytes = foto.getBytes();
                String imageType = ImageUploadValidator.detectImageType(fotoBytes, foto.getContentType());
                fotoBase64 = "data:" + imageType + ";base64," + Base64.getEncoder().encodeToString(fotoBytes);
            }

            if (especificacoesTecnicas == null || especificacoesTecnicas.trim().isEmpty()) {
                especificacoesTecnicas = "{}";
            }
            ProductInput input = new ProductInput(nome, descricao, preco, categoriaId, null, especificacoesTecnicas);
            String validationError = validateProduct(input);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);

            String sql;
            if (fotoBase64 != null) {
                sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, fotoUrl = ?, especificacoes_tecnicas = ? WHERE id = ?";
                jdbcTemplate.update(sql, input.nome, input.descricao, input.preco, input.categoriaId,
                        fotoBase64, input.especificacoesTecnicas, id);
            } else {
                sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, especificacoes_tecnicas = ? WHERE id = ?";
                jdbcTemplate.update(sql, input.nome, input.descricao, input.preco, input.categoriaId,
                        input.especificacoesTecnicas, id);
            }

            return ResponseEntity.ok("{\"message\":\"Produto atualizado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dados de produto ou imagem inválidos");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProdutoById(@PathVariable Integer id) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas FROM Produto WHERE id = ? AND status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, id);
            if (produtos.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(normalizeProduct(produtos.get(0)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduto(@PathVariable Integer id) {
        try {
            String sql = "UPDATE Produto SET status_produto = 'INATIVO' WHERE id = ?";
            jdbcTemplate.update(sql, id);
            return ResponseEntity.ok("{\"message\":\"Produto inativado\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    private ProductInput readProductInput(Map<String, Object> request) {
        Object precoValue = request.get("preco");
        Object categoriaValue = request.get("categoriaId");
        if (!(precoValue instanceof Number) || !(categoriaValue instanceof Number)) {
            throw new IllegalArgumentException("Preço ou categoria inválidos");
        }
        return new ProductInput(asString(request.get("nome")), asString(request.get("descricao")),
                ((Number) precoValue).doubleValue(), ((Number) categoriaValue).intValue(),
                asString(request.get("foto")), asString(request.get("especificacoesTecnicas")));
    }

    private List<Map<String, Object>> normalizeProducts(List<Map<String, Object>> products) {
        List<Map<String, Object>> normalized = new java.util.ArrayList<>(products.size());
        for (Map<String, Object> product : products) {
            normalized.add(normalizeProduct(product));
        }
        return normalized;
    }

    private Map<String, Object> normalizeProduct(Map<String, Object> product) {
        Map<String, Object> normalized = new LinkedHashMap<>();
        normalized.put("id", columnValue(product, "id"));
        normalized.put("nome", columnValue(product, "nome"));
        normalized.put("descricao", columnValue(product, "descricao"));
        normalized.put("preco", columnValue(product, "preco"));
        normalized.put("categoria_id", columnValue(product, "categoria_id"));
        normalized.put("status_produto", columnValue(product, "status_produto"));
        normalized.put("fotoUrl", columnValue(product, "fotoUrl"));
        if (product.keySet().stream().anyMatch(key -> key.equalsIgnoreCase("especificacoes_tecnicas"))) {
            normalized.put("especificacoes_tecnicas", columnValue(product, "especificacoes_tecnicas"));
        }
        return normalized;
    }

    private Object columnValue(Map<String, Object> row, String name) {
        for (Map.Entry<String, Object> column : row.entrySet()) {
            if (name.equalsIgnoreCase(column.getKey())) return column.getValue();
        }
        return null;
    }

    private String validateProduct(ProductInput input) {
        if (input.nome == null || input.nome.trim().isEmpty() || input.nome.length() > 100) {
            return "Nome obrigatório (máximo de 100 caracteres)";
        }
        if (input.descricao != null && input.descricao.length() > 255) {
            return "Descrição acima do limite de 255 caracteres";
        }
        if (input.preco == null || !Double.isFinite(input.preco) || input.preco < 0
                || input.preco > 99999999.99) {
            return "Preço inválido";
        }
        if (input.categoriaId == null || input.categoriaId <= 0
                || jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Categoria WHERE id = ?", Integer.class,
                        input.categoriaId) == 0) {
            return "Categoria inválida";
        }
        if (input.especificacoesTecnicas != null && input.especificacoesTecnicas.length() > 10000) {
            return "Especificações acima do limite permitido";
        }
        if (input.fotoUrl != null && input.fotoUrl.length() > 7 * 1024 * 1024) {
            return "Imagem acima do limite permitido";
        }
        return null;
    }

    private String asString(Object value) {
        if (value == null) return null;
        if (!(value instanceof String)) throw new IllegalArgumentException("Campo textual inválido");
        return (String) value;
    }

    private static final class ProductInput {
        private final String nome;
        private final String descricao;
        private final Double preco;
        private final Integer categoriaId;
        private final String fotoUrl;
        private final String especificacoesTecnicas;

        private ProductInput(String nome, String descricao, Double preco, Integer categoriaId,
                             String fotoUrl, String especificacoesTecnicas) {
            this.nome = nome;
            this.descricao = descricao;
            this.preco = preco;
            this.categoriaId = categoriaId;
            this.fotoUrl = fotoUrl;
            this.especificacoesTecnicas = especificacoesTecnicas;
        }
    }






}