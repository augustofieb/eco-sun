package com.ecosun.service;

import com.ecosun.dto.*;
import com.ecosun.entity.Usuario;
import com.ecosun.entity.PasswordResetToken;
import com.ecosun.repository.PasswordResetTokenRepository;
import com.ecosun.repository.UsuarioRepository;
import com.ecosun.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, LocalDateTime> passwordResetRequests = new ConcurrentHashMap<>();
    private static final int RESET_TOKEN_MINUTES = 30;
    private static final int RESET_REQUEST_COOLDOWN_SECONDS = 60;

    public AuthResponse login(LoginRequest request) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(request.getEmail());
        if (usuario.isPresent() && passwordEncoder.matches(request.getSenha(), usuario.get().getSenha())) {
            if ("INATIVO".equals(usuario.get().getStatusUsuario())) {
                throw new RuntimeException("Conta desativada. Entre em contato com o administrador.");
            }
            String token = jwtUtil.generateToken(usuario.get().getEmail());
            return new AuthResponse(token, usuario.get().getId(), usuario.get().getNome(), usuario.get().getEmail(), usuario.get().getNivelAcesso(), usuario.get().getStatusUsuario());
        }
        throw new RuntimeException("Credenciais inválidas");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        System.out.println("Tentando registrar usuário: " + request.getEmail());
        validatePassword(request.getSenha());
        
        try {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email já cadastrado");
            }
        } catch (Exception e) {
            System.out.println("Erro ao verificar email: " + e.getMessage());
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setNivelAcesso("CLIENTE");
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setStatusUsuario("ATIVO");

        try {
            Usuario savedUser = usuarioRepository.save(usuario);
            System.out.println("Usuário salvo com ID: " + savedUser.getId());
            String token = jwtUtil.generateToken(usuario.getEmail());
            return new AuthResponse(token, savedUser.getId(), usuario.getNome(), usuario.getEmail(), usuario.getNivelAcesso(), usuario.getStatusUsuario());
        } catch (Exception e) {
            System.out.println("Erro ao salvar usuário: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar conta: " + e.getMessage());
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastRequest = passwordResetRequests.get(normalizedEmail);
        if (lastRequest != null && lastRequest.plusSeconds(RESET_REQUEST_COOLDOWN_SECONDS).isAfter(now)) {
            return;
        }
        passwordResetRequests.put(normalizedEmail, now);

        Optional<Usuario> usuario = usuarioRepository.findByEmail(normalizedEmail);
        if (usuario.isEmpty()) {
            return;
        }

        passwordResetTokenRepository.deleteAllByUsuario(usuario.get());
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsuario(usuario.get());
        resetToken.setTokenHash(hashToken(token));
        resetToken.setCreatedAt(now);
        resetToken.setExpiresAt(now.plusMinutes(RESET_TOKEN_MINUTES));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(email, usuario.get().getNome(), token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        validatePassword(request.getSenha());
        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            throw new RuntimeException("Token inválido ou expirado");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHash(hashToken(request.getToken().trim()))
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado"));
        LocalDateTime now = LocalDateTime.now();
        if (resetToken.getUsedAt() != null || !resetToken.getExpiresAt().isAfter(now)) {
            throw new RuntimeException("Token inválido ou expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuarioRepository.save(usuario);
        resetToken.setUsedAt(now);
        passwordResetTokenRepository.save(resetToken);
    }

    private void validatePassword(String senha) {
        if (senha == null || senha.length() < 8
                || !senha.matches(".*[A-Z].*")
                || !senha.matches(".*[a-z].*")
                || !senha.matches(".*\\d.*")) {
            throw new RuntimeException("A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número");
        }
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte value : digest) {
                hash.append(String.format("%02x", value));
            }
            return hash.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível", e);
        }
    }

    public void makeAdmin(Integer userId) {
        Optional<Usuario> usuario = usuarioRepository.findById(userId);
        if (usuario.isPresent()) {
            usuario.get().setNivelAcesso("ADMIN");
            usuarioRepository.save(usuario.get());
        } else {
            throw new RuntimeException("Usuário não encontrado");
        }
    }
}