import { Link, useLocation } from 'react-router-dom'
import Logo from '../assets/Logo.png'
import './AdminLayout.css'

const NAV = [
  { to: '/admin-stats',    icon: '📊', label: 'Dashboard'  },
  { to: '/admin',          icon: '👥', label: 'Usuários'   },
  { to: '/admin-products', icon: '📦', label: 'Produtos'   },
  { to: '/',               icon: '🏠', label: 'Voltar ao site' },
]

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation()
  return (
    <div className="al-root">
      <aside className="al-sidebar">
        <div className="al-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <nav className="al-nav">
          {NAV.map(({ to, icon, label }) => (
            <Link key={to} to={to} className={`al-link${pathname === to ? ' active' : ''}`}>
              <span className="al-icon">{icon}</span>
              <span className="al-label">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="al-main">{children}</main>
    </div>
  )
}

export default AdminLayout
