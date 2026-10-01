package com.ecosun.controller;

import com.ecosun.entity.Orcamento;
import com.ecosun.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/orcamentos")
@CrossOrigin(origins = "*")
public class OrcamentoController {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Orcamento>> getAllOrcamentos() {
        return ResponseEntity.ok(orcamentoRepository.findAll());
    }

    @GetMapping("/usuario/{usuarioId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationGuard.canReadOrcamentos(#p0)")
    public ResponseEntity<List<Orcamento>> getOrcamentosByUsuario(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(orcamentoRepository.findByUsuarioId(usuarioId));
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationGuard.canReadOrcamento(#p0)")
    public ResponseEntity<Orcamento> getOrcamentoById(@PathVariable Integer id) {
        return orcamentoRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationGuard.canWriteOrcamento(#p0)")
    public ResponseEntity<?> createOrcamento(@RequestBody Orcamento orcamento) {
        try {
            String validationError = validateOrcamento(orcamento);
            if (validationError != null) return ResponseEntity.badRequest().body(validationError);

            // Garantir valores padrão para campos que não podem ser null
            if (orcamento.getPrecoTotal() == null) {
                orcamento.setPrecoTotal(BigDecimal.ZERO);
            }
            if (orcamento.getEnergiaTotalGerada() == null) {
                orcamento.setEnergiaTotalGerada(BigDecimal.ZERO);
            }
            if (orcamento.getEconomiaMensal() == null) {
                orcamento.setEconomiaMensal(BigDecimal.ZERO);
            }
            if (orcamento.getTempoRetornoMeses() == null) {
                orcamento.setTempoRetornoMeses(0);
            }
            if (orcamento.getReducaoCo2Anual() == null) {
                orcamento.setReducaoCo2Anual(BigDecimal.ZERO);
            }
            
            // Garantir que as datas sejam sempre definidas
            LocalDateTime now = LocalDateTime.now();
            orcamento.setDataCriacao(now);
            orcamento.setDataOrcamento(now);
            
            if (orcamento.getStatus() == null || orcamento.getStatus().isEmpty()) {
                orcamento.setStatus("RASCUNHO");
            }
            
            Orcamento saved = orcamentoRepository.save(orcamento);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Não foi possível criar o orçamento");
        }
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationGuard.canUpdateOrcamento(#p0, #p1)")
    public ResponseEntity<?> updateOrcamento(@PathVariable Integer id, @RequestBody Orcamento orcamento) {
        String validationError = validateOrcamento(orcamento);
        if (validationError != null) return ResponseEntity.badRequest().body(validationError);
        return orcamentoRepository.findById(id)
            .map(existing -> {
            orcamento.setId(id);
            orcamento.setUsuarioId(existing.getUsuarioId());
            return ResponseEntity.ok(orcamentoRepository.save(orcamento));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private String validateOrcamento(Orcamento orcamento) {
        if (orcamento == null || orcamento.getUsuarioId() == null || orcamento.getUsuarioId() <= 0) {
            return "ID do usuário inválido";
        }
        if (orcamento.getNome() == null || orcamento.getNome().trim().isEmpty()
                || orcamento.getNome().length() > 100) {
            return "Nome obrigatório (máximo de 100 caracteres)";
        }
        if (orcamento.getEmail() != null && (orcamento.getEmail().length() > 100
                || !EMAIL_PATTERN.matcher(orcamento.getEmail()).matches())) {
            return "E-mail inválido";
        }
        if (orcamento.getTelefone() != null && orcamento.getTelefone().length() > 20) {
            return "Telefone acima do limite permitido";
        }
        if (orcamento.getEndereco() != null && orcamento.getEndereco().length() > 255) {
            return "Endereço acima do limite permitido";
        }
        if (orcamento.getTipoTelhado() != null && orcamento.getTipoTelhado().length() > 50) {
            return "Tipo de telhado acima do limite permitido";
        }
        if (orcamento.getObjetivoEnergia() != null && orcamento.getObjetivoEnergia().length() > 50) {
            return "Objetivo acima do limite permitido";
        }
        if (orcamento.getProdutosSelecionados() != null && orcamento.getProdutosSelecionados().length() > 50000) {
            return "Lista de produtos acima do limite permitido";
        }
        if (orcamento.getStatus() != null && orcamento.getStatus().length() > 20) {
            return "Status acima do limite permitido";
        }
        if (isNegative(orcamento.getPrecoTotal()) || isNegative(orcamento.getEnergiaTotalGerada())
                || isNegative(orcamento.getEconomiaMensal()) || isNegative(orcamento.getReducaoCo2Anual())
                || isNegative(orcamento.getAreaTelhado()) || isNegative(orcamento.getContaMensalMedia())
                || isNegative(orcamento.getPotenciaSistema())) {
            return "Valores numéricos não podem ser negativos";
        }
        if (orcamento.getTempoRetornoMeses() != null && orcamento.getTempoRetornoMeses() < 0) {
            return "Tempo de retorno inválido";
        }
        if (orcamento.getNumeroPaineis() != null && orcamento.getNumeroPaineis() < 0) {
            return "Número de painéis inválido";
        }
        return null;
    }

    private boolean isNegative(BigDecimal value) {
        return value != null && value.signum() < 0;
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationGuard.canDeleteOrcamento(#p0)")
    public ResponseEntity<Void> deleteOrcamento(@PathVariable Integer id) {
        if (orcamentoRepository.existsById(id)) {
            orcamentoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}