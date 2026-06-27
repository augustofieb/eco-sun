import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getProducts } from './utils/productsAPI'
import { getCategories } from './utils/categories'
import { getCurrentUser, isAdmin } from './utils/authAPI'

import { createOrcamento } from './utils/orcamentosAPI'
import ImageCarousel from './components/ImageCarousel'
import OrcamentoNomeModal from './components/OrcamentoNomeModal'

import Logo from './assets/Logo.png'
import './SolarConfigurator.css'


const SolarConfigurator = () => {
  const location = useLocation()




  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [user] = useState(getCurrentUser())
  const [successMessage, setSuccessMessage] = useState('')
  const [showAppBanner, setShowAppBanner] = useState(false)
  const [selectedProductImages, setSelectedProductImages] = useState(null)
  const [showOrcamentoNomeModal, setShowOrcamentoNomeModal] = useState(false)

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
      setActiveCategory(null)
    }
  }

  const loadProducts = async () => {
    const productsData = await getProducts()
    setProducts(productsData)
  }

  useEffect(() => {
    // Aplicar recomendações recebidas do Home (preferencialmente via sessionStorage)
    const sessionRaw = sessionStorage.getItem('recommendedProductIds')


    const parsed = sessionRaw ? JSON.parse(sessionRaw) : null


    const ids = parsed?.recommendedProductIds
    if (!Array.isArray(ids) || ids.length === 0) return
    if (!Array.isArray(products) || products.length === 0) return

    const byId = new Map(products.map(p => [p.id, p]))

    // Agrupar quantidades por ID
    const counts = ids.reduce((acc, id) => {
      if (byId.has(id)) acc[id] = (acc[id] || 0) + 1
      return acc
    }, {})

    const nextSelected = Object.entries(counts)
      .map(([id, quantity]) => ({
        ...byId.get(id),
        quantity
      }))

    setSelectedProducts(nextSelected)

    // Opcional: limpar para evitar reaplicar em refresh/back
      // sessionStorage.removeItem('recommendedProductIds')
  }, [location, products])


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

  const formatSpecName = (key) => {
    const names = {
      'potencia_wp': 'Potência',
      'energia_mensal_kwh': 'Energia Mensal',
      'economia_mensal_rs': 'Economia Mensal',
      'reducao_co2_kg_ano': 'Redução CO₂/ano',
      'reducao_co2': 'Redução CO₂',
      'redução_co2': 'Redução CO₂'
    }
    return names[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
    if (!user || !user.id) return
    setShowOrcamentoNomeModal(true)
  }

  const submitOrcamento = async (nome) => {
    try {
      const orcamentoData = {
        usuarioId: user.id,
        nome,
        produtosSelecionados: JSON.stringify(selectedProducts),
        precoTotal: Number(summary.totalPrice.toFixed(2)) || 0,
        energiaTotalGerada: Number(summary.totalEnergy.toFixed(2)) || 0,
        economiaMensal: Number(summary.monthlyEconomy.toFixed(2)) || 0,
        tempoRetornoMeses: summary.paybackTime || 0,
        reducaoCo2Anual: Number(summary.co2Reduction.toFixed(2)) || 0
      }

      await createOrcamento(orcamentoData)
      setShowOrcamentoNomeModal(false)
      setSuccessMessage('Orçamento salvo com sucesso!')
      setShowAppBanner(true)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch { // eslint-disable-line no-empty
      setSuccessMessage('Erro ao salvar orçamento')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }




  const filteredProducts = activeCategory === null ? products : products.filter(p => p.categoria_id === activeCategory)

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
                <li>
                  <Link to="/meus-orcamentos" className="quote-btn" style={{textDecoration: 'none'}}> Meus Orçamentos</Link>
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
                Início
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
                <p>Baixe nosso aplicativo e faça uma simulação rápida do seu orçamento solar com base no quanto você gasta por mês!</p>
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
            <button
              className={`category-tab ${activeCategory === null ? 'active' : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              Todos
            </button>
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
              
              return (
                <div key={product.id} className="product-card">
                  <img 
                    src={product.fotoUrl || 'https://via.placeholder.com/200'} 
                    alt={product.nome}
                    className="product-image"
                    onClick={() => setSelectedProductImages({ 
                      images: [product.fotoUrl || 'https://via.placeholder.com/200'], 
                      name: product.nome 
                    })}
                    style={{cursor: 'pointer'}}
                  />
                  <h3>{product.nome}</h3>
                  <p className="product-price">R$ {product.preco?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  
                  {Object.keys(specs).length > 0 && (
                    <div className="energy-specs">
                      {Object.entries(specs).map(([key, value]) => (
                        <div key={key} className="spec-item">
                          <span>{formatSpecName(key)}: {value}</span>
                        </div>
                      ))}
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
              {selectedProducts.map(product => {
                const specs = product.especificacoes_tecnicas ? JSON.parse(product.especificacoes_tecnicas) : {}
                return (
                  <div key={product.id} className="selected-product">
                    <div>
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
                    {Object.keys(specs).length > 0 && (
                      <div className="selected-specs">
                        {Object.entries(specs).map(([key, value]) => (
                          <span key={key}>{formatSpecName(key)}: {value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
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

      <OrcamentoNomeModal
        open={showOrcamentoNomeModal}
        onClose={() => setShowOrcamentoNomeModal(false)}
        onConfirm={submitOrcamento}
      />
      
      {selectedProductImages && (
        <ImageCarousel
          images={selectedProductImages.images}
          productName={selectedProductImages.name}
          onClose={() => setSelectedProductImages(null)}
        />
      )}
    </>
  )
}


export default SolarConfigurator