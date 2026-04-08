import { useEffect, useState } from 'react'
import AdminLayout from './components/AdminLayout'
import { isAdmin } from './utils/auth'
import api from './services/api'

const AdminOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orcamentos').then(r => setOrcamentos(r.data)).catch(() => setOrcamentos([])).finally(() => setLoading(false))
  }, [])

  if (!isAdmin()) return <div>Acesso negado</div>

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Orçamentos</h1>
        {loading ? (
          <p style={{ color: '#888' }}>Carregando...</p>
        ) : orcamentos.length === 0 ? (
          <p style={{ color: '#aaa' }}>Nenhum orçamento encontrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#aaa', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>ID</th>
                  <th style={{ padding: '8px 12px' }}>Usuário</th>
                  <th style={{ padding: '8px 12px' }}>Consumo (kWh)</th>
                  <th style={{ padding: '8px 12px' }}>Potência (kWp)</th>
                  <th style={{ padding: '8px 12px' }}>Painéis</th>
                  <th style={{ padding: '8px 12px' }}>Investimento</th>
                  <th style={{ padding: '8px 12px' }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '8px 12px', color: '#999' }}>#{o.id}</td>
                    <td style={{ padding: '8px 12px' }}>{o.usuario?.nome || o.usuarioId || '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{o.consumoMensal ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{o.potenciaSistema ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{o.numeroPaineis ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      {o.investimentoTotal != null
                        ? `R$ ${Number(o.investimentoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#999' }}>
                      {o.dataCriacao ? new Date(o.dataCriacao).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminOrcamentos
