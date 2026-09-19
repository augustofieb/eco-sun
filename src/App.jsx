import { lazy, Suspense, useEffect } from 'react'
import {Routes, Route} from 'react-router-dom'
import { initTheme } from './utils/theme'

const Home = lazy(() => import('./Home.jsx'))
const Login = lazy(() => import('./Login.jsx'))
const Register = lazy(() => import('./components/Register.jsx'))
const ForgotPassword = lazy(() => import('./components/ForgotPassword.jsx'))
const TestConnection = lazy(() => import('./components/TestConnection.jsx'))
const Admin = lazy(() => import('./Admin.jsx'))
const AdminProducts = lazy(() => import('./AdminProducts.jsx'))
const AdminStats = lazy(() => import('./AdminStats.jsx'))
const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'))
const AdminOrcamentos = lazy(() => import('./AdminOrcamentos.jsx'))
const MeusOrcamentos = lazy(() => import('./MeusOrcamentos.jsx'))
const ProductDetails = lazy(() => import('./ProductDetails.jsx'))
const SolarConfigurator = lazy(() => import('./SolarConfigurator.jsx'))

const App = () => {
  useEffect(() => {
    initTheme()
  }, [])
  return (
      <Suspense fallback={<div className="route-loading" aria-live="polite">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Home /> } />
          <Route path="/login" element={<Login /> } />
          <Route path="/create-account" element={<Register /> } />
          <Route path="/forgot-password" element={<ForgotPassword /> } />
          <Route path="/test" element={<TestConnection /> } />
          <Route path="/admin-orcamentos" element={<AdminOrcamentos /> } />
          <Route path="/meus-orcamentos" element={<MeusOrcamentos /> } />
          <Route path="/admin-dashboard" element={<AdminDashboard /> } />
          <Route path="/admin" element={<Admin /> } />
          <Route path="/admin-products" element={<AdminProducts /> } />
          <Route path="/admin-stats" element={<AdminStats /> } />
          <Route path="/configurador" element={<SolarConfigurator /> } />
          <Route path="/product/:id" element={<ProductDetails /> } />
        </Routes>
      </Suspense>
  )
}

export default App