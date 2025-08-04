import './Login.css'
import { Link } from 'react-router-dom'
import shoppingCartIcon from './assets/shoppingcart.png'
import Logo from './assets/Logo.png'

const Login = () => {
  return (
    <>
      <title>ECO SUN - Login</title>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <ul>
              <input type="search" className="search-box" placeholder="Pesquisar..." />
            </ul>
            <li className="spacer"> </li>
            <li>
              <Link to="/create-account" className="create-account" style={{marginRight: '20px'}}>Crie sua conta</Link>
            </li>
            <li>
              <Link to="/" className="sign-in" style={{marginRight: '70px'}}>Home</Link>
            </li>

          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="main-content">
        <section className="login-section">
          <div className="login-container">
            <h1>Entre na sua conta</h1>
            <form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" name="password" required />
              </div>
              <button type="submit" className="btn-primary">Entrar</button>
              <div className="login-links">
                <Link to="/forgot-password" className="forgot-password">Esqueceu a senha?</Link>
                <Link to="/create-account" className="create-account-link">Não tem conta? Crie uma</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

export default Login