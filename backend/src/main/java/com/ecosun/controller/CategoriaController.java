package com.ecosun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllCategorias() {
        try {
            String sql = "SELECT id, nome, descricao FROM Categoria";
            List<Map<String, Object>> categorias = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchCategorias(@RequestParam String query) {
        try {
            String sql = "SELECT id, nome, descricao FROM Categoria WHERE nome LIKE ? OR descricao LIKE ? OR CAST(id AS VARCHAR) LIKE ?";
            String searchPattern = "%" + query + "%";
            List<Map<String, Object>> categorias = jdbcTemplate.queryForList(sql, searchPattern, searchPattern, searchPattern);
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategoria(@RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String descricao = (String) request.get("descricao");
            
            String sql = "INSERT INTO Categoria (nome, descricao) VALUES (?, ?)";
            jdbcTemplate.update(sql, nome, descricao);
            
            return ResponseEntity.ok("{\"message\":\"Categoria criada com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }
}