package com.ecosun.controller;

import com.ecosun.entity.Orcamento;
import com.ecosun.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/orcamentos")
@CrossOrigin(origins = "*")
public class OrcamentoController {
    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Orcamento>> getOrcamentosByUsuario(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(orcamentoRepository.findByUsuarioId(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orcamento> getOrcamentoById(@PathVariable Integer id) {
        return orcamentoRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrcamento(@RequestBody Orcamento orcamento) {
        try {
            System.out.println("Recebendo orçamento: " + orcamento.toString());
            
            // Validar dados obrigatórios
            if (orcamento.getUsuarioId() == null) {
                return ResponseEntity.badRequest().body("ID do usuário é obrigatório");
            }
            
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
            
            System.out.println("Datas definidas: " + now);
            System.out.println("Orçamento antes da validação: " + orcamento.toString());
            
            Orcamento saved = orcamentoRepository.save(orcamento);
            System.out.println("Orçamento salvo com sucesso: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("Erro ao criar orçamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao criar orçamento: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Orcamento> updateOrcamento(@PathVariable Integer id, @RequestBody Orcamento orcamento) {
        if (orcamentoRepository.existsById(id)) {
            orcamento.setId(id);
            return ResponseEntity.ok(orcamentoRepository.save(orcamento));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrcamento(@PathVariable Integer id) {
        if (orcamentoRepository.existsById(id)) {
            orcamentoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}