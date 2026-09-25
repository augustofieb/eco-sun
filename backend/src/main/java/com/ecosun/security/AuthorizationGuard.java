package com.ecosun.security;

import com.ecosun.entity.Avaliacao;
import com.ecosun.entity.Orcamento;
import com.ecosun.repository.AvaliacaoRepository;
import com.ecosun.repository.OrcamentoRepository;
import com.ecosun.repository.UsuarioRepository;
import org.springframework.stereotype.Component;

@Component("authorizationGuard")
public class AuthorizationGuard {

    private final OrcamentoRepository orcamentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public AuthorizationGuard(OrcamentoRepository orcamentoRepository,
                              AvaliacaoRepository avaliacaoRepository,
                              UsuarioRepository usuarioRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private String authEmail() {
        return AuthorizationUtils.getAuthenticatedEmail();
    }

    // O JWT identifica o usuário pelo email. Resolva seu ID no banco e compare-o
    // ao usuarioId do orçamento, que é o vínculo persistido do recurso.

    public boolean canWriteOrcamento(Orcamento orcamento) {
        if (orcamento == null) return false;
        String email = authEmail();
        if (email == null) return false;

        if (orcamento.getUsuarioId() == null) return false;
        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getId().equals(orcamento.getUsuarioId()))
                .orElse(false);
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
        if (avaliacao == null || avaliacao.getUsuarioId() == null) return false;
        String email = authEmail();
        if (email == null) return false;

        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getId() != null && usuario.getId().equals(avaliacao.getUsuarioId()))
                .orElse(false);
    }

    public boolean canUpdateAvaliacao(Integer id, Avaliacao avaliacao) {
        if (id == null || avaliacao == null) return false;
        String email = authEmail();
        if (email == null) return false;

        return usuarioRepository.findByEmail(email)
                .flatMap(usuario -> avaliacaoRepository.findById(id)
                        .filter(existing -> usuario.getId() != null
                                && usuario.getId().equals(existing.getUsuarioId())
                                && usuario.getId().equals(avaliacao.getUsuarioId())))
                .isPresent();
    }

    public boolean canDeleteAvaliacao(Integer id) {
        if (id == null) return false;
        String email = authEmail();
        if (email == null) return false;

        return usuarioRepository.findByEmail(email)
                .flatMap(usuario -> avaliacaoRepository.findById(id)
                        .filter(existing -> usuario.getId() != null
                                && usuario.getId().equals(existing.getUsuarioId())))
                .isPresent();
    }
}

