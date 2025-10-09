import { useState, useEffect } from 'react'
import { getCurrentUser } from './utils/auth'
import { Link } from 'react-router-dom'
import './SolarQuote.css'

const SolarQuote = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    roofArea: '',
    monthlyBill: '',
    roofType: 'ceramica',
    energyGoal: 'reducao'
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.number || '',
        address: user.address || ''
      }))
    }
  }, [isOpen])

  const [quote, setQuote] = useState(null)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const calculateQuote = (e) => {
    e.preventDefault()
    
    const monthlyBill = parseFloat(formData.monthlyBill)
    const roofArea = parseFloat(formData.roofArea)
    
    // Cálculos simplificados para orçamento
    const energyConsumption = monthlyBill * 12 / 0.65 // kWh/ano estimado
    const systemPower = energyConsumption / 1200 // kW necessário
    const panelsNeeded = Math.ceil(systemPower / 0.55) // painéis de 550W
    const totalCost = panelsNeeded * 1200 + 3000 // custo por painel + instalação
    const monthlySavings = monthlyBill * 0.9
    const paybackTime = totalCost / (monthlySavings * 12)

    setQuote({
      systemPower: systemPower.toFixed(1),
      panelsNeeded,
      totalCost: totalCost.toFixed(0),
      monthlySavings: monthlySavings.toFixed(0),
      paybackTime: paybackTime.toFixed(1),
      co2Reduction: (energyConsumption * 0.0817).toFixed(1) // toneladas CO2/ano
    })
  }

  if (!isOpen) return null

  return (
    <div className="quote-overlay">
      <div className="quote-modal">
        <div className="quote-header">
          <h2>Orçamento de Energia Solar</h2>
          <button onClick={onClose} className="close-quote">×</button>
        </div>
        
        <div className="quote-content">
          {!getCurrentUser() ? (
            <div className="login-required">
              <h3>Login Necessário</h3>
              <p>Você precisa estar logado para solicitar um orçamento personalizado.</p>
              <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                <Link to="/login" className="btn-primary" onClick={onClose}>Fazer Login</Link>
                <Link to="/create-account" className="btn-secondary" onClick={onClose}>Criar Conta</Link>
              </div>
            </div>
          ) : !quote ? (
            <form onSubmit={calculateQuote} className="quote-form">
              <div className="form-group">
                <label>Nome completo:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  readOnly={!!getCurrentUser()}
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  readOnly={!!getCurrentUser()}
                />
              </div>

              <div className="form-group">
                <label>Telefone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Endereço:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Área do telhado (m²):</label>
                <input
                  type="number"
                  name="roofArea"
                  value={formData.roofArea}
                  onChange={handleInputChange}
                  min="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor médio da conta de luz (R$):</label>
                <input
                  type="number"
                  name="monthlyBill"
                  value={formData.monthlyBill}
                  onChange={handleInputChange}
                  min="50"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de telhado:</label>
                <select name="roofType" value={formData.roofType} onChange={handleInputChange}>
                  <option value="ceramica">Cerâmica</option>
                  <option value="fibrocimento">Fibrocimento</option>
                  <option value="metalico">Metálico</option>
                  <option value="laje">Laje</option>
                </select>
              </div>

              <div className="form-group">
                <label>Objetivo:</label>
                <select name="energyGoal" value={formData.energyGoal} onChange={handleInputChange}>
                  <option value="reducao">Reduzir conta de luz</option>
                  <option value="zeramento">Zerar conta de luz</option>
                  <option value="excedente">Gerar excedente</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">Calcular Orçamento</button>
            </form>
          ) : (
            <div className="quote-result">
              <h3>Seu Orçamento Personalizado</h3>
              
              <div className="quote-details">
                <div className="quote-item">
                  <span className="label">Potência do sistema:</span>
                  <span className="value">{quote.systemPower} kWp</span>
                </div>
                
                <div className="quote-item">
                  <span className="label">Painéis necessários:</span>
                  <span className="value">{quote.panelsNeeded} unidades</span>
                </div>
                
                <div className="quote-item">
                  <span className="label">Investimento total:</span>
                  <span className="value">R$ {quote.totalCost}</span>
                </div>
                
                <div className="quote-item">
                  <span className="label">Economia mensal:</span>
                  <span className="value">R$ {quote.monthlySavings}</span>
                </div>
                
                <div className="quote-item">
                  <span className="label">Retorno do investimento:</span>
                  <span className="value">{quote.paybackTime} anos</span>
                </div>
                
                <div className="quote-item">
                  <span className="label">Redução CO₂/ano:</span>
                  <span className="value">{quote.co2Reduction} toneladas</span>
                </div>
              </div>

              <div className="quote-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const message = `Olá! Gostaria de um orçamento para energia solar:
Nome: ${formData.name}
Email: ${formData.email}
Telefone: ${formData.phone}
Endereço: ${formData.address}
Sistema: ${quote.systemPower} kWp (${quote.panelsNeeded} painéis)
Investimento: R$ ${quote.totalCost}`
                    
                    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank')
                  }}
                >
                  Solicitar via WhatsApp
                </button>
                
                <button 
                  className="btn-secondary"
                  onClick={() => setQuote(null)}
                >
                  Novo Orçamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SolarQuote