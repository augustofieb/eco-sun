package com.ecosun.dto;

public class ResetPasswordRequest {
    private String token;
    private String senha;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}