package com.ecosun.config;

import com.ecosun.entity.Usuario;
import com.ecosun.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByEmail("admin@ecosun.com")) {
            Usuario admin = new Usuario();
            admin.setNome("Admin");
            admin.setEmail("admin@ecosun.com");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setNivelAcesso("ADMIN");
            admin.setDataCadastro(LocalDateTime.now());
            admin.setStatusUsuario("ATIVO");
            usuarioRepository.save(admin);
        }
    }
}
