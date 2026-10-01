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

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoriaById(@PathVariable Integer id) {
        try {
            String sql = "SELECT id, nome, descricao, especificacoes_obrigatorias FROM Categoria WHERE id = ?";
            List<Map<String, Object>> categorias = jdbcTemplate.queryForList(sql, id);
            if (categorias.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(categorias.get(0));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
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
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategoria(@RequestBody Map<String, Object> request) {
        try {
            String nome = asString(request.get("nome"));
            String descricao = asString(request.get("descricao"));
            String especificacoes = asString(request.get("especificacoes"));
            String validationError = validateCategory(nome, descricao, especificacoes);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);
            
            String sql = "INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql, nome, descricao, especificacoes);
            
            return ResponseEntity.ok("{\"message\":\"Categoria criada com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dados de categoria inválidos");
        }
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategoria(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nome = asString(request.get("nome"));
            String descricao = asString(request.get("descricao"));
            String especificacoes = asString(request.get("especificacoes"));
            String validationError = validateCategory(nome, descricao, especificacoes);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);
            
            String sql = "UPDATE Categoria SET nome = ?, descricao = ?, especificacoes_obrigatorias = ? WHERE id = ?";
            jdbcTemplate.update(sql, nome, descricao, especificacoes, id);
            
            return ResponseEntity.ok("{\"message\":\"Categoria atualizada com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dados de categoria inválidos");
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategoria(@PathVariable Integer id) {
        try {
            // Verificar se há produtos usando esta categoria
            String checkSql = "SELECT COUNT(*) FROM Produto WHERE categoria_id = ? AND status_produto = 'ativo'";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
            
            if (count > 0) {
                return ResponseEntity.badRequest().body("Não é possível deletar categoria com produtos associados");
            }
            
            String sql = "DELETE FROM Categoria WHERE id = ?";
            jdbcTemplate.update(sql, id);
            return ResponseEntity.ok("{\"message\":\"Categoria deletada\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Não foi possível excluir a categoria");
        }
    }

    private String validateCategory(String nome, String descricao, String especificacoes) {
        if (nome == null || nome.trim().isEmpty() || nome.length() > 100) {
            return "Nome obrigatório (máximo de 100 caracteres)";
        }
        if (descricao != null && descricao.length() > 255) {
            return "Descrição acima do limite de 255 caracteres";
        }
        if (especificacoes != null && especificacoes.length() > 10000) {
            return "Especificações acima do limite permitido";
        }
        return null;
    }

    private String asString(Object value) {
        if (value == null) return null;
        if (!(value instanceof String)) throw new IllegalArgumentException("Campo textual inválido");
        return (String) value;
    }
}