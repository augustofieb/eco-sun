const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value == null) return 0

  let normalized = String(value).trim().replace(/[^\d,.-]/g, '')
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else {
    normalized = normalized.replace(',', '.')
  }

  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}

const getSpecs = (product) => {
  if (product.especificacoes_tecnicas && typeof product.especificacoes_tecnicas === 'object') {
    return product.especificacoes_tecnicas
  }

  try {
    return JSON.parse(product.especificacoes_tecnicas || '{}')
  } catch {
    return {}
  }
}

const getSpecNumber = (specs, keys) => {
  for (const key of keys) {
    const value = toNumber(specs[key])
    if (value > 0) return value
  }
  return 0
}

const getProductPowerWatts = (product, specs, keys) => {
  const specifiedPower = getSpecNumber(specs, keys)
  if (specifiedPower > 0) return specifiedPower

  const productDescription = `${product.nome || product.name || ''} ${product.descricao || product.description || ''}`
  const match = productDescription.match(/(\d+(?:[.,]\d+)?)\s*(kwp|kw|wp|w)\b/i)
  if (!match) return 0

  const power = toNumber(match[1])
  return /kw/i.test(match[2]) ? power * 1000 : power
}

const getCategoryName = (product, categories) => {
  const directName = product.categoriaNome || product.categoryName || product.categoria_nome
  if (directName) return directName

  const categoryId = product.categoria_id ?? product.category_id
  return categories.find((category) => String(category.id) === String(categoryId))?.nome || ''
}

const isInverter = (product, categories) => {
  const category = normalizeText(getCategoryName(product, categories))
  const name = normalizeText(product.nome || product.name)
  return category.includes('inversor') || name.includes('inversor')
}

const isSolarPanel = (product, categories) => {
  const category = normalizeText(getCategoryName(product, categories))
  const name = normalizeText(product.nome || product.name)
  if (category.includes('inversor') || category.includes('bateria') || category.includes('controlador')) return false
  return category.includes('painel') || category.includes('placa') || name.includes('painel') || name.includes('placa')
}

export const calculateSolarSummary = (products = [], categories = []) => {
  const summary = {
    totalPrice: 0,
    totalEnergy: 0,
    monthlyEconomy: 0,
    paybackTime: 0,
    co2Reduction: 0,
  }

  if (!Array.isArray(products)) return summary

  let panelCapacityKw = 0
  let inverterCapacityKw = 0
  let estimatedEconomy = 0
  let estimatedCo2 = 0

  products.forEach((product) => {
    const quantity = Math.max(0, toNumber(product.quantity ?? product.quantidade) || 1)
    const price = toNumber(product.preco ?? product.price)
    const specs = getSpecs(product)

    summary.totalPrice += price * quantity

    if (isInverter(product, categories)) {
      const inverterWatts = getProductPowerWatts(product, specs, ['potencia_wp', 'potencia_w', 'potencia', 'power_w'])
      inverterCapacityKw += inverterWatts * quantity / 1000
      return
    }

    if (!isSolarPanel(product, categories)) return

    const panelWatts = getProductPowerWatts(product, specs, ['potencia_wp', 'potencia_w', 'potencia', 'energia', 'power_w'])
    const monthlyEnergySpec = getSpecNumber(specs, ['energia_mensal_kwh', 'energia_mensal'])
    const monthlyEconomySpec = getSpecNumber(specs, ['economia_mensal_rs', 'economia_mensal'])
    const annualCo2Spec = getSpecNumber(specs, ['reducao_co2_kg_ano', 'reducao_co2_anual', 'reducao_co2'])
    const monthlyEnergy = monthlyEnergySpec > 0
      ? monthlyEnergySpec * quantity
      : panelWatts * quantity * 5 * 30 / 1000

    panelCapacityKw += panelWatts * quantity / 1000
    summary.totalEnergy += monthlyEnergy
    estimatedEconomy += monthlyEconomySpec > 0
      ? monthlyEconomySpec * quantity
      : monthlyEnergy * 0.65
    estimatedCo2 += annualCo2Spec > 0
      ? annualCo2Spec * quantity
      : monthlyEnergy * 0.084 * 12
  })

  const inverterLimitRatio = panelCapacityKw > 0 && inverterCapacityKw > 0
    ? Math.min(1, inverterCapacityKw / panelCapacityKw)
    : 1

  summary.totalEnergy *= inverterLimitRatio
  summary.monthlyEconomy = estimatedEconomy * inverterLimitRatio
  summary.co2Reduction = estimatedCo2 * inverterLimitRatio
  summary.paybackTime = summary.totalPrice > 0 && summary.monthlyEconomy > 0
    ? Math.ceil(summary.totalPrice / summary.monthlyEconomy)
    : 0

  return summary
}

export const calculateLegacyQuoteSummary = (quote = {}) => {
  const getValue = (...keys) => {
    for (const key of keys) {
      const value = toNumber(quote[key])
      if (value > 0) return value
    }
    return 0
  }

  const panelCount = getValue('numeroPaineis', 'numero_paineis')
  const systemPowerKw = getValue('potenciaSistema', 'potencia_sistema')
  const storedEnergy = getValue('energiaTotalGerada', 'energia_total_gerada')
  const totalEnergy = storedEnergy || (panelCount > 0
    ? panelCount * 0.55 * 100
    : systemPowerKw * 100)
  const totalPrice = getValue('precoTotal', 'preco_total')
  const monthlyBill = getValue('contaMensalMedia', 'conta_mensal_media')
  const monthlyEconomy = getValue('economiaMensal', 'economia_mensal') || monthlyBill * 0.9 || totalEnergy * 0.65
  const paybackTime = getValue('tempoRetornoMeses', 'tempo_retorno_meses') || (
    totalPrice > 0 && monthlyEconomy > 0 ? Math.ceil(totalPrice / monthlyEconomy) : 0
  )
  const co2Reduction = getValue('reducaoCo2Anual', 'reducao_co2_anual') || totalEnergy * 12 * 0.084

  return {
    totalPrice,
    totalEnergy,
    monthlyEconomy,
    paybackTime,
    co2Reduction,
  }
}