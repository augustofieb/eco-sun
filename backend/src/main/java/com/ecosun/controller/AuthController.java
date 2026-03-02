package com.ecosun.controller;

import com.ecosun.dto.*;
import com.ecosun.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            authService.forgotPassword(request.get("email"));
            return ResponseEntity.ok("Email de recuperação enviado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao enviar email");
        }
    }

    @PatchMapping("/make-admin/{userId}")
    public ResponseEntity<String> makeAdmin(@PathVariable Integer userId) {
        try {
            authService.makeAdmin(userId);
            return ResponseEntity.ok("Usuário promovido a admin");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao promover usuário");
        }
    }
}