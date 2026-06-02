package com.ecosun.security;

import com.ecosun.entity.Avaliacao;
import com.ecosun.entity.Orcamento;
import com.ecosun.repository.AvaliacaoRepository;
import com.ecosun.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("com.ecosun.security.AuthorizationGuard")
public class AuthorizationGuard {

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    private String authEmail() {
        return AuthorizationUtils.getAuthenticatedEmail();
    }

    // Na model atual, o token não traz usuarioId, apenas email.
    // Ownership será aproximada por comparação do email com o campo email do recurso.
    // (Se no futuro retornar usuarioId/claims no token, ajustar.)

    public boolean canWriteOrcamento(Orcamento orcamento) {
        if (orcamento == null) return false;
        String email = authEmail();
        if (email == null) return false;

        // Orcamento possui campo email no entity
        return email.equalsIgnoreCase(orcamento.getEmail());
    }

    public boolean canUpdateOrcamento(Integer id, Orcamento orcamento) {
        if (id == null || orcamento == null) return false;
        String email = authEmail();
        if (email == null) return false;

        // Busca o registro existente e compara o email
        return orcamentoRepository.findById(id)
                .map(o -> email.equalsIgnoreCase(o.getEmail()))
                .orElse(false);
    }

    public boolean canDeleteOrcamento(Integer id) {
        if (id == null) return false;
        String email = authEmail();
        if (email == null) return false;

        return orcamentoRepository.findById(id)
                .map(o -> email.equalsIgnoreCase(o.getEmail()))
                .orElse(false);
    }

    public boolean canWriteAvaliacao(Avaliacao avaliacao) {
        // Ownership para Avaliacao requer cruzar usuarioId do token com usuarioId da entidade.
        // Nesta base atual, o JWT carrega somente email; precisamos mapear email -> usuarioId.
        // Para não introduzir brecha, bloqueamos escrita por USER, permitindo apenas ADMIN.
        // O ADMIN já é coberto via @PreAuthorize("hasRole('ADMIN') ...").
        return false;
    }

    public boolean canUpdateAvaliacao(Integer id, Avaliacao avaliacao) {
        // Mesma regra de canWriteAvaliacao: evitar ownership incorreto sem mapear usuarioId do token.
        return false;
    }

    public boolean canDeleteAvaliacao(Integer id) {
        return false;
    }
}

