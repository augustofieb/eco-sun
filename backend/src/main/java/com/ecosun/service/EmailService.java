package com.ecosun.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.host}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendPasswordResetEmail(String email, String tempPassword) {
        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            throw new RuntimeException("MAIL_USERNAME não foi configurado no servidor");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("ECO SUN - Recuperação de Senha");
        message.setText("Sua senha temporária é: " + tempPassword + "\nPor favor, faça login e altere sua senha.");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Falha SMTP ao enviar recuperação para {}: {}", email, e.getMessage(), e);
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            throw new RuntimeException("Falha SMTP em " + mailHost + ": " + reason, e);
        }
    }
}