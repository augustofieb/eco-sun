package com.ecosun.dto;

public class ProdutoRequest {
    private String nome;
    private String descricao;
    private Double preco;
    private String foto;
    private Integer categoriaId;
    private String especificacoesTecnicas;

    public ProdutoRequest() {}

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }

    public String getEspecificacoesTecnicas() { return especificacoesTecnicas; }
    public void setEspecificacoesTecnicas(String especificacoesTecnicas) { this.especificacoesTecnicas = especificacoesTecnicas; }
}
