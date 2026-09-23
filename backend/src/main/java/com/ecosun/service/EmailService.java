package com.ecosun.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    @Value("${app.email.brevo.api-key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    @Value("${app.email.brevo.from:${BREVO_FROM:}}")
    private String brevoFrom;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String email, String nome, String token) {
        try {
            validateProviderConfiguration();
            String subject = "Redefinição de senha";
            String resetLink = frontendUrl.replaceAll("/$", "") + "/reset-password?token=" + token;
            String text = "Olá!\n\n"
                    + "Recebemos uma solicitação para redefinir a senha da sua conta.\n\n"
                    + "Acesse o link abaixo para criar uma nova senha:\n"
                    + resetLink + "\n\n"
                    + "Este link é válido por 30 minutos e pode ser utilizado apenas uma vez.\n\n"
                    + "Se você não solicitou essa alteração, ignore este e-mail.\n\n"
                    + "Atenciosamente,\n\nECO SUN";
            String html = "<!doctype html><html lang=\"pt-BR\"><body style=\"margin:0;background:#f4f7f5;font-family:Arial,sans-serif;color:#24332a;\">"
                    + "<div style=\"max-width:560px;margin:32px auto;padding:32px 24px;background:#ffffff;border:1px solid #dce8df;border-radius:8px;\">"
                    + "<p style=\"margin:0 0 24px;font-size:16px;\">Olá" + (nome == null || nome.trim().isEmpty() ? "" : ", " + escapeHtml(nome.trim())) + "!</p>"
                    + "<p style=\"font-size:16px;line-height:1.6;\">Recebemos uma solicitação para redefinir a senha da sua conta.</p>"
                    + "<p style=\"font-size:16px;line-height:1.6;\">Clique no botão abaixo para criar uma nova senha:</p>"
                    + "<p style=\"margin:28px 0;text-align:center;\"><a href=\"" + escapeHtml(resetLink) + "\" style=\"display:inline-block;padding:14px 24px;background:#26734d;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">ALTERAR MINHA SENHA</a></p>"
                    + "<p style=\"font-size:14px;line-height:1.6;color:#53635a;\">Este link é válido por <strong>30 minutos</strong> e pode ser utilizado apenas uma vez.</p>"
                    + "<p style=\"font-size:14px;line-height:1.6;color:#53635a;\">Se você não solicitou essa alteração, ignore este e-mail.</p>"
                    + "<p style=\"margin:24px 0 0;font-size:14px;\">Atenciosamente,<br><strong>ECO SUN</strong></p>"
                    + "</div></body></html>";

            if ("resend".equalsIgnoreCase(emailProvider)) {
                sendWithResend(email, subject, text, html);
            } else if ("brevo".equalsIgnoreCase(emailProvider)) {
                sendWithBrevo(email, subject, text, html);
            } else {
                MimeMessageHelper message = new MimeMessageHelper(mailSender.createMimeMessage(), true, "UTF-8");
                message.setTo(email);
                message.setSubject(subject);
                message.setText(text, html);
                mailSender.send(message.getMimeMessage());
            }
        } catch (Exception e) {
            logger.error("Falha ao enviar recuperação para {}: {}", email, e.getMessage(), e);
            String reason = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            throw new RuntimeException("Falha no envio de email: " + reason, e);
        }
    }

    private void sendWithResend(String email, String subject, String text, String html) {
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
        body.put("html", html);

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

    private void sendWithBrevo(String email, String subject, String text, String html) {
        Map<String, Object> sender = new HashMap<>();
        sender.put("email", brevoFrom);

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("email", email);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", sender);
        body.put("to", new Map[]{recipient});
        body.put("subject", subject);
        body.put("textContent", text);
        body.put("htmlContent", html);

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = new RestTemplate().postForEntity(
                "https://api.brevo.com/v3/smtp/email",
                new HttpEntity<>(body, headers),
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Brevo retornou HTTP " + response.getStatusCodeValue());
        }
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private void validateProviderConfiguration() {
        if ("resend".equalsIgnoreCase(emailProvider)) {
            if (isBlank(resendApiKey)) {
                throw new RuntimeException("RESEND_API_KEY não foi configurada no servidor");
            }
            if (isBlank(resendFrom)) {
                throw new RuntimeException("RESEND_FROM não foi configurada no servidor");
            }
            return;
        }
        if ("brevo".equalsIgnoreCase(emailProvider)) {
            if (isBlank(brevoApiKey)) {
                throw new RuntimeException("BREVO_API_KEY não foi configurada no servidor");
            }
            if (isBlank(brevoFrom)) {
                throw new RuntimeException("BREVO_FROM não foi configurada no servidor");
            }
            return;
        }
        if (!"smtp".equalsIgnoreCase(emailProvider)) {
            throw new RuntimeException("EMAIL_PROVIDER inválido: " + emailProvider + ". Use smtp, resend ou brevo");
        }
        if (isBlank(mailUsername)) {
            throw new RuntimeException("MAIL_USERNAME não foi configurado no servidor");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}