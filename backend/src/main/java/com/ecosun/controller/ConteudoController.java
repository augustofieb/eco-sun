package com.ecosun.controller;

import com.ecosun.entity.Conteudo;
import com.ecosun.repository.ConteudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class ConteudoController {

    @Autowired
    private ConteudoRepository conteudoRepository;
    
    @GetMapping("/conteudo/{chave}")
    public ResponseEntity<Map<String, String>> getConteudo(@PathVariable String chave) {
        Optional<Conteudo> conteudo = conteudoRepository.findByChave(chave);
        return conteudo.map(value -> ResponseEntity.ok(Map.of("conteudo", value.getConteudo())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/conteudo/{chave}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateConteudo(@PathVariable String chave, @RequestBody Map<String, String> request) {
        String novoConteudo = request.get("conteudo");
        if (novoConteudo == null) {
            return ResponseEntity.badRequest().build();
        }

        Conteudo conteudo = conteudoRepository.findByChave(chave).orElseGet(Conteudo::new);
        conteudo.setChave(chave);
        conteudo.setConteudo(novoConteudo);
        Conteudo salvo = conteudoRepository.save(conteudo);
        return ResponseEntity.ok(Map.of("conteudo", salvo.getConteudo()));
    }
}