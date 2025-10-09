package com.ecosun.service;

import com.ecosun.dto.*;
import com.ecosun.entity.Usuario;
import com.ecosun.repository.UsuarioRepository;
import com.ecosun.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

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

    public void forgotPassword(String email) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isPresent()) {
            String tempPassword = UUID.randomUUID().toString().substring(0, 8);
            usuario.get().setSenha(passwordEncoder.encode(tempPassword));
            usuario.get().setStatusUsuario("TROCAR_SENHA");
            usuarioRepository.save(usuario.get());

            emailService.sendPasswordResetEmail(email, tempPassword);
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