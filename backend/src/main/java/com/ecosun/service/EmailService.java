package com.ecosun.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.email.provider:smtp}")
    private String emailProvider;

    @Value("${app.email.resend.api-key:}")
    private String resendApiKey;

    @Value("${app.email.resend.from:}")
    private String resendFrom;

    public void sendPasswordResetEmail(String email, String tempPassword) {
        if ("smtp".equalsIgnoreCase(emailProvider)
            && (mailUsername == null || mailUsername.trim().isEmpty())) {
            throw new RuntimeException("MAIL_USERNAME não foi configurado no servidor");
        }

        try {
            String subject = "ECO SUN - Recuperação de Senha";
            String text = "Sua senha temporária é: " + tempPassword + "\nPor favor, faça login e altere sua senha.";

            if ("resend".equalsIgnoreCase(emailProvider)) {
                sendWithResend(email, subject, text);
            } else if ("brevo".equalsIgnoreCase(emailProvider)) {
                sendWithBrevo(email, subject, text);
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
            }
        } catch (Exception e) {
            logger.error("Falha ao enviar recuperação para {}: {}", email, e.getMessage(), e);
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            throw new RuntimeException("Falha no envio de email: " + reason, e);
        }
    }

    private void sendWithResend(String email, String subject, String text) {
        if (resendApiKey == null || resendApiKey.trim().isEmpty()) {
            throw new RuntimeException("RESEND_API_KEY não foi configurada no servidor");
        }
        if (resendFrom == null || resendFrom.trim().isEmpty()) {
            throw new RuntimeException("RESEND_FROM não foi configurado no servidor");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("from", resendFrom);
        body.put("to", new String[]{email});
        body.put("subject", subject);
        body.put("text", text);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(resendApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = new RestTemplate().postForEntity(
                "https://api.resend.com/emails",
                new HttpEntity<>(body, headers),
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Resend retornou HTTP " + response.getStatusCodeValue());
        }
    }

    private void sendWithBrevo(String email, String subject, String text) {
        String apiKey = System.getenv("BREVO_API_KEY");
        String from = System.getenv("BREVO_FROM");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new RuntimeException("BREVO_API_KEY não foi configurada no servidor");
        }
        if (from == null || from.trim().isEmpty()) {
            throw new RuntimeException("BREVO_FROM não foi configurado no servidor");
        }

        Map<String, Object> sender = new HashMap<>();
        sender.put("email", from);

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("email", email);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", sender);
        body.put("to", new Map[]{recipient});
        body.put("subject", subject);
        body.put("textContent", text);

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = new RestTemplate().postForEntity(
                "https://api.brevo.com/v3/smtp/email",
                new HttpEntity<>(body, headers),
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Brevo retornou HTTP " + response.getStatusCodeValue());
        }
    }
}