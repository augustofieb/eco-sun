package com.ecosun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Base64;
import java.io.IOException;

@RestController
@RequestMapping("/produtos")
public class SimpleProdutoController {
    
    // Endpoints de conteúdo temporários
    @GetMapping("/conteudo/{chave}")
    public ResponseEntity<Map<String, String>> getConteudo(@PathVariable String chave) {
        Map<String, String> conteudoMap = new HashMap<>();
        conteudoMap.put("sobre", "A ECO SUN é uma empresa dedicada a fornecer soluções sustentáveis de energia solar para residências e empresas. Nossa missão é tornar a energia limpa acessível a todos.\n\nFundada em 2020, já ajudamos centenas de famílias a reduzirem sua pegada de carbono e economizarem na conta de luz.");
        conteudoMap.put("renovavel", "Economia: Reduza até 95% da sua conta de luz\nSustentabilidade: Energia limpa e renovável\nValorização: Aumenta o valor do seu imóvel\nIndependência: Menos dependência da rede elétrica\nDurabilidade: Painéis com vida útil de 25+ anos");
        conteudoMap.put("faq", "Quanto tempo dura a instalação?|A instalação residencial típica leva de 1 a 3 dias.\nFunciona em dias nublados?|Sim, os painéis geram energia mesmo com pouca luz solar.\nQual a garantia dos equipamentos?|Oferecemos 2 anos de garantia em todos os equipamentos.");
        
        String conteudo = conteudoMap.get(chave);
        if (conteudo != null) {
            Map<String, String> response = new HashMap<>();
            response.put("conteudo", conteudo);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/conteudo/{chave}")
    public ResponseEntity<Map<String, String>> updateConteudo(@PathVariable String chave, @RequestBody Map<String, String> request) {
        // Simulação de atualização (em memória)
        String novoConteudo = request.get("conteudo");
        Map<String, String> response = new HashMap<>();
        response.put("conteudo", novoConteudo);
        return ResponseEntity.ok(response);
    }
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllProdutos() {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl FROM Produto WHERE status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(produtos);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<?> getProdutosByCategoria(@PathVariable Integer categoriaId) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl FROM Produto WHERE categoria_id = ? AND status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, categoriaId);
            return ResponseEntity.ok(produtos);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProdutos(@RequestParam String query) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl FROM Produto WHERE nome LIKE ? OR descricao LIKE ? OR CAST(id AS VARCHAR) LIKE ?";
            String searchPattern = "%" + query + "%";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, searchPattern, searchPattern, searchPattern);
            return ResponseEntity.ok(produtos);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduto(@RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String descricao = (String) request.get("descricao");
            Double preco = ((Number) request.get("preco")).doubleValue();
            Integer categoriaId = ((Number) request.get("categoriaId")).intValue();
            String fotoUrl = (String) request.get("foto");
            
            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl) VALUES (?, ?, ?, ?, 'ATIVO', ?)";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoUrl);
            
            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> createProdutoWithUpload(
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam("categoriaId") Integer categoriaId,
            @RequestParam(value = "foto", required = false) MultipartFile foto) {
        try {
            String fotoBase64 = null;
            if (foto != null && !foto.isEmpty()) {
                byte[] fotoBytes = foto.getBytes();
                fotoBase64 = "data:" + foto.getContentType() + ";base64," + Base64.getEncoder().encodeToString(fotoBytes);
            }
            
            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl) VALUES (?, ?, ?, ?, 'ATIVO', ?)";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoBase64);
            
            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Erro ao processar imagem: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduto(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String descricao = (String) request.get("descricao");
            Double preco = ((Number) request.get("preco")).doubleValue();
            Integer categoriaId = ((Number) request.get("categoriaId")).intValue();
            String fotoUrl = (String) request.get("foto");
            
            String sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, fotoUrl = ? WHERE id = ?";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoUrl, id);
            
            return ResponseEntity.ok("{\"message\":\"Produto atualizado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @PutMapping("/upload/{id}")
    public ResponseEntity<?> updateProdutoWithUpload(
            @PathVariable Integer id,
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam("categoriaId") Integer categoriaId,
            @RequestParam(value = "foto", required = false) MultipartFile foto) {
        try {
            String fotoBase64 = null;
            if (foto != null && !foto.isEmpty()) {
                byte[] fotoBytes = foto.getBytes();
                fotoBase64 = "data:" + foto.getContentType() + ";base64," + Base64.getEncoder().encodeToString(fotoBytes);
            }
            
            String sql;
            if (fotoBase64 != null) {
                sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, fotoUrl = ? WHERE id = ?";
                jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoBase64, id);
            } else {
                sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ? WHERE id = ?";
                jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, id);
            }
            
            return ResponseEntity.ok("{\"message\":\"Produto atualizado com sucesso\"}");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Erro ao processar imagem: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProdutoById(@PathVariable Integer id) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl FROM Produto WHERE id = ? AND status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, id);
            if (produtos.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(produtos.get(0));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduto(@PathVariable Integer id) {
        try {
            String sql = "DELETE FROM Produto WHERE id = ?";
            jdbcTemplate.update(sql, id);
            return ResponseEntity.ok("{\"message\":\"Produto deletado\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }
}