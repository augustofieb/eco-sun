import './Home.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCurrentUser, isAdmin } from './utils/auth'
import { productsAPI, categoriesAPI } from './services/api'
import Logo from './assets/Logo.png'
import placaSolar from './assets/placa_solar.png'

const Home = () => {
  const [user, setUser] = useState(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setUserIsAdmin(isAdmin())
    }
    loadProducts()
    loadCategories()
  }, [])
  
  const loadProducts = async (categoria = 'all') => {
    try {
      const response = await productsAPI.getAll(categoria !== 'all' ? categoria : null)
      setProducts(response.data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }
  
  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    loadProducts(category)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentUser')
    setUser(null)
    setUserIsAdmin(false)
  }

  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"> </li>
            {user ? (
              <>
                {userIsAdmin && (
                  <>
                    <li>
                      <Link to="/admin" className="admin-link">Usuários</Link>
                    </li>
                    <li>
                      <Link to="/admin-products" className="admin-link">Produtos</Link>
                    </li>
                  </>
                )}
                <li>
                  <span className="user-welcome">Olá, {user.nome || user.name}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">Sair</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/create-account" className="create-account">Crie sua conta</Link>
                </li>
                <li>
                  <Link to="/login" className="sign-in">Entre</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Energia Solar para a Sua Casa</h1>
            <p>Economize na conta de luz com energia sustentável</p>
            <button className="btn-primary">Peça um orçamento</button>
          </div>
        </section>

        <section className="products-section">
          <h2>Nossos Produtos</h2>
          <div className="category-filter">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => handleCategoryChange('all')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={selectedCategory === cat.nome ? 'active' : ''}
                onClick={() => handleCategoryChange(cat.nome)}
              >
                {cat.nome}
              </button>
            ))}
          </div>
          <div className="products-grid">
            {products.length === 0 ? (
              <p className="no-products">Nenhum produto encontrado.</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`} className="product-link">
                    <img src={product.image || placaSolar} alt={product.nome} />
                    <h3>{product.nome}</h3>
                    <p>R${product.preco.toFixed(2)}</p>
                  </Link>
                  <button className="btn-secondary">Solicitar orçamento</button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export default Home