package com.ecosun.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Avaliacao")
public class Avaliacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ProdutoId", nullable = false)
    private Integer produtoId;

    @Column(name = "UsuarioId", nullable = false)
    private Integer usuarioId;

    @Column(name = "NomeUsuario", nullable = false, length = 100)
    private String nomeUsuario;

    @Column(name = "Nota", nullable = false)
    private Integer nota;

    @Column(name = "Comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "DataAvaliacao", nullable = false)
    private LocalDateTime dataAvaliacao;

    public Avaliacao() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getProdutoId() { return produtoId; }
    public void setProdutoId(Integer produtoId) { this.produtoId = produtoId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getNomeUsuario() { return nomeUsuario; }
    public void setNomeUsuario(String nomeUsuario) { this.nomeUsuario = nomeUsuario; }

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public LocalDateTime getDataAvaliacao() { return dataAvaliacao; }
    public void setDataAvaliacao(LocalDateTime dataAvaliacao) { this.dataAvaliacao = dataAvaliacao; }
}