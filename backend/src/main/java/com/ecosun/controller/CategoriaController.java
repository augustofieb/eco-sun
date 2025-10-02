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
            String sql = "SELECT id, nome, descricao, especificacoes_obrigatorias FROM Categoria";
            List<Map<String, Object>> categorias = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            e.printStackTrace();
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
            String especificacoes = (String) request.get("especificacoes");
            
            String sql = "INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql, nome, descricao, especificacoes);
            
            return ResponseEntity.ok("{\"message\":\"Categoria criada com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategoria(@PathVariable Integer id) {
        try {
            // Verificar se há produtos usando esta categoria
            String checkSql = "SELECT COUNT(*) FROM Produto WHERE categoria_id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
            
            if (count > 0) {
                return ResponseEntity.badRequest().body("Não é possível deletar categoria com produtos associados");
            }
            
            String sql = "DELETE FROM Categoria WHERE id = ?";
            jdbcTemplate.update(sql, id);
            return ResponseEntity.ok("{\"message\":\"Categoria deletada\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }
}