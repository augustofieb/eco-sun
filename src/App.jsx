import {Routes, Route} from 'react-router-dom'
import Home from './Home.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import TestConnection from './components/TestConnection.jsx'
import Admin from './Admin.jsx'
import AdminProducts from './AdminProducts.jsx'
import ProductDetails from './ProductDetails.jsx'
import SolarConfigurator from './SolarConfigurator.jsx'

const App = () => {
  
  return (
      <Routes>
        <Route path="/" element={<Home /> } />
        <Route path="/login" element={<Login /> } />
        <Route path="/create-account" element={<Register /> } />
        <Route path="/forgot-password" element={<ForgotPassword /> } />
        <Route path="/test" element={<TestConnection /> } />
        <Route path="/admin" element={<Admin /> } />
        <Route path="/admin-products" element={<AdminProducts /> } />
        <Route path="/configurador" element={<SolarConfigurator /> } />
        <Route path="/product/:id" element={<ProductDetails /> } />
      </Routes>
  )
}

export default App