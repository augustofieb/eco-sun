import { useNavigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import { isAdmin } from './utils/auth'

const CARDS = [
  { to: '/admin-stats',    icon: '📊', label: 'Estatísticas',  desc: 'Métricas e dados do sistema' },
  { to: '/admin',          icon: '👥', label: 'Usuários',       desc: 'Gerenciar contas de usuários' },
  { to: '/admin-products', icon: '📦', label: 'Produtos',       desc: 'Produtos e categorias' },
]

const AdminDashboard = () => {
  const navigate = useNavigate()

  if (!isAdmin()) return <div>Acesso negado</div>

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Painel Administrativo</h1>
        <p style={{ color: 'var(--text-secondary, #666)', marginBottom: '2rem' }}>Selecione uma seção para gerenciar</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {CARDS.map(({ to, icon, label, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                padding: '2rem 1rem', border: '1px solid var(--border-color, #e0e0e0)',
                borderRadius: '12px', background: 'var(--card-bg, #fff)', cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s', textAlign: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <span style={{ fontSize: '2.5rem' }}>{icon}</span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary, #222)' }}>{label}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #888)' }}>{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
