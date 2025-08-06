import './Register.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Logo from './assets/Logo.png'
import { registerUser } from './utils/auth'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    try {
      registerUser(formData)
      alert('Conta criada com sucesso!')
      navigate('/login')
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
      <title>ECO SUN - Criar Conta</title>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>

            <li className="spacer"> </li>
            <li>
              <Link to="/login" className="create-account" style={{marginRight: '20px'}}>Entre</Link>
            </li>
            <li>
              <Link to="/" className="sign-in" style={{marginRight: '70px'}}>Home</Link>
            </li>

          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="main-content">
        <section className="register-section">
          <div className="register-container">
            <h1>Crie sua conta</h1>
            <form className="register-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="name">Nome completo</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
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
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
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