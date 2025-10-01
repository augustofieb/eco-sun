package com.ecosun.entity;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Produto")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 255)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Lob
    private byte[] foto;

    @Column(name = "categoria_id", nullable = false)
    private Integer categoriaId;

    @Column(name = "status_produto", nullable = false, length = 10)
    private String statusProduto;

    @Column(name = "especificacoes_tecnicas", columnDefinition = "TEXT")
    private String especificacoesTecnicas;

    @Column(name = "produtos_compativeis", columnDefinition = "TEXT")
    private String produtosCompativeis;

    public Produto() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public byte[] getFoto() { return foto; }
    public void setFoto(byte[] foto) { this.foto = foto; }

    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }

    public String getStatusProduto() { return statusProduto; }
    public void setStatusProduto(String statusProduto) { this.statusProduto = statusProduto; }

    public String getEspecificacoesTecnicas() { return especificacoesTecnicas; }
    public void setEspecificacoesTecnicas(String especificacoesTecnicas) { this.especificacoesTecnicas = especificacoesTecnicas; }

    public String getProdutosCompativeis() { return produtosCompativeis; }
    public void setProdutosCompativeis(String produtosCompativeis) { this.produtosCompativeis = produtosCompativeis; }
}