package com.ecosun.repository;

import com.ecosun.entity.Preferencias;
import com.ecosun.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PreferenciasRepository extends JpaRepository<Preferencias, Long> {
    Optional<Preferencias> findByUsuario(Usuario usuario);
}