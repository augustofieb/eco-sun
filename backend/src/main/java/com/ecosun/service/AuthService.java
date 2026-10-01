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
import java.util.regex.Pattern;

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
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public AuthResponse login(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getSenha() == null) {
            throw new RuntimeException("Credenciais inválidas");
        }
        String email = request.getEmail().trim().toLowerCase();
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
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
        if (request == null || request.getNome() == null || request.getNome().trim().isEmpty()
                || request.getNome().trim().length() > 100) {
            throw new RuntimeException("Nome inválido");
        }
        String email = normalizeEmail(request.getEmail());
        validatePassword(request.getSenha());
        if (usuarioRepository.existsByEmail(email)) throw new RuntimeException("Email já cadastrado");

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setNivelAcesso("CLIENTE");
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setStatusUsuario("ATIVO");

        try {
            Usuario savedUser = usuarioRepository.save(usuario);
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return new AuthResponse(token, savedUser.getId(), savedUser.getNome(), savedUser.getEmail(), savedUser.getNivelAcesso(), savedUser.getStatusUsuario());
        } catch (Exception e) {
            throw new RuntimeException("Não foi possível criar a conta");
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
                || senha.getBytes(StandardCharsets.UTF_8).length > 72
                || !senha.matches(".*[A-Z].*")
                || !senha.matches(".*[a-z].*")
                || !senha.matches(".*\\d.*")) {
            throw new RuntimeException("A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número");
        }
    }

    private String normalizeEmail(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        if (normalized.length() > 100 || !EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new RuntimeException("Email inválido");
        }
        return normalized;
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