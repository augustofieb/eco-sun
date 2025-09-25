import { useState } from 'react';
import { authAPI } from '../services/api';

const TestConnection = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const getApiUrl = () => {
    if (window.location.hostname.includes('app.github.dev')) {
      const codespaceUrl = window.location.hostname.replace('-5173', '-8081');
      return `https://${codespaceUrl}/api`;
    }
    return 'http://localhost:8081/api';
  };

  const testConnection = async () => {
    setLoading(true);
    setStatus('');
    
    try {
      const apiUrl = getApiUrl();
      setStatus(`🔄 Testando conexão com: ${apiUrl}`);
      const response = await fetch(`${apiUrl}/test/ping`);
      const data = await response.text();
      setStatus(`✅ Conexão OK: ${data}`);
    } catch (error) {
      console.error('Erro de conexão:', error);
      setStatus(`❌ Erro de conexão: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setStatus('');
    
    try {
      // Teste com credenciais de exemplo
      const response = await authAPI.login('admin@ecosun.com', 'admin123');
      setStatus(`✅ Login OK: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('Erro de login:', error);
      if (error.code === 'ERR_NETWORK') {
        setStatus('❌ Erro de rede - Backend não está acessível');
      } else {
        setStatus(`❌ Erro de login: ${error.response?.data || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>Teste de Conexão Backend</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testConnection} disabled={loading}>
          {loading ? 'Testando...' : 'Testar Conexão'}
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testLogin} disabled={loading}>
          {loading ? 'Testando...' : 'Testar Login'}
        </button>
      </div>
      
      {status && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default TestConnection;