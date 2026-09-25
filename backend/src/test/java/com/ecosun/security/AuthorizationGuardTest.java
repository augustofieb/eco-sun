package com.ecosun.security;

import com.ecosun.entity.Orcamento;
import com.ecosun.entity.Usuario;
import com.ecosun.repository.AvaliacaoRepository;
import com.ecosun.repository.OrcamentoRepository;
import com.ecosun.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthorizationGuardTest {
    private final OrcamentoRepository orcamentoRepository = mock(OrcamentoRepository.class);
    private final AvaliacaoRepository avaliacaoRepository = mock(AvaliacaoRepository.class);
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final AuthorizationGuard guard = new AuthorizationGuard(
            orcamentoRepository, avaliacaoRepository, usuarioRepository);

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void permiteCriacaoComIdDoUsuarioAutenticadoMesmoSemEmailNoPayload() {
        authenticate("novo@exemplo.com");
        when(usuarioRepository.findByEmail("novo@exemplo.com"))
                .thenReturn(Optional.of(usuario(42)));
        Orcamento orcamento = new Orcamento();
        orcamento.setUsuarioId(42);
        orcamento.setNome("Meu sistema solar");
        orcamento.setEmail(null);

        assertTrue(guard.canWriteOrcamento(orcamento));
    }

    @Test
    void rejeitaOrcamentoQuePertenceAOutroUsuario() {
        authenticate("cliente@exemplo.com");
        when(usuarioRepository.findByEmail("cliente@exemplo.com"))
                .thenReturn(Optional.of(usuario(42)));
        Orcamento orcamento = new Orcamento();
        orcamento.setUsuarioId(99);
        orcamento.setEmail("cliente@exemplo.com");

        assertFalse(guard.canWriteOrcamento(orcamento));
    }

    @Test
    void rejeitaUsuarioOuVinculoAusente() {
        authenticate("inexistente@exemplo.com");
        when(usuarioRepository.findByEmail("inexistente@exemplo.com"))
                .thenReturn(Optional.empty());
        Orcamento semUsuarioId = new Orcamento();
        semUsuarioId.setEmail("inexistente@exemplo.com");
        Orcamento comUsuarioDesconhecido = new Orcamento();
        comUsuarioDesconhecido.setUsuarioId(404);
        comUsuarioDesconhecido.setEmail("inexistente@exemplo.com");

        assertFalse(guard.canWriteOrcamento(semUsuarioId));
        assertFalse(guard.canWriteOrcamento(comUsuarioDesconhecido));
        assertFalse(guard.canWriteOrcamento(null));
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(email, "token", java.util.Collections.emptyList()));
    }

    private Usuario usuario(Integer id) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setEmail("cliente@exemplo.com");
        return usuario;
    }
}
