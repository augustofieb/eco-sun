import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Logo from './assets/Logo.png'
import { authAPI } from './services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Por favor, digite seu email')
      return
    }
    
    setLoading(true)
    try {
      const response = await authAPI.forgotPassword(email)
      setMessage(`Nova senha temporária: ${response.data.tempPassword}`)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao recuperar senha')
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <title>ECO SUN - Recuperar Senha</title>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"> </li>
            <li>
              <Link to="/login" className="create-account" style={{marginRight: '20px'}}>Login</Link>
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
            <h1>Recuperar Senha</h1>
            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Recuperar Senha'}
              </button>
              <div className="login-links">
                <Link to="/login" className="forgot-password">Voltar ao Login</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

export default ForgotPassword