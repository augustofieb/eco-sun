package com.ecosun.controller;

import com.ecosun.entity.Orcamento;
import com.ecosun.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orcamentos")
@CrossOrigin(origins = "*")
public class OrcamentoController {
    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @GetMapping("/usuario/{usuarioId}")
    public List<Orcamento> getOrcamentosByUsuario(@PathVariable Integer usuarioId) {
        return orcamentoRepository.findByUsuarioId(usuarioId);
    }

    @PostMapping
    public ResponseEntity<?> createOrcamento(@RequestBody Orcamento orcamento) {
        try {
            orcamento.setDataCriacao(LocalDateTime.now());
            orcamento.setStatus("RASCUNHO");
            Orcamento saved = orcamentoRepository.save(orcamento);
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