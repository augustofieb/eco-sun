import { useNavigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import { isAdmin } from './utils/auth'
import './AdminDashboard.css'

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
      <div className="admin-dashboard">
        <h1>Painel Administrativo</h1>
        <p className="admin-dashboard-description">Selecione uma seção para gerenciar</p>
        <div className="admin-dashboard-grid">
          {CARDS.map(({ to, icon, label, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="admin-dashboard-card"
            >
              <span className="admin-dashboard-card-icon">{icon}</span>
              <strong>{label}</strong>
              <span>{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
