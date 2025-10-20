import './Home.css'
import './dark-mode.css'
import './toggle-switch.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isLoggedIn, isAdmin, getCurrentUser, logoutUser, refreshUserData } from './utils/authAPI'
import { getProducts, getProductsByCategory, searchProducts } from './utils/productsAPI'
import { getCategories, updateConteudo } from './utils/categories'
import { updateUser } from './utils/usersAPI'

import RichTextEditor from './components/RichTextEditor'
import { getTheme, setTheme, initTheme } from './utils/theme'

import SolarQuote from './SolarQuote'
import Logo from './assets/Logo.png'
import placaSolar from './assets/placa_solar.png'
import microinversor from './assets/microinversor.png'
import controlador from './assets/controlador.png'
import bateriaSolar from './assets/Bateria_solar.png'
import economiaIcon from './assets/porco_economia.png'
import garantiaIcon from './assets/garantia.png'
import suporteIcon from './assets/Suporte_tecnico.png'
import CasaIcon from './assets/background-casa.png'

const Home = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('conta')
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
                    } else {
                      
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
                    } else {
                      
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
                    } else {
                      
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

        <section className="info-cards">
          <div className="info-card">
            <img src={economiaIcon} alt="Economia" />
            <h3>Economia</h3>
            <p>Reduza sua conta de energia</p>
          </div>
          <div className="info-card">
            <img src={garantiaIcon} alt="Garantia" />
            <h3>Garantia</h3>
            <p>Garantia de 2 anos</p>
          </div>
          <div className="info-card">
            <img src={suporteIcon} alt="Suporte Técnico" />
            <h3>Suporte Técnico</h3>
            <p>Assistência especializada</p>
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
