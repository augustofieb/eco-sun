import {Routes, Route} from 'react-router-dom'
import Home from './Home.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Admin from './Admin.jsx'
import AdminProducts from './AdminProducts.jsx'

const App = () => {
  
  return (
      <Routes>
        <Route path="/" element={<Home /> } />
        <Route path="/login" element={<Login /> } />
        <Route path="/create-account" element={<Register /> } />
        <Route path="/admin" element={<Admin /> } />
        <Route path="/admin-products" element={<AdminProducts /> } />
      </Routes>
  )
}

export default App