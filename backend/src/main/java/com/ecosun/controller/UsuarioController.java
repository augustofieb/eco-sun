package com.ecosun.controller;

import com.ecosun.entity.Usuario;
import com.ecosun.entity.Preferencias;
import com.ecosun.repository.UsuarioRepository;
import com.ecosun.repository.PreferenciasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PreferenciasRepository preferenciasRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Integer id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Integer id, @RequestBody Usuario usuario) {
        return usuarioRepository.findById(id)
                .map(existing -> {
                    existing.setNome(usuario.getNome());
                    existing.setEmail(usuario.getEmail());
                    if (usuario.getSenha() != null && !usuario.getSenha().isEmpty()) {
                        existing.setSenha(passwordEncoder.encode(usuario.getSenha()));
                    }
                    return ResponseEntity.ok(usuarioRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-admin")
    public ResponseEntity<Usuario> toggleAdmin(@PathVariable Integer id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    String newLevel = "ADMIN".equals(usuario.getNivelAcesso()) ? "CLIENTE" : "ADMIN";
                    usuario.setNivelAcesso(newLevel);
                    return ResponseEntity.ok(usuarioRepository.save(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Integer id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<Usuario> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/preferencias")
    public ResponseEntity<Map<String, String>> getPreferencias(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        
        if (usuario.isPresent()) {
            Optional<Preferencias> prefs = preferenciasRepository.findByUsuario(usuario.get());
            String tema = prefs.map(Preferencias::getTema).orElse("light");
            return ResponseEntity.ok(Map.of("tema", tema));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/preferencias")
    public ResponseEntity<Map<String, String>> updatePreferencias(
            @RequestBody Map<String, String> preferencias, 
            Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        
        if (usuario.isPresent()) {
            Preferencias prefs = preferenciasRepository.findByUsuario(usuario.get())
                    .orElse(new Preferencias(usuario.get(), "light"));
            
            if (preferencias.containsKey("tema")) {
                prefs.setTema(preferencias.get("tema"));
            }
            
            preferenciasRepository.save(prefs);
            return ResponseEntity.ok(Map.of("tema", prefs.getTema()));
        }
        
        return ResponseEntity.notFound().build();
    }
}