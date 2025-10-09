package com.ecosun.dto;

public class AuthResponse {
    private String token;
    private Integer id;
    private String nome;
    private String email;
    private String nivelAcesso;
    private String statusUsuario;

    public AuthResponse(String token, Integer id, String nome, String email, String nivelAcesso, String statusUsuario) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.nivelAcesso = nivelAcesso;
        this.statusUsuario = statusUsuario;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNivelAcesso() { return nivelAcesso; }
    public void setNivelAcesso(String nivelAcesso) { this.nivelAcesso = nivelAcesso; }

    public String getStatusUsuario() { return statusUsuario; }
    public void setStatusUsuario(String statusUsuario) { this.statusUsuario = statusUsuario; }
}