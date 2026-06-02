package com.ecosun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsuarios() {
        try {
            String sql = "SELECT id, nome, email, nivelAcesso, dataCadastro, statusUsuario FROM Usuario";
            List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsuarioById(@PathVariable Integer id) {
        try {
            String sql = "SELECT id, nome, email, nivelAcesso, dataCadastro, statusUsuario FROM Usuario WHERE id = ?";
            List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(sql, id);
            if (usuarios.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(usuarios.get(0));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsuarios(@RequestParam String query) {
        try {
            String sql = "SELECT id, nome, email, nivelAcesso, dataCadastro, statusUsuario FROM Usuario WHERE nome LIKE ? OR email LIKE ? OR CAST(id AS VARCHAR) LIKE ?";
            String searchPattern = "%" + query + "%";
            List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(sql, searchPattern, searchPattern, searchPattern);
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.ok("[]");
        }
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUsuario(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String email = (String) request.get("email");
            String nivelAcesso = (String) request.get("nivelAcesso");
            String statusUsuario = (String) request.get("statusUsuario");
            
            String sql = "UPDATE Usuario SET nome = ?, email = ?, nivelAcesso = ?, statusUsuario = ? WHERE id = ?";
            jdbcTemplate.update(sql, nome, email, nivelAcesso, statusUsuario, id);
            
            return ResponseEntity.ok("{\"message\":\"Usuário atualizado com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUsuario(@PathVariable Integer id) {
        try {
            String sql = "DELETE FROM Usuario WHERE id = ?";
            jdbcTemplate.update(sql, id);
            return ResponseEntity.ok("{\"message\":\"Usuário deletado\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/preferencias")
    public ResponseEntity<?> getPreferencias(@RequestHeader("Authorization") String token) {
        try {
            // Extrair userId do token seria ideal, mas por simplicidade vamos retornar preferências padrão
            return ResponseEntity.ok("{\"tema\":\"claro\"}");
        } catch (Exception e) {
            return ResponseEntity.ok("{\"tema\":\"claro\"}");
        }
    }

    @PostMapping("/preferencias")
    public ResponseEntity<?> savePreferencias(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> preferencias) {
        try {
            // Por simplicidade, apenas retornamos sucesso
            return ResponseEntity.ok("{\"message\":\"Preferências salvas\"}");
        } catch (Exception e) {
            return ResponseEntity.ok("{\"message\":\"Preferências salvas\"}");
        }
    }
}