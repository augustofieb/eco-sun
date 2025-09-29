package com.ecosun.entity;

import javax.persistence.*;

@Entity
@Table(name = "conteudo")
public class Conteudo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String chave; // 'sobre', 'renovavel', 'faq'
    
    @Column(columnDefinition = "TEXT")
    private String conteudo;
    
    // Constructors
    public Conteudo() {}
    
    public Conteudo(String chave, String conteudo) {
        this.chave = chave;
        this.conteudo = conteudo;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getChave() { return chave; }
    public void setChave(String chave) { this.chave = chave; }
    
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
}