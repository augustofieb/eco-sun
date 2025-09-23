import { useState } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/test/ping');
      setResult('✅ Conexão OK: ' + response.data);
    } catch (error) {
      setResult('❌ Erro: ' + (error.message || 'Falha na conexão'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Teste de Conexão Backend</h3>
      <button onClick={testConnection} disabled={loading}>
        {loading ? 'Testando...' : 'Testar Conexão'}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
};

export default TestConnection;