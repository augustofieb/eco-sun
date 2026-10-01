package com.ecosun.config;

import com.ecosun.entity.Usuario;
import com.ecosun.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.bootstrap-admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.trim().isEmpty()
                || adminPassword == null || adminPassword.length() < 16) {
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();
        if (!usuarioRepository.existsByEmail(normalizedEmail)) {
            Usuario admin = new Usuario();
            admin.setNome("Admin");
            admin.setEmail(normalizedEmail);
            admin.setSenha(passwordEncoder.encode(adminPassword));
            admin.setNivelAcesso("ADMIN");
            admin.setDataCadastro(LocalDateTime.now());
            admin.setStatusUsuario("ATIVO");
            usuarioRepository.save(admin);
        }
    }
}
