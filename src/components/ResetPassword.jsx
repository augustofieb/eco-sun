import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Register.css';
import './ResetPassword.css';
import '../Home.css';
import Logo from '../assets/Logo.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (senha !== confirmacao) {
      setError('As senhas não coincidem.');
      return;
    }
    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/\d/.test(senha)) {
      setError('A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número.');
      return;
    }
    if (!token) {
      setError('Este link de redefinição é inválido ou expirou.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, senha);
      setMessage('Senha alterada com sucesso. Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (requestError) {
      setError(requestError.response?.data || 'Não foi possível alterar a senha. Solicite um novo link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><Link to="/"><img className="Logo" src={Logo} alt="Logo" /></Link></ul>
            <li className="spacer"> </li>
            <li><Link to="/login" className="sign-in" style={{ marginRight: '40px' }}>Voltar</Link></li>
          </ul>
        </nav>
      </header>
      <div className="division"></div>
      <main className="main-content">
        <section className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Criar nova senha</h2>
            {message && <div className="info-message" role="status">{message}</div>}
            {error && <div className="error-message" role="alert">{error}</div>}
            <label htmlFor="new-password">Nova senha</label>
            <input id="new-password" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} required autoComplete="new-password" />
            <label htmlFor="confirm-password">Confirmar nova senha</label>
            <input id="confirm-password" type="password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} required autoComplete="new-password" />
            <p className="password-hint">Use ao menos 8 caracteres, com maiúscula, minúscula e número.</p>
            <button type="submit" disabled={loading || Boolean(message)}>{loading ? 'Salvando...' : 'Criar nova senha'}</button>
            <div className="auth-links"><Link to="/login">Voltar ao login</Link></div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ResetPassword;