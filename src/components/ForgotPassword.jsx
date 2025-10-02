import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Register.css';
import '../Home.css';
import Logo from '../assets/Logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authAPI.forgotPassword(email);
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      setMessage('Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"> </li>
            <li>
              <Link to="/" className="sign-in" style={{marginRight: '40px'}}>Voltar</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="main-content">
        <section className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Recuperar Senha</h2>
        {message && <div className="info-message">{message}</div>}
        
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
        
        <div className="auth-links">
          <Link to="/login">Voltar ao login</Link>
        </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;