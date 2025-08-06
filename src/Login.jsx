import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Logo from './assets/Logo.png'
import { loginUser } from './utils/auth'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      return
    }
    
    try {
      const user = loginUser(formData.email, formData.password)
      alert(`Bem-vindo, ${user.name}!`)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  return (
    <>
      <title>ECO SUN - Login</title>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>

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
            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
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