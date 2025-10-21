import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from './utils/productsAPI'
import { getCategories } from './utils/categories'
import { getCurrentUser, isAdmin, logoutUser } from './utils/authAPI'
import { createOrcamento } from './utils/orcamentosAPI'

import Logo from './assets/Logo.png'
import './SolarConfigurator.css'

const SolarConfigurator = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [user] = useState(getCurrentUser())
  const [successMessage, setSuccessMessage] = useState('')
  const [showAppBanner, setShowAppBanner] = useState(false)
  const [summary, setSummary] = useState({
    totalPrice: 0,
    totalEnergy: 0,
    monthlyEconomy: 0,
    paybackTime: 0,
    co2Reduction: 0
  })

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    calculateSummary()
  }, [selectedProducts])

  const loadCategories = async () => {
    const categoriesData = await getCategories()
    setCategories(categoriesData)
    if (categoriesData.length > 0) {
      setActiveCategory(categoriesData[0].id)
    }
  }

  const loadProducts = async () => {
    const productsData = await getProducts()
    setProducts(productsData)
  }

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id)
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id ? {...p, quantity: p.quantity + 1} : p
      ))
    } else {
      setSelectedProducts([...selectedProducts, {...product, quantity: 1}])
    }
  }

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProduct(productId)
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId ? {...p, quantity} : p
      ))
    }
  }

  const calculateSummary = () => {
    const totalPrice = selectedProducts.reduce((sum, p) => sum + (p.preco * p.quantity), 0)
    
    let totalEnergy = 0
    let totalMonthlyEconomy = 0
    let totalCo2Reduction = 0
    
    selectedProducts.forEach(p => {
      const specs = p.especificacoes_tecnicas ? JSON.parse(p.especificacoes_tecnicas) : {}
      const isPlacaSolar = categories.find(cat => cat.id === p.categoria_id)?.nome?.toLowerCase().includes('placa')
      
      if (isPlacaSolar) {
        // Usar especificações do produto se disponíveis
        const energiaMensal = parseFloat(specs.energia_mensal_kwh) || 0
        const economiaMensal = parseFloat(specs.economia_mensal_rs) || 0
        const co2Anual = parseFloat(specs.reducao_co2_kg_ano) || 0
        
        totalEnergy += energiaMensal * p.quantity
        totalMonthlyEconomy += economiaMensal * p.quantity
        totalCo2Reduction += co2Anual * p.quantity
      }
    })
    
    // Se não houver especificações, usar cálculos padrão
    if (totalEnergy === 0) {
      totalEnergy = selectedProducts.reduce((sum, p) => {
        const specs = p.especificacoes_tecnicas ? JSON.parse(p.especificacoes_tecnicas) : {}
        const potencia = parseFloat(specs.potencia_wp) || 0
        const energiaEstimada = (potencia * 5 * 30) / 1000 // 5h sol/dia * 30 dias
        return sum + (energiaEstimada * p.quantity)
      }, 0)
    }
    
    if (totalMonthlyEconomy === 0) {
      totalMonthlyEconomy = totalEnergy * 0.65 // R$ 0,65 por kWh
    }
    
    if (totalCo2Reduction === 0) {
      totalCo2Reduction = totalEnergy * 0.084 * 12 // kg CO2 por ano
    }
    
    const paybackTime = (totalPrice > 0 && totalMonthlyEconomy > 0) ? Math.ceil(totalPrice / totalMonthlyEconomy) : 0

    setSummary({
      totalPrice,
      totalEnergy,
      monthlyEconomy: totalMonthlyEconomy,
      paybackTime,
      co2Reduction: totalCo2Reduction
    })
  }

  const handleSaveOrcamento = async () => {
    try {
      if (!user || !user.id) {
        return
      }

      const orcamentoData = {
        usuarioId: user.id,
        produtosSelecionados: JSON.stringify(selectedProducts),
        precoTotal: Number(summary.totalPrice.toFixed(2)) || 0,
        energiaTotalGerada: Number(summary.totalEnergy.toFixed(2)) || 0,
        economiaMensal: Number(summary.monthlyEconomy.toFixed(2)) || 0,
        tempoRetornoMeses: summary.paybackTime || 0,
        reducaoCo2Anual: Number(summary.co2Reduction.toFixed(2)) || 0
      }
      
      await createOrcamento(orcamentoData)
      setSuccessMessage('Orçamento salvo com sucesso!')
      setShowAppBanner(true)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setSuccessMessage('Erro ao salvar orçamento')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }



  const filteredProducts = products.filter(p => p.categoria_id === activeCategory)

  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"></li>
            {user ? (
              <>
                {isAdmin() && (
                  <>
                    <li>
                      <Link to="/admin" className="admin-link">Usuários</Link>
                    </li>
                    <li>
                      <Link to="/admin-products" className="admin-link">Produtos</Link>
                    </li>
                  </>
                )}
                <li>
                  <span className="user-welcome">Olá, {user.nome || user.name}</span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/create-account" className="create-account">Crie sua conta</Link>
                </li>
                <li>
                  <Link to="/login" className="sign-in">Entre</Link>
                </li>
              </>
            )}
            <li>
              <Link to="/" className="quote-btn" style={{textDecoration: 'none', marginRight: '50px'}}>
                🏠 Início
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <div className="configurator-section">
        <div className="solar-configurator">
        <div className="configurator-header">
          <h1>Configure seu Sistema Solar</h1>
          <p>Monte seu sistema personalizado selecionando os componentes</p>
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          {showAppBanner && (
            <div className="app-banner">
              <div className="app-banner-content">
                <h4>📱 Baixe nosso App!</h4>
                <p>Para visualizar seus orçamentos salvos e acompanhar o andamento, baixe nosso aplicativo móvel.</p>
                <div className="app-links">
                  <a href="#" className="app-store-btn">App Store</a>
                  <a href="#" className="play-store-btn">Google Play</a>
                </div>
                <button 
                  className="close-banner"
                  onClick={() => setShowAppBanner(false)}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
        
        {!user ? (
          <div className="login-required">
            <h3>Login Necessário</h3>
            <p>Você precisa estar logado para usar o configurador de sistema solar.</p>
            <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center'}}>
              <Link to="/login" className="btn-primary">Fazer Login</Link>
              <Link to="/create-account" className="btn-secondary">Criar Conta</Link>
            </div>
          </div>
        ) : (

      <div className="configurator-content">
        <div className="products-section">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.nome}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => {
              const specs = product.especificacoes_tecnicas ? JSON.parse(product.especificacoes_tecnicas) : {}
              const isPlacaSolar = categories.find(cat => cat.id === product.categoria_id)?.nome?.toLowerCase().includes('placa')
              
              return (
                <div key={product.id} className="product-card">
                  <img 
                    src={product.fotoUrl || 'https://via.placeholder.com/200'} 
                    alt={product.nome}
                    className="product-image"
                  />
                  <h3>{product.nome}</h3>
                  <p className="product-price">R$ {product.preco?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  
                  {isPlacaSolar && (
                    <div className="energy-specs">
                      {specs.energia_mensal_kwh && (
                        <div className="spec-item">
                          <span className="spec-icon">⚡</span>
                          <span>{specs.energia_mensal_kwh} kWh/mês</span>
                        </div>
                      )}
                      {specs.economia_mensal_rs && (
                        <div className="spec-item">
                          <span className="spec-icon">💰</span>
                          <span>R$ {specs.economia_mensal_rs}/mês</span>
                        </div>
                      )}
                      {specs.reducao_co2_kg_ano && (
                        <div className="spec-item">
                          <span className="spec-icon">🌱</span>
                          <span>{specs.reducao_co2_kg_ano} kg CO₂/ano</span>
                        </div>
                      )}
                      {specs.potencia_wp && (
                        <div className="spec-item">
                          <span className="spec-icon">🔋</span>
                          <span>{specs.potencia_wp} Wp</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button 
                    className="add-product-btn"
                    onClick={() => addProduct(product)}
                  >
                    Adicionar
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="cart-section">
          <h2>Produtos Selecionados</h2>
          {selectedProducts.length === 0 ? (
            <p>Nenhum produto selecionado</p>
          ) : (
            <div className="selected-products">
              {selectedProducts.map(product => (
                <div key={product.id} className="selected-product">
                  <span className="product-name">{product.nome}</span>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(product.id, product.quantity - 1)}>-</button>
                    <span>{product.quantity}</span>
                    <button onClick={() => updateQuantity(product.id, product.quantity + 1)}>+</button>
                  </div>
                  <span className="product-total">
                    R$ {(product.preco * product.quantity).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </span>
                  <button 
                    className="remove-btn"
                    onClick={() => removeProduct(product.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="summary-section">
            <h3>Resumo do Sistema</h3>
            <div className="summary-item">
              <span>Preço Total:</span>
              <span>R$ {summary.totalPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="summary-item">
              <span>Energia Gerada:</span>
              <span>{summary.totalEnergy.toFixed(2)} kWh/mês</span>
            </div>
            <div className="summary-item">
              <span>Economia Mensal:</span>
              <span>R$ {summary.monthlyEconomy.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Tempo de Retorno:</span>
              <span>{summary.paybackTime} meses</span>
            </div>
            <div className="summary-item">
              <span>Redução CO₂/ano:</span>
              <span>{summary.co2Reduction.toFixed(2)} kg</span>
            </div>
            
            {selectedProducts.length > 0 && (
              <button 
                className="save-quote-btn"
                onClick={handleSaveOrcamento}
              >
                Salvar Orçamento
              </button>
            )}
          </div>
        </div>
      </div>
        )}
        </div>
      </div>
    </>
  )
}

export default SolarConfigurator