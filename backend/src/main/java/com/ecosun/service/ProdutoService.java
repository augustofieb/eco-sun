package com.ecosun.service;

import com.ecosun.entity.Produto;
import com.ecosun.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {
    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> getAllProdutos() {
        return produtoRepository.findByStatusProduto("ATIVO");
    }

    public List<Produto> getProdutosByCategoria(Integer categoriaId) {
        return produtoRepository.findByCategoriaId(categoriaId);
    }

    public Optional<Produto> getProdutoById(Integer id) {
        return produtoRepository.findById(id);
    }

    public Produto saveProduto(Produto produto) {
        return produtoRepository.save(produto);
    }

    public void deleteProduto(Integer id) {
        produtoRepository.deleteById(id);
    }
}