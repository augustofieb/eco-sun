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
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllProdutos() {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas FROM Produto WHERE status_produto = 'ATIVO'";
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
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduto(@RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String descricao = (String) request.get("descricao");
            Double preco = ((Number) request.get("preco")).doubleValue();
            Integer categoriaId = ((Number) request.get("categoriaId")).intValue();
            String fotoUrl = (String) request.get("foto");
            String especificacoesTecnicas = (String) request.get("especificacoesTecnicas");
            // Garantir que especificacoesTecnicas não seja null
            if (especificacoesTecnicas == null) {
                especificacoesTecnicas = "{}";
            }

            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas) VALUES (?, ?, ?, ?, 'ATIVO', ?, ?)";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoUrl, especificacoesTecnicas);

            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
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
                byte[] fotoBytes = foto.getBytes();
                fotoBase64 = "data:" + foto.getContentType() + ";base64," + Base64.getEncoder().encodeToString(fotoBytes);
            }

            // Garantir que especificacoesTecnicas não seja null
            if (especificacoesTecnicas == null || especificacoesTecnicas.trim().isEmpty()) {
                especificacoesTecnicas = "{}";
            }

            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas) VALUES (?, ?, ?, ?, 'ATIVO', ?, ?)";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoBase64, especificacoesTecnicas);

            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Erro ao processar imagem: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduto(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String descricao = (String) request.get("descricao");
            Double preco = ((Number) request.get("preco")).doubleValue();
            Integer categoriaId = ((Number) request.get("categoriaId")).intValue();
            String fotoUrl = (String) request.get("foto");
            String especificacoesTecnicas = (String) request.get("especificacoesTecnicas");
            // Garantir que especificacoesTecnicas não seja null
            if (especificacoesTecnicas == null) {
                especificacoesTecnicas = "{}";
            }

            String sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, fotoUrl = ?, especificacoes_tecnicas = ? WHERE id = ?";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoUrl, especificacoesTecnicas, id);

            return ResponseEntity.ok("{\"message\":\"Produto atualizado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
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
                byte[] fotoBytes = foto.getBytes();
                fotoBase64 = "data:" + foto.getContentType() + ";base64," + Base64.getEncoder().encodeToString(fotoBytes);
            }

            // Garantir que especificacoesTecnicas não seja null
            if (especificacoesTecnicas == null || especificacoesTecnicas.trim().isEmpty()) {
                especificacoesTecnicas = "{}";
            }

            String sql;
            if (fotoBase64 != null) {
                sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, fotoUrl = ?, especificacoes_tecnicas = ? WHERE id = ?";
                jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, fotoBase64, especificacoesTecnicas, id);
            } else {
                sql = "UPDATE Produto SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, especificacoes_tecnicas = ? WHERE id = ?";
                jdbcTemplate.update(sql, nome, descricao, preco, categoriaId, especificacoesTecnicas, id);
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
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas FROM Produto WHERE id = ? AND status_produto = 'ATIVO'";
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






}