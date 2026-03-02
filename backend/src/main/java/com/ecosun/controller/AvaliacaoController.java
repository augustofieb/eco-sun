package com.ecosun.controller;

import com.ecosun.entity.Avaliacao;
import com.ecosun.repository.AvaliacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {
    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<Avaliacao>> getAvaliacoesByProduto(@PathVariable Integer produtoId) {
        return ResponseEntity.ok(avaliacaoRepository.findByProdutoId(produtoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avaliacao> getAvaliacaoById(@PathVariable Integer id) {
        return avaliacaoRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAvaliacao(@RequestBody Avaliacao avaliacao) {
        try {
            if (avaliacao.getNota() == null || avaliacao.getNota() < 1 || avaliacao.getNota() > 5) {
                return ResponseEntity.badRequest().body("Nota deve estar entre 1 e 5");
            }
            if (avaliacao.getProdutoId() == null || avaliacao.getUsuarioId() == null) {
                return ResponseEntity.badRequest().body("Produto e usuário são obrigatórios");
            }
            avaliacao.setDataAvaliacao(LocalDateTime.now());
            Avaliacao saved = avaliacaoRepository.save(avaliacao);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao criar avaliação: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAvaliacao(@PathVariable Integer id, @RequestBody Avaliacao avaliacao) {
        if (!avaliacaoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (avaliacao.getNota() != null && (avaliacao.getNota() < 1 || avaliacao.getNota() > 5)) {
            return ResponseEntity.badRequest().body("Nota deve estar entre 1 e 5");
        }
        avaliacao.setId(id);
        return ResponseEntity.ok(avaliacaoRepository.save(avaliacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvaliacao(@PathVariable Integer id) {
        if (avaliacaoRepository.existsById(id)) {
            avaliacaoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}