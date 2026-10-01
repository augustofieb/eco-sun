package com.ecosun.repository;

import com.ecosun.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByTokenHash(String tokenHash);
    void deleteAllByExpiresAtBefore(Date date);
}