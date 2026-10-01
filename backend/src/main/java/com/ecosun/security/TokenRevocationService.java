package com.ecosun.security;

import com.ecosun.entity.RevokedToken;
import com.ecosun.repository.RevokedTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Service
public class TokenRevocationService {
    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtUtil jwtUtil;

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository, JwtUtil jwtUtil) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.jwtUtil = jwtUtil;
    }

    public boolean isRevoked(String token) {
        return revokedTokenRepository.existsByTokenHash(hashToken(token));
    }

    @Transactional
    public void revoke(String token) {
        Date now = new Date();
        Date expiration = jwtUtil.getExpirationFromToken(token);
        if (!expiration.after(now)) return;

        revokedTokenRepository.deleteAllByExpiresAtBefore(now);
        String tokenHash = hashToken(token);
        if (!revokedTokenRepository.existsByTokenHash(tokenHash)) {
            RevokedToken revokedToken = new RevokedToken();
            revokedToken.setTokenHash(tokenHash);
            revokedToken.setExpiresAt(expiration);
            revokedTokenRepository.save(revokedToken);
        }
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte value : digest) hash.append(String.format("%02x", value));
            return hash.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível", e);
        }
    }
}