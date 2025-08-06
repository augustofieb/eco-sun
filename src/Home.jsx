import './Home.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isLoggedIn, isAdmin, getCurrentUser, logoutUser, grantAdminByEmail } from './utils/auth'
import shoppingCartIcon from './assets/shoppingcart.png'
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
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    setUserIsAdmin(isAdmin())
    
    // Grant admin to guto if user exists
    grantAdminByEmail('augustinho@gmail.com')
  }, [])

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setUserIsAdmin(false)
  }

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name)
      if (existing) {
        return prev.map(item => 
          item.name === product.name 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productName) => {
    setCartItems(prev => prev.filter(item => item.name !== productName))
  }

  const updateQuantity = (productName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productName)
      return
    }
    setCartItems(prev => 
      prev.map(item => 
        item.name === productName 
          ? { ...item, quantity }
          : item
      )
    )
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <>

    <title>ECO SUN</title>
    <link rel="icon" href="" type="image/png"></link>
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
                  <li>
                    <Link to="/admin" className="admin-link">Usuários</Link>
                  </li>
                )}
                <li>
                  <span className="user-welcome">Olá, {user.name}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">Sair</button>
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
              <button onClick={() => setIsCartOpen(true)} className="shopping-cart">
                <img src={shoppingCartIcon} alt="Shopping Cart" width="24" height="24" />
                {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
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
           
           {/* <button className="btn-primary">Peça um orçamento</button> 
           
           aaaaaaaaaaaaaaaaaaaaaaaaaaa
           
           */} 

          </div>
          <div className="hero-image"></div>
        </section>

        <section className="featured-products">
          <h2>Produtos em Destaque</h2>
          <div className="products-grid">
            <div className="product-card">
              <img src={placaSolar} alt="Placa Solar" />
              <h3>Placa Solar</h3>
              <p>R$750,00</p>
              <button className="btn-secondary" onClick={() => addToCart({name: 'Placa Solar', price: 750, image: placaSolar})}>Adicionar ao carrinho</button>
            </div>
            <div className="product-card">
              <img src={microinversor} alt="Microinversor" />
              <h3>Microinversor</h3>
              <p>R$1200,00</p>
              <button className="btn-secondary" onClick={() => addToCart({name: 'Microinversor', price: 1200, image: microinversor})}>Adicionar ao carrinho</button>
            </div>
            <div className="product-card">
              <img src={controlador} alt="Controlador" />
              <h3>Controlador</h3>
              <p>R$900,00</p>
              <button className="btn-secondary" onClick={() => addToCart({name: 'Controlador', price: 900, image: controlador})}>Adicionar ao carrinho</button>
            </div>
            <div className="product-card">
              <img src={bateriaSolar} alt="Bateria Solar" />
              <h3>Bateria Solar</h3>
              <p>R$1800,00</p>
              <button className="btn-secondary" onClick={() => addToCart({name: 'Bateria Solar', price: 1800, image: bateriaSolar})}>Adicionar ao carrinho</button>
            </div>
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

      <div className={`cart-sidebar ${isCartOpen ? 'cart-open' : ''}`}>
        <div className="cart-header">
          <h2>Carrinho de Compras</h2>
          <button onClick={() => setIsCartOpen(false)} className="close-cart">×</button>
        </div>
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Seu carrinho está vazio</p>
          ) : (
            <>
              {cartItems.map(item => (
                <div key={item.name} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>R${item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.name, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.name, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.name)} className="remove-item">×</button>
                </div>
              ))}
              <div className="cart-total">
                <h3>Total: R${getTotalPrice().toFixed(2)}</h3>
                <button className="btn-primary checkout-btn">Finalizar Compra</button>
              </div>
            </>
          )}
        </div>
      </div>

      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
    </>
  )
}

export default Home
