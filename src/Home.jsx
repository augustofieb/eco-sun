import './Home.css'
import { Link } from 'react-router-dom'
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
  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <li><img className='Logo' src={Logo} alt="Logo" /></li>
            <li>
              <input type="search" className="search-box" placeholder="Pesquisar..." />
            </li>
            <li className="spacer"> </li>
            <li>
              <Link to="/create-account" className="create-account">Crie sua conta</Link>
            </li>
            <li>
              <Link to="/sign-in" className="sign-in">Entre</Link>
            </li>
            <li>
              <Link to="/cart" className="shopping-cart">
                <img src={shoppingCartIcon} alt="Shopping Cart" width="24" height="24" />
              </Link>
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
            <button className="btn-primary">Peça um orçamento</button>
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
              <button className="btn-secondary">Adicionar ao carrinho</button>
            </div>
            <div className="product-card">
              <img src={microinversor} alt="Microinversor" />
              <h3>Microinversor</h3>
              <p>R$1200,00</p>
              <button className="btn-secondary">Adicionar ao carrinho</button>
            </div>
            <div className="product-card">
              <img src={controlador} alt="Controlador" />
              <h3>Controlador</h3>
              <p>R$900,00</p>
              <button className="btn-secondary">Adicionar ao carrinho</button>
            </div>
            <div className="product-card">
              <img src={bateriaSolar} alt="Bateria Solar" />
              <h3>Bateria Solar</h3>
              <p>R$1800,00</p>
              <button className="btn-secondary">Adicionar ao carrinho</button>
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
            <p>Garantia de 10 anos</p>
          </div>
          <div className="info-card">
            <img src={suporteIcon} alt="Suporte Técnico" />
            <h3>Suporte Técnico</h3>
            <p>Assistência especializada</p>
          </div>
        </section>
      </main>
    </>
  )
}

export default Home
