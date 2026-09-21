package com.ecosun.controller;

import com.ecosun.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void deveEncaminharEmailEConfirmarRecuperacao() {
        ResponseEntity<String> response = authController.forgotPassword(
                Map.of("email", "cliente@exemplo.com"));

        verify(authService).forgotPassword("cliente@exemplo.com");
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Email de recuperação enviado", response.getBody());
    }

    @Test
    void deveRetornarBadRequestQuandoServicoFalhar() {
        doThrow(new RuntimeException("Email não encontrado"))
                .when(authService).forgotPassword("inexistente@exemplo.com");

        ResponseEntity<String> response = authController.forgotPassword(
                Map.of("email", "inexistente@exemplo.com"));

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Email não encontrado", response.getBody());
    }
}