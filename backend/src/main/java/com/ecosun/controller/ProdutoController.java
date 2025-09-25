package com.ecosun.controller;

import com.ecosun.dto.ProdutoRequest;
import com.ecosun.entity.Produto;
import com.ecosun.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {
    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public List<Produto> getAllProdutos() {
        return produtoService.getAllProdutos();
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<Produto> getProdutosByCategoria(@PathVariable Integer categoriaId) {
        return produtoService.getProdutosByCategoria(categoriaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> getProdutoById(@PathVariable Integer id) {
        return produtoService.getProdutoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProduto(@RequestBody ProdutoRequest request) {
        try {
            if (request.getNome() == null || request.getNome().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nome é obrigatório");
            }
            if (request.getPreco() == null || request.getPreco() <= 0) {
                return ResponseEntity.badRequest().body("Preço deve ser maior que zero");
            }
            if (request.getPreco() > 999999.99) {
                return ResponseEntity.badRequest().body("Preço muito alto");
            }
            if (request.getCategoriaId() == null) {
                return ResponseEntity.badRequest().body("Categoria é obrigatória");
            }
            
            Produto produto = new Produto();
            produto.setNome(request.getNome());
            produto.setDescricao(request.getDescricao());
            produto.setPreco(BigDecimal.valueOf(request.getPreco()));
            produto.setFotoUrl(request.getFoto());
            produto.setCategoriaId(request.getCategoriaId());
            produto.setStatusProduto("ATIVO");
            return ResponseEntity.ok(produtoService.saveProduto(produto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao criar produto: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> updateProduto(@PathVariable Integer id, @RequestBody ProdutoRequest request) {
        return produtoService.getProdutoById(id)
                .map(existing -> {
                    existing.setNome(request.getNome());
                    existing.setDescricao(request.getDescricao());
                    existing.setPreco(BigDecimal.valueOf(request.getPreco()));
                    existing.setFotoUrl(request.getFoto());
                    existing.setCategoriaId(request.getCategoriaId());
                    return ResponseEntity.ok(produtoService.saveProduto(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduto(@PathVariable Integer id) {
        produtoService.deleteProduto(id);
        return ResponseEntity.ok().build();
    }
}