import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/authAPI';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginUser(formData.email, formData.senha);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        {error && <div className="error-message">{error}</div>}
        
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
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <div className="auth-links">
          <Link to="/create-account">Criar conta</Link>
          <Link to="/forgot-password">Esqueci a senha</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;