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
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto FROM Produto WHERE status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(produtos);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<?> getProdutosByCategoria(@PathVariable Integer categoriaId) {
        try {
            String sql = "SELECT id, nome, descricao, preco, categoria_id, status_produto FROM Produto WHERE categoria_id = ? AND status_produto = 'ATIVO'";
            List<Map<String, Object>> produtos = jdbcTemplate.queryForList(sql, categoriaId);
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
            
            String sql = "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto) VALUES (?, ?, ?, ?, 'ATIVO')";
            jdbcTemplate.update(sql, nome, descricao, preco, categoriaId);
            
            return ResponseEntity.ok("{\"message\":\"Produto criado com sucesso\"}");
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