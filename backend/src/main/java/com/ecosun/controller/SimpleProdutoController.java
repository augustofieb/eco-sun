package com.ecosun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/produtos")
public class SimpleProdutoController {
    
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