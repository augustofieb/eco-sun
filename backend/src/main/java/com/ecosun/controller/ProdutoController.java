package com.ecosun.controller;

import com.ecosun.entity.Produto;
import com.ecosun.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public Produto createProduto(@RequestBody Produto produto) {
        produto.setStatusProduto("ATIVO");
        return produtoService.saveProduto(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> updateProduto(@PathVariable Integer id, @RequestBody Produto produto) {
        return produtoService.getProdutoById(id)
                .map(existing -> {
                    produto.setId(id);
                    return ResponseEntity.ok(produtoService.saveProduto(produto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduto(@PathVariable Integer id) {
        produtoService.deleteProduto(id);
        return ResponseEntity.ok().build();
    }
}