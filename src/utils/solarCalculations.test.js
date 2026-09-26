import { describe, expect, it } from 'vitest'
import { calculateLegacyQuoteSummary, calculateSolarSummary } from './solarCalculations'

describe('calculateSolarSummary', () => {
  it('calcula energia e indicadores com os campos reais dos produtos', () => {
    const summary = calculateSolarSummary([
      {
        nome: 'Painel Solar 400W',
        preco: 899.99,
        quantity: 2,
        categoriaNome: 'Painéis Solares',
        especificacoes_tecnicas: '{"energia":400}',
      },
      {
        nome: 'Inversor 3000W',
        preco: 1299.99,
        quantity: 1,
        categoriaNome: 'Inversores',
        especificacoes_tecnicas: '{"potencia":3000}',
      },
    ])

    expect(summary.totalPrice).toBeCloseTo(3099.97)
    expect(summary.totalEnergy).toBeCloseTo(120)
    expect(summary.monthlyEconomy).toBeCloseTo(78)
    expect(summary.paybackTime).toBe(40)
    expect(summary.co2Reduction).toBeCloseTo(120.96)
  })

  it('limita a geração pela capacidade total dos inversores', () => {
    const summary = calculateSolarSummary([
      {
        nome: 'Painel Solar 400W',
        preco: 100,
        quantity: 4,
        especificacoes_tecnicas: { energia: 400 },
      },
      {
        nome: 'Inversor 500W',
        preco: 50,
        quantity: 1,
        especificacoes_tecnicas: { potencia: 500 },
      },
    ])

    expect(summary.totalEnergy).toBeCloseTo(75)
  })

  it('usa a potência nos nomes quando o cadastro não tem especificações técnicas', () => {
    const summary = calculateSolarSummary([
      { nome: 'Painel Solar 400W', preco: 899.99, quantity: 1 },
      { nome: 'Inversor 3000W', preco: 1299.99, quantity: 1 },
    ])

    expect(summary.totalPrice).toBeCloseTo(2199.98)
    expect(summary.totalEnergy).toBeCloseTo(60)
    expect(summary.monthlyEconomy).toBeCloseTo(39)
    expect(summary.paybackTime).toBe(57)
    expect(summary.co2Reduction).toBeCloseTo(60.48)
  })

  it('recalcula orçamentos antigos salvos com quantidade de painéis e potência do sistema', () => {
    const summary = calculateLegacyQuoteSummary({
      precoTotal: 25800,
      energiaTotalGerada: 0,
      economiaMensal: 585,
      tempoRetornoMeses: 44,
      reducaoCo2Anual: 980.4,
      potenciaSistema: 10,
      numeroPaineis: 19,
      contaMensalMedia: 650,
    })

    expect(summary.totalPrice).toBe(25800)
    expect(summary.totalEnergy).toBe(1045)
    expect(summary.monthlyEconomy).toBe(585)
    expect(summary.paybackTime).toBe(44)
    expect(summary.co2Reduction).toBe(980.4)
  })
})