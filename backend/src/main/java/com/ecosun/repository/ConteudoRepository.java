package com.ecosun.repository;

import com.ecosun.entity.Conteudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {
    Optional<Conteudo> findByChave(String chave);
}