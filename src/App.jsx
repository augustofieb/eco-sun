import {Routes, Route} from 'react-router-dom'
import Home from './Home.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import Admin from './Admin.jsx'
import AdminProducts from './AdminProducts.jsx'
import ProductDetails from './ProductDetails.jsx'

const App = () => {
  
  return (
      <Routes>
        <Route path="/" element={<Home /> } />
        <Route path="/login" element={<Login /> } />
        <Route path="/create-account" element={<Register /> } />
        <Route path="/forgot-password" element={<ForgotPassword /> } />
        <Route path="/admin" element={<Admin /> } />
        <Route path="/admin-products" element={<AdminProducts /> } />
        <Route path="/product/:id" element={<ProductDetails /> } />
      </Routes>
  )
}

export default App