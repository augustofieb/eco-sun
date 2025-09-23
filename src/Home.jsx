import './Home.css'
import './dark-mode.css'
import './toggle-switch.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isLoggedIn, isAdmin, getCurrentUser, logoutUser } from './utils/authAPI'
import { getProducts, getProductsByCategory } from './utils/productsAPI'
import { getCategories } from './utils/categories'
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', nickname: '', address: '', number: '', password: ''
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setUserIsAdmin(isAdmin())
    setCategories(getCategories())
    setIsDarkMode(getTheme() === 'dark')
    initTheme()
    
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        nickname: currentUser.nickname || '',
        address: currentUser.address || '',
        number: currentUser.number || '',
        password: ''
      })
    }
    
    // Load products from API
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const productsData = await getProducts()
    setProducts(productsData)
  }

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category)
    const productsData = await getProductsByCategory(category)
    setProducts(productsData)
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setUserIsAdmin(false)
  }



  const handleProfileUpdate = (e) => {
    e.preventDefault()
    if (user) {
      const updatedUser = updateUserProfile(user.id, profileForm)
      if (updatedUser) {
        setUser(updatedUser)
        alert('Perfil atualizado com sucesso!')
      }
    }
  }

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setTheme(newTheme)
    setIsDarkMode(!isDarkMode)
  }



  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'conta':
        return (
          <form onSubmit={handleProfileUpdate} className="profile-form">

            <input 
              type="text" 
              placeholder="Nome completo"
              value={profileForm.name}
              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Apelido"
              value={profileForm.nickname}
              onChange={(e) => setProfileForm({...profileForm, nickname: e.target.value})}
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
              type="text" 
              placeholder="Endereço"
              value={profileForm.address}
              onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
            />
            <input 
              type="tel" 
              placeholder="Telefone"
              value={profileForm.number}
              onChange={(e) => setProfileForm({...profileForm, number: e.target.value})}
            />
            <button type="submit" className="btn-primary">Salvar Alterações</button>
          </form>
        )
      case 'sobre':
        return (
          <div className="info-content">
            <h3>Sobre Nós</h3>
            <p>A ECO SUN é uma empresa dedicada a fornecer soluções sustentáveis de energia solar para residências e empresas. Nossa missão é tornar a energia limpa acessível a todos.</p>
            <p>Fundada em 2020, já ajudamos centenas de famílias a reduzirem sua pegada de carbono e economizarem na conta de luz.</p>
          </div>
        )
      case 'renovavel':
        return (
          <div className="info-content">
            <h3>Por que usar energia renovável?</h3>
            <ul>
              <li><strong>Economia:</strong> Reduza até 95% da sua conta de luz</li>
              <li><strong>Sustentabilidade:</strong> Energia limpa e renovável</li>
              <li><strong>Valorização:</strong> Aumenta o valor do seu imóvel</li>
              <li><strong>Independência:</strong> Menos dependência da rede elétrica</li>
              <li><strong>Durabilidade:</strong> Painéis com vida útil de 25+ anos</li>
            </ul>
          </div>
        )
      case 'faq':
        return (
          <div className="info-content">
            <h3>Perguntas Frequentes</h3>
            <div className="faq-item">
              <h4>Quanto tempo dura a instalação?</h4>
              <p>A instalação residencial típica leva de 1 a 3 dias.</p>
            </div>
            <div className="faq-item">
              <h4>Funciona em dias nublados?</h4>
              <p>Sim, os painéis geram energia mesmo com pouca luz solar.</p>
            </div>
            <div className="faq-item">
              <h4>Qual a garantia dos equipamentos?</h4>
              <p>Oferecemos 2 anos de garantia em todos os equipamentos.</p>
            </div>
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
              <input type="search" className="search-box" placeholder="Pesquisar..." />
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
                  <span className="user-welcome">Olá, {user.nickname || user.name}</span>
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
              <button onClick={() => setIsQuoteOpen(true)} className="quote-btn">
                💡 Orçamento
              </button>
            </li>
            {user && (
              <li>
                <button onClick={() => setIsSettingsOpen(true)} className="settings-btn">
                  ⚙️
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Energia Solar<br />para a Sua Casa</h1>
            <p>Economize na conta de luz<br />com energia sustentável</p>
            <button className="btn-primary" onClick={() => setIsQuoteOpen(true)}>Peça um orçamento</button> 

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
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="products-grid">
            {products.length === 0 ? (
              <p className="no-products">Nenhum produto encontrado nesta categoria.</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`} className="product-link">
                    <img src={product.foto || placaSolar} alt={product.nome} />
                    <h3>{product.nome}</h3>
                    <p>R${product.preco ? product.preco.toFixed(2) : '0.00'}</p>
                  </Link>
                  <button className="btn-secondary" onClick={() => setIsQuoteOpen(true)}>Solicitar orçamento</button>
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
        <div className="settings-nav">
          <button 
            className={activeSettingsTab === 'conta' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('conta')}
          >
            Conta
          </button>
          <button 
            className={activeSettingsTab === 'sobre' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('sobre')}
          >
            Sobre Nós
          </button>
          <button 
            className={activeSettingsTab === 'renovavel' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('renovavel')}
          >
            Por que usar energia renovável?
          </button>
          <button 
            className={activeSettingsTab === 'faq' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('faq')}
          >
            Perguntas Frequentes
          </button>
          <button 
            className={activeSettingsTab === 'tema' ? 'active' : ''}
            onClick={() => setActiveSettingsTab('tema')}
          >
            Tema
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
        <div className="settings-content">
          {renderSettingsContent()}
        </div>
      </div>

      {isSettingsOpen && <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)}></div>}
    </>
  )
}

export default Home
