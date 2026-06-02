package com.ecosun.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ConteudoController {
    
    private static Map<String, String> conteudoMap = new HashMap<>();
    
    static {
        conteudoMap.put("sobre", "A ECO SUN é uma empresa dedicada a fornecer soluções sustentáveis de energia solar para residências e empresas. Nossa missão é tornar a energia limpa acessível a todos.\n\nFundada em 2020, já ajudamos centenas de famílias a reduzirem sua pegada de carbono e economizarem na conta de luz.");
        conteudoMap.put("renovavel", "Economia: Reduza até 95% da sua conta de luz\nSustentabilidade: Energia limpa e renovável\nValorização: Aumenta o valor do seu imóvel\nIndependência: Menos dependência da rede elétrica\nDurabilidade: Painéis com vida útil de 25+ anos");
        conteudoMap.put("faq", "Quanto tempo dura a instalação?|A instalação residencial típica leva de 1 a 3 dias.\nFunciona em dias nublados?|Sim, os painéis geram energia mesmo com pouca luz solar.\nQual a garantia dos equipamentos?|Oferecemos 2 anos de garantia em todos os equipamentos.");
    }
    
    @GetMapping("/api/conteudo/{chave}")
    public ResponseEntity<Map<String, String>> getConteudo(@PathVariable String chave) {
        String conteudo = conteudoMap.get(chave);
        if (conteudo != null) {
            Map<String, String> response = new HashMap<>();
            response.put("conteudo", conteudo);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/api/conteudo/{chave}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateConteudo(@PathVariable String chave, @RequestBody Map<String, String> request) {
        String novoConteudo = request.get("conteudo");
        conteudoMap.put(chave, novoConteudo);
        
        Map<String, String> response = new HashMap<>();
        response.put("conteudo", novoConteudo);
        return ResponseEntity.ok(response);
    }
}