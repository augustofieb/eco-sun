package com.ecosun.repository;

import com.ecosun.entity.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrcamentoRepository extends JpaRepository<Orcamento, Integer> {
    List<Orcamento> findByUsuarioId(Integer usuarioId);
    List<Orcamento> findByStatus(String status);
}