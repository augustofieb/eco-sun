package com.ecosun.entity;

import javax.persistence.*;

@Entity
@Table(name = "preferencias")
public class Preferencias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @Column(name = "tema")
    private String tema = "light";
    
    // Constructors
    public Preferencias() {}
    
    public Preferencias(Usuario usuario, String tema) {
        this.usuario = usuario;
        this.tema = tema;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    
    public String getTema() { return tema; }
    public void setTema(String tema) { this.tema = tema; }
}