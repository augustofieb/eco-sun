package com.ecosun.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Orcamento")
public class Orcamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "produtos_selecionados", columnDefinition = "TEXT")
    private String produtosSelecionados; // JSON

    @Column(name = "preco_total", precision = 10, scale = 2)
    private BigDecimal precoTotal;

    @Column(name = "energia_total_gerada", precision = 8, scale = 2)
    private BigDecimal energiaTotalGerada;

    @Column(name = "economia_mensal", precision = 8, scale = 2)
    private BigDecimal economiaMensal;

    @Column(name = "tempo_retorno_meses")
    private Integer tempoRetornoMeses;

    @Column(name = "reducao_co2_anual", precision = 8, scale = 2)
    private BigDecimal reducaoCo2Anual;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "status", length = 20)
    private String status;

    public Orcamento() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getProdutosSelecionados() { return produtosSelecionados; }
    public void setProdutosSelecionados(String produtosSelecionados) { this.produtosSelecionados = produtosSelecionados; }

    public BigDecimal getPrecoTotal() { return precoTotal; }
    public void setPrecoTotal(BigDecimal precoTotal) { this.precoTotal = precoTotal; }

    public BigDecimal getEnergiaTotalGerada() { return energiaTotalGerada; }
    public void setEnergiaTotalGerada(BigDecimal energiaTotalGerada) { this.energiaTotalGerada = energiaTotalGerada; }

    public BigDecimal getEconomiaMensal() { return economiaMensal; }
    public void setEconomiaMensal(BigDecimal economiaMensal) { this.economiaMensal = economiaMensal; }

    public Integer getTempoRetornoMeses() { return tempoRetornoMeses; }
    public void setTempoRetornoMeses(Integer tempoRetornoMeses) { this.tempoRetornoMeses = tempoRetornoMeses; }

    public BigDecimal getReducaoCo2Anual() { return reducaoCo2Anual; }
    public void setReducaoCo2Anual(BigDecimal reducaoCo2Anual) { this.reducaoCo2Anual = reducaoCo2Anual; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}