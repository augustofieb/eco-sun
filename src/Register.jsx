import './Register.css'
import { Link } from 'react-router-dom'
import shoppingCartIcon from './assets/shoppingcart.png'
import Logo from './assets/Logo.png'

const Register = () => {
  return (
    <>
      <title>ECO SUN - Criar Conta</title>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <ul>
              <input type="search" className="search-box" placeholder="Pesquisar..." />
            </ul>
            <li className="spacer"> </li>
            <li>
              <Link to="/login" className="create-account">Entre</Link>
            </li>
            <li>
              <Link to="/" className="sign-in">Home</Link>
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
        <section className="register-section">
          <div className="register-container">
            <h1>Crie sua conta</h1>
            <form className="register-form">
              <div className="form-group">
                <label htmlFor="name">Nome completo</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" name="password" required />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required />
              </div>
              <button type="submit" className="btn-primary">Criar conta</button>
              <div className="register-links">
                <Link to="/login" className="login-link">Já tem conta? Entre aqui</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

export default Register