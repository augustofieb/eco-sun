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
    
    @Column(name = "data_orcamento")
    private LocalDateTime dataOrcamento;

    @Column(name = "status", length = 20)
    private String status;

    // Campos do formulário
    @Column(name = "nome", length = 100)
    private String nome;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Column(name = "endereco", length = 255)
    private String endereco;

    @Column(name = "area_telhado", precision = 8, scale = 2)
    private BigDecimal areaTelhado;

    @Column(name = "conta_mensal_media", precision = 8, scale = 2)
    private BigDecimal contaMensalMedia;

    @Column(name = "tipo_telhado", length = 50)
    private String tipoTelhado;

    @Column(name = "objetivo_energia", length = 50)
    private String objetivoEnergia;

    @Column(name = "potencia_sistema", precision = 8, scale = 2)
    private BigDecimal potenciaSistema;

    @Column(name = "numero_paineis")
    private Integer numeroPaineis;

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
    
    public LocalDateTime getDataOrcamento() { return dataOrcamento; }
    public void setDataOrcamento(LocalDateTime dataOrcamento) { this.dataOrcamento = dataOrcamento; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public BigDecimal getAreaTelhado() { return areaTelhado; }
    public void setAreaTelhado(BigDecimal areaTelhado) { this.areaTelhado = areaTelhado; }

    public BigDecimal getContaMensalMedia() { return contaMensalMedia; }
    public void setContaMensalMedia(BigDecimal contaMensalMedia) { this.contaMensalMedia = contaMensalMedia; }

    public String getTipoTelhado() { return tipoTelhado; }
    public void setTipoTelhado(String tipoTelhado) { this.tipoTelhado = tipoTelhado; }

    public String getObjetivoEnergia() { return objetivoEnergia; }
    public void setObjetivoEnergia(String objetivoEnergia) { this.objetivoEnergia = objetivoEnergia; }

    public BigDecimal getPotenciaSistema() { return potenciaSistema; }
    public void setPotenciaSistema(BigDecimal potenciaSistema) { this.potenciaSistema = potenciaSistema; }

    public Integer getNumeroPaineis() { return numeroPaineis; }
    public void setNumeroPaineis(Integer numeroPaineis) { this.numeroPaineis = numeroPaineis; }
    
    @Override
    public String toString() {
        return "Orcamento{" +
                "id=" + id +
                ", usuarioId=" + usuarioId +
                ", precoTotal=" + precoTotal +
                ", energiaTotalGerada=" + energiaTotalGerada +
                ", economiaMensal=" + economiaMensal +
                ", tempoRetornoMeses=" + tempoRetornoMeses +
                ", reducaoCo2Anual=" + reducaoCo2Anual +
                ", status='" + status + '\'' +
                '}';
    }
}