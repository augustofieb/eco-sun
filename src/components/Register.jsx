import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/authAPI';
import './Register.css';
import '../Home.css';
import Logo from '../assets/Logo.png';

const Register = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await registerUser(formData.nome, formData.email, formData.senha);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
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
          <h2>Criar Conta</h2>
          {error && <div className="error-message">{error}</div>}
          
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={(e) => setFormData({...formData, senha: e.target.value})}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
          
          <div className="auth-links">
            <Link to="/login">Já tem conta? Entre aqui</Link>
          </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Register;