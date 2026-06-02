import './Home.css'
import './HomeQuickSimulator.css'

import './dark-mode.css'
import './toggle-switch.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isAdmin, getCurrentUser, logoutUser, refreshUserData } from './utils/authAPI'

import { getProducts, getProductsByCategory, searchProducts } from './utils/productsAPI'
import { getCategories, updateConteudo } from './utils/categories'
import { updateUser } from './utils/usersAPI'

import RichTextEditor from './components/RichTextEditor'
import { getTheme, setTheme, initTheme } from './utils/theme'

import SolarQuote from './SolarQuote'
import Logo from './assets/Logo.png'
import placaSolar from './assets/placa_solar.png'
import economiaIcon from './assets/porco_economia.png'
import CasaIcon from './assets/background-casa.png'

import sofa from './assets/sofa.png'
import reembolso from './assets/reembolso-alternativo.png'

const Home = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsView, setSettingsView] = useState('main') // 'main' ou nome da aba específica
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [originalContent, setOriginalContent] = useState({})
  const [editableContent, setEditableContent] = useState({
    sobre: '<p>A <strong>ECO SUN</strong> é uma empresa dedicada a fornecer soluções sustentáveis de energia solar para residências e empresas. Nossa missão é tornar a energia limpa acessível a todos.</p><p>Fundada em 2020, já ajudamos centenas de famílias a reduzirem sua pegada de carbono e economizarem na conta de luz.</p>',
    renovavel: '<ul><li><strong>Economia:</strong> Reduza até 95% da sua conta de luz</li><li><strong>Sustentabilidade:</strong> Energia limpa e renovável</li><li><strong>Valorização:</strong> Aumenta o valor do seu imóvel</li><li><strong>Independência:</strong> Menos dependência da rede elétrica</li><li><strong>Durabilidade:</strong> Painéis com vida útil de 25+ anos</li></ul>',
    faq: '<div><h4>Quanto tempo dura a instalação?</h4><p>A instalação residencial típica leva de 1 a 3 dias.</p></div><div><h4>Funciona em dias nublados?</h4><p>Sim, os painéis geram energia mesmo com pouca luz solar.</p></div><div><h4>Qual a garantia dos equipamentos?</h4><p>Oferecemos 2 anos de garantia em todos os equipamentos.</p></div>'
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', nickname: '', address: '', number: '', password: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [quickForm, setQuickForm] = useState({
    monthlyKwh: '',
    monthlyBill: ''
  })

  const [quickResult, setQuickResult] = useState(null)

  const calcularEstimativa = ({ monthlyKwh, monthlyBill }) => {
    const kwh = parseFloat(monthlyKwh)
    const bill = parseFloat(monthlyBill)


    if (!Number.isFinite(kwh) || kwh <= 0 || !Number.isFinite(bill) || bill <= 0) {
      return {
        monthlySavings: 0,
        reductionPercent: 0,
        paybackYears: 0,
        co2Reduction: 0
      }
    }

    // Heurísticas simples/consistentes com o SolarQuote
    const energyConsumptionYear = kwh * 12
    const monthlySavings = bill * 0.9 // assume ~10% de manutenção/variação
    const reductionPercent = 95

    const systemPower = energyConsumptionYear / 1200 // kW (mesma regra do SolarQuote)
    const panelsNeeded = Math.ceil(systemPower / 0.55)
    const totalCost = panelsNeeded * 1200 + 3000

    const paybackTimeYears = totalCost / (monthlySavings * 12)
    const co2Reduction = (energyConsumptionYear * 0.0817) // toneladas CO2/ano

    return {
      monthlySavings,
      reductionPercent,
      paybackYears: paybackTimeYears,
      co2Reduction
    }
  }




  const formatBRL = (value) => {
    const num = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(num)) return '0'
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }






  useEffect(() => {
    const loadUserData = async () => {
      let currentUser = getCurrentUser()
      
      // Se o usuário está logado, recarregar dados do backend
      if (currentUser) {
        const refreshedUser = await refreshUserData()
        if (refreshedUser) {
          currentUser = refreshedUser
        }
      }
      
      console.log('Current user:', currentUser)
      setUser(currentUser)
      setUserIsAdmin(isAdmin())
      
      if (currentUser) {
        setProfileForm({
          name: currentUser.nome || currentUser.name || '',
          email: currentUser.email || '',
          nickname: currentUser.nickname || '',
          address: currentUser.address || '',
          number: currentUser.number || '',
          password: ''
        })
      }
    }
    
    loadUserData()
    loadCategories()
    setIsDarkMode(getTheme() === 'dark')
    initTheme()
    loadProducts()
  }, [])

  const loadCategories = async () => {
    const categoriesData = await getCategories()
    setCategories(categoriesData)
  }

  const loadProducts = async () => {
    setIsLoading(true)
    const productsData = await getProducts()
    setProducts(productsData)
    setIsLoading(false)
  }

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category)
    setSearchQuery('')
    setIsLoading(true)
    const productsData = await getProductsByCategory(category)
    setProducts(productsData)
    setIsLoading(false)
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setUserIsAdmin(false)
    setIsSettingsOpen(false)
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      loadProducts()
      setSelectedCategory('all')
    } else {
      setIsLoading(true)
      const searchResults = await searchProducts(query)
      setProducts(searchResults)
      setSelectedCategory('search')
      setIsLoading(false)
    }
  }





  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const updatedData = {
        nome: profileForm.name,
        email: profileForm.email,
        nivelAcesso: user.nivelAcesso,
        statusUsuario: user.statusUsuario
      }
      
      if (profileForm.password) {
        updatedData.senha = profileForm.password
      }
      
      await updateUser(user.id, updatedData)
      
      // Atualizar dados do usuário no sessionStorage
      const updatedUser = { ...user, nome: profileForm.name, email: profileForm.email }
      sessionStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      // Limpar senha do formulário
      setProfileForm({ ...profileForm, password: '' })
      
      // Mostrar mensagem de sucesso
      setSuccessMessage('Dados atualizados com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    }
  }

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setTheme(newTheme)
    setIsDarkMode(!isDarkMode)
  }



  const renderSettingsContent = () => {
    switch (settingsView) {
      case 'conta':
        return user ? (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            {successMessage && (
              <div className="success-message" style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #c3e6cb'
              }}>
                {successMessage}
              </div>
            )}

            <input 
              type="text" 
              placeholder="Nome completo"
              value={profileForm.name}
              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="Email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Nova senha (deixe vazio para manter)"
              value={profileForm.password}
              onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
            />
            <input 
              type="tel" 
              placeholder="Telefone"
              value={profileForm.number}
              onChange={(e) => setProfileForm({...profileForm, number: e.target.value})}
            />
            <button type="submit" className="btn-primary">Salvar Alterações</button>
          </form>
        ) : (
          <div className="info-content">
            <h3>Acesso à Conta</h3>
            <p>Você precisa estar logado para acessar as configurações da conta.</p>
            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <Link to="/login" className="btn-primary">Fazer Login</Link>
              <Link to="/create-account" className="btn-secondary">Criar Conta</Link>
            </div>
          </div>
        )
      case 'sobre':
        return (
          <div className="info-content">
            {userIsAdmin && (
              <button 
                onClick={() => {
                  if (isEditingContent) {
                    setEditableContent({...editableContent, sobre: originalContent.sobre || editableContent.sobre})
                  } else {
                    setOriginalContent({...originalContent, sobre: editableContent.sobre})
                  }
                  setIsEditingContent(!isEditingContent)
                }} 
                className="btn-edit"
                style={{marginBottom: '20px'}}
              >
                {isEditingContent ? 'Cancelar' : 'Editar'}
              </button>
            )}
            <h3>Sobre Nós</h3>
            {isEditingContent && userIsAdmin ? (
              <div>
                <RichTextEditor
                  value={editableContent.sobre}
                  onChange={(value) => setEditableContent({...editableContent, sobre: value})}
                  placeholder="Digite o conteúdo sobre a empresa..."
                />
                <button 
                  className="btn-primary"
                  onClick={async () => {
                    const success = await updateConteudo('sobre', editableContent.sobre);
                    if (success) {
                      
                      setIsEditingContent(false);
                    } 
                  }}
                >Salvar</button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: editableContent.sobre }} />
            )}
          </div>
        )
      case 'renovavel':
        return (
          <div className="info-content">
            {userIsAdmin && (
              <button 
                onClick={() => {
                  if (isEditingContent) {
                    setEditableContent({...editableContent, renovavel: originalContent.renovavel || editableContent.renovavel})
                  } else {
                    setOriginalContent({...originalContent, renovavel: editableContent.renovavel})
                  }
                  setIsEditingContent(!isEditingContent)
                }} 
                className="btn-edit"
                style={{marginBottom: '20px'}}
              >
                {isEditingContent ? 'Cancelar' : 'Editar'}
              </button>
            )}
            <h3>Por que usar energia renovável?</h3>
            {isEditingContent && userIsAdmin ? (
              <div>
                <RichTextEditor
                  value={editableContent.renovavel}
                  onChange={(value) => setEditableContent({...editableContent, renovavel: value})}
                  placeholder="Digite os benefícios da energia renovável..."
                />
                <button 
                  className="btn-primary"
                  onClick={async () => {
                    const success = await updateConteudo('renovavel', editableContent.renovavel);
                    if (success) {
                      
                      setIsEditingContent(false);
                    } 
                  }}
                >Salvar</button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: editableContent.renovavel }} />
            )}
          </div>
        )
      case 'faq':
        return (
          <div className="info-content">
            {userIsAdmin && (
              <button 
                onClick={() => {
                  if (isEditingContent) {
                    setEditableContent({...editableContent, faq: originalContent.faq || editableContent.faq})
                  } else {
                    setOriginalContent({...originalContent, faq: editableContent.faq})
                  }
                  setIsEditingContent(!isEditingContent)
                }} 
                className="btn-edit"
                style={{marginBottom: '20px'}}
              >
                {isEditingContent ? 'Cancelar' : 'Editar'}
              </button>
            )}
            <h3>Perguntas Frequentes</h3>
            {isEditingContent && userIsAdmin ? (
              <div>
                <RichTextEditor
                  value={editableContent.faq}
                  onChange={(value) => setEditableContent({...editableContent, faq: value})}
                  placeholder="Digite as perguntas frequentes..."
                />
                <button 
                  className="btn-primary"
                  onClick={async () => {
                    const success = await updateConteudo('faq', editableContent.faq);
                    if (success) {
                      
                      setIsEditingContent(false);
                    } 
                  }}
                >Salvar</button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: editableContent.faq }} />
            )}
          </div>
        )
      case 'tema':
        return (
          <div className="info-content">
            <h3>Configurações de Tema</h3>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px'}}>
              <label>Modo Escuro:</label>
              <label className="switch">
                <input type="checkbox" className="toggle" checked={isDarkMode} onChange={toggleDarkMode} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <header className="cabecalho">

        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <ul>
              <input 
                type="search" 
                className="search-box" 
                placeholder="Pesquisar produtos..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </ul>
            <li className="spacer"> </li>
            {user ? (
              <>
                {userIsAdmin && (
                  <>
                    
                    <li>
                      <Link to="/admin-dashboard" className="admin-link">Admin</Link>
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
              <Link to="/configurador" className="quote-btn" style={{textDecoration: 'none', marginRight: user ? '0' : '50px'}}>
                💡 Orçamento
              </Link>
            </li>
            <li>
              <button onClick={() => setIsSettingsOpen(true)} className="settings-btn">
                ☰
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Energia Solar<br />para a Sua Casa</h1>
            <p>Economize na conta de luz<br />com energia sustentável</p>
            <Link to="/configurador" className="btn-primary" style={{textDecoration: 'none', display: 'inline-block'}}>Peça um orçamento</Link> 

          </div>
          <div className="hero-image"></div>
        </section>

        <section className="products-section">
          <h2>Nossos Produtos</h2>
          <div className="category-filter">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => handleCategoryChange('all')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={selectedCategory === cat.id ? 'active' : ''}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {(cat.nome || cat.name || '').charAt(0).toUpperCase() + (cat.nome || cat.name || '').slice(1)}
              </button>
            ))}
          </div>
          <div className="products-grid">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando produtos...</p>
              </div>
            ) : products.length === 0 ? (
              <p className="no-products">Nenhum produto encontrado nesta categoria.</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`} className="product-link">
                    <img 
                      src={product.fotoUrl && product.fotoUrl.startsWith('data:') ? product.fotoUrl : (product.fotoUrl || placaSolar)} 
                      alt={product.nome} 
                      onError={(e) => { e.target.src = placaSolar }}
                    />
                    <h3>{product.nome}</h3>
                    <p>R${product.preco ? product.preco.toFixed(2) : '0.00'}</p>
                  </Link>
                  <Link to="/configurador" className="btn-secondary" style={{textDecoration: 'none', display: 'inline-block'}}>Solicitar orçamento</Link>
                </div>
              ))
            )}
          </div>
        </section>

   <h1> Por que usar Energia Solar? </h1>
        <section className="info-cards">
          <div className="info-card">
            <img src={economiaIcon} alt="Economia" />
            <h3>Redução da conta de energia</h3>
            <p>Economize centenas de reais todos os meses e recupere o investimento em poucos anos. Além disso, é possível alcançar uma redução de até 95%, tornando sua economia ainda maior a longo prazo.</p>
          </div>
          <div className="info-card">
            <img src={sofa} alt="Sofá" />
            <h3>Mais bem-estar para o seu dia a dia</h3>
            <p>Melhore a qualidade de vida da sua família e diminua a sua despesa ao mesmo tempo. Com mais economia, você também ganha tranquilidade para aproveitar melhor o dia a dia.</p>
          </div>
          <div className="info-card">
            <img src={reembolso} alt="dinheiro" />
            <h3>Baixa manutenção</h3>
            <p>Os sistemas de energia solar exigem pouca manutenção, com limpeza simples e revisões ocasionais para manter o máximo desempenho ao longo dos anos.</p>
          </div>
        </section>

        <section className="quick-simulator">
          <h2 className="quick-title">Simulador rápido de economia</h2>
          <p className="quick-subtitle">Informe seus números e veja uma estimativa em segundos.</p>

          <div className="quick-grid">
            <div className="quick-inputs">
              <label>
                Consumo mensal (kWh)
                <input
                  type="number"
                  min="0"
                  value={quickForm.monthlyKwh}
                  onChange={(e) => setQuickForm((prev) => ({ ...prev, monthlyKwh: e.target.value }))}
                  placeholder="Ex: 250"
                />
              </label>

              <label>
                Conta média (R$)
                <input
                  type="number"
                  min="0"
                  value={quickForm.monthlyBill}
                  onChange={(e) => setQuickForm((prev) => ({ ...prev, monthlyBill: e.target.value }))}
                  placeholder="Ex: 220"
                />
              </label>

              <div className="quick-actions">
                <button
                  className="btn-primary quick-cta"
                  onClick={() => setQuickResult(calcularEstimativa(quickForm))}
                >
                  Ver estimativa
                </button>
<button
                  type="button"
                  className="btn-secondary quick-link"
                  style={{ textDecoration: 'none' }}
                  onClick={() => {
                    // Navega com pré-seleção para o configurador
                    const kwh = parseFloat(quickForm.monthlyKwh);
                    const bill = parseFloat(quickForm.monthlyBill);
                    if (!Number.isFinite(kwh) || kwh <= 0 || !Number.isFinite(bill) || bill <= 0) return;

                    // Heurística: estimar tamanho aproximado do sistema baseado em kWh
                    const energyConsumptionYear = kwh * 12;
                    const systemPower = energyConsumptionYear / 1200; // mesma regra do SolarQuote
                    const panelsNeeded = Math.max(1, Math.ceil(systemPower / 0.55));

                    // Para recomendar produtos no configurador, precisamos selecionar IDs após carregar produtos.
                    // Usaremos o estado atual 'products' carregado no Home.
                    const placaCandidates = products.filter(p => {
                      const nome = (p.nome || '').toLowerCase();
                      return nome.includes('placa') || (p.categoria_id && String(p.categoria_id).toLowerCase().includes('placa'));
                    });

                    // Fallback: tentar encontrar pela especificação de potência
                    const panelSpecCandidates = products.filter(p => {
                      try {
                        const specs = p.especificacoes_tecnicas ? JSON.parse(p.especificacoes_tecnicas) : {};
                        return specs && (parseFloat(specs.potencia_wp) || 0) > 0;
                      } catch {
                        return false;
                      }
                    });

                    const panelPool = placaCandidates.length > 0 ? placaCandidates : panelSpecCandidates;
                    const inverterCandidates = products.filter(p => {
                      const nome = (p.nome || '').toLowerCase();
                      return nome.includes('inversor') || nome.includes('micro') || nome.includes('controlador');
                    });
                    const batteryCandidates = products.filter(p => {
                      const nome = (p.nome || '').toLowerCase();
                      return nome.includes('bateria');
                    });

                    const pickBest = (arr, predicate) => {
                      const scored = arr
                        .map(p => {
                          const specs = p.especificacoes_tecnicas ? JSON.parse(p.especificacoes_tecnicas) : {};
                          return { p, score: predicate(specs, p) };
                        })
                        .filter(x => Number.isFinite(x.score))
                        .sort((a, b) => b.score - a.score);
                      return scored[0]?.p || null;
                    };

                    const bestPanel = pickBest(panelPool, (specs) => parseFloat(specs.potencia_wp) || 0);
                    const bestInverter = pickBest(inverterCandidates, (_specs, p) => Number(p.preco) || 0);
                    const bestBattery = pickBest(batteryCandidates, (_specs, p) => Number(p.preco) || 0);

                    // Quantidade: no configurador vamos criar uma entrada com quantidade=1 por produto.
                    // A escolha de quantidade em massa para o painel não está pronta no UI.
                    // Então repetimos o mesmo ID 'panelsNeeded' vezes através de uma lista com IDs repetidos.
                    const recommendedProductIds = [];
                    if (bestPanel?.id) {
                      for (let i = 0; i < panelsNeeded && i < 20; i++) recommendedProductIds.push(bestPanel.id);
                    }
                    if (bestInverter?.id && recommendedProductIds.length < 25) recommendedProductIds.push(bestInverter.id);
                    if (bestBattery?.id && bill > 250 && recommendedProductIds.length < 30) recommendedProductIds.push(bestBattery.id);

                    const navState = {
                      recommendedProductIds,
                      quickInput: { monthlyKwh: kwh, monthlyBill: bill }
                    };

                    // Usar window.location para evitar depender de useNavigate
                    // (o configurador vai ler location.state via react-router)
                    window.location.href = `/configurador`;
                    sessionStorage.setItem('recommendedProductIds', JSON.stringify(navState));
                  }}
                >
                  Quero meu orçamento
                </button>
              </div>

              <div className="quick-hint">
                *Estimativa simplificada. No configurador, calculamos com dados mais completos.
              </div>
            </div>

            <div className="quick-results">
              {quickResult ? (
                <div className="quick-result-card">
                  <div className="quick-metric">
                    <span className="quick-label">Economia mensal (estim.)</span>
                    <span className="quick-value">R$ {formatBRL(quickResult.monthlySavings)}</span>
                  </div>
                  <div className="quick-metric">
                    <span className="quick-label">Redução na conta (estim.)</span>
                    <span className="quick-value">{quickResult.reductionPercent.toFixed(0)}%</span>
                  </div>
                  <div className="quick-metric">
                    <span className="quick-label">Retorno (estim.)</span>
                    <span className="quick-value">{quickResult.paybackYears.toFixed(1)} anos</span>
                  </div>
                  <div className="quick-metric">
                    <span className="quick-label">CO₂/ano (estim.)</span>
                    <span className="quick-value">{quickResult.co2Reduction.toFixed(1)} t</span>
                  </div>
                </div>
              ) : (
                <div className="quick-empty">
                  <div className="quick-empty-title">Preencha os campos</div>
                  <div className="quick-empty-text">Clique em “Ver estimativa” para ver os resultados aqui.</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>


      <SolarQuote isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />

      <div className={`settings-sidebar ${isSettingsOpen ? 'settings-open' : ''}`}>
        <div className="settings-header">
          <h2>Configurações</h2>
          <button onClick={() => setIsSettingsOpen(false)} className="close-settings">×</button>
        </div>
        {settingsView === 'main' ? (
          <div className="settings-nav">
            <button onClick={() => setSettingsView('conta')}>Conta</button>
            <button onClick={() => setSettingsView('sobre')}>Sobre Nós</button>
            <button onClick={() => setSettingsView('renovavel')}>Por que usar energia renovável?</button>
            <button onClick={() => setSettingsView('faq')}>Perguntas Frequentes</button>
            <button onClick={() => setSettingsView('tema')}>Tema</button>
            <button onClick={handleLogout} className="logout-btn">Sair</button>
          </div>
        ) : (
          <div className="settings-nav">
            <button onClick={() => setSettingsView('main')} className="back-btn">← Voltar</button>
          </div>
        )}
        <div className="settings-content">
          {settingsView === 'main' ? (
            <div className="settings-main">
              <h3>Configurações</h3>
              <p>Selecione uma opção no menu ao lado para continuar.</p>
            </div>
          ) : (
            renderSettingsContent()
          )}
        </div>
      </div>

      {isSettingsOpen && <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)}></div>}
    </>
  )
}

export default Home
