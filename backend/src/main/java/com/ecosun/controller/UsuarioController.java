package com.ecosun.controller;

import com.ecosun.entity.Usuario;
import com.ecosun.repository.UsuarioRepository;
import com.ecosun.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Optional<Usuario> getUsuarioFromToken(String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return Optional.empty();
            }

            String token = authorizationHeader.substring("Bearer ".length()).trim();
            if (token.isEmpty() || !jwtUtil.validateToken(token)) {
                return Optional.empty();
            }

            String email = jwtUtil.getEmailFromToken(token);
            return usuarioRepository.findByEmail(email);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

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
            Optional<Usuario> usuarioOpt = getUsuarioFromToken(token);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("tema", "light"));
            }

            Integer usuarioId = usuarioOpt.get().getId();
            List<String> temas = jdbcTemplate.queryForList(
                    "SELECT tema FROM preferencias WHERE usuario_id = ?",
                    String.class,
                    usuarioId
            );

            String tema = temas.isEmpty() ? "light" : temas.get(0);
            return ResponseEntity.ok(Map.of("tema", tema.equalsIgnoreCase("dark") ? "dark" : "light"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("tema", "light"));
        }
    }

    @PutMapping("/preferencias")
    public ResponseEntity<?> savePreferencias(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> preferencias) {
        try {
            Optional<Usuario> usuarioOpt = getUsuarioFromToken(token);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("message", "Usuário não autenticado"));
            }

            String tema = String.valueOf(preferencias.getOrDefault("tema", "light"));
            String temaNormalizado = tema.equalsIgnoreCase("dark") ? "dark" : "light";
            Integer usuarioId = usuarioOpt.get().getId();

            Integer total = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM preferencias WHERE usuario_id = ?",
                    Integer.class,
                    usuarioId
            );

            if (total != null && total > 0) {
                jdbcTemplate.update("UPDATE preferencias SET tema = ? WHERE usuario_id = ?", temaNormalizado, usuarioId);
            } else {
                jdbcTemplate.update("INSERT INTO preferencias (usuario_id, tema) VALUES (?, ?)", usuarioId, temaNormalizado);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Preferências salvas");
            response.put("tema", temaNormalizado);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Erro ao salvar preferências"));
        }
    }
}