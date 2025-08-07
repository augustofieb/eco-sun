import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/auth'
import { getProducts, addProduct, updateProduct, deleteProduct } from './utils/products'
import { getCategories, addCategory } from './utils/categories'
import { handleImageUpload } from './utils/imageUpload'
import './AdminProducts.css'
import Logo from './assets/Logo.png'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', category: '', image: '' })
  const [newCategory, setNewCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadProducts()
    setCategories(getCategories())
  }, [navigate])

  const loadProducts = () => {
    setProducts(getProducts())
  }

  const handleAdd = (e) => {
    e.preventDefault()
    addProduct({ ...formData, price: parseFloat(formData.price) })
    setFormData({ name: '', price: '', category: '', image: '' })
    setShowAddForm(false)
    loadProducts()
  }

  const handleEdit = (product) => {
    setEditingProduct(product.id)
    setFormData({ name: product.name, price: product.price, category: product.category, image: product.image })
  }

  const handleUpdate = (productId) => {
    updateProduct(productId, { ...formData, price: parseFloat(formData.price) })
    setEditingProduct(null)
    setFormData({ name: '', price: '', category: '', image: '' })
    loadProducts()
  }

  const handleDelete = (productId) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      deleteProduct(productId)
      loadProducts()
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategory.trim() && addCategory(newCategory.trim())) {
      setCategories(getCategories())
      setNewCategory('')
      setShowCategoryForm(false)
    } else {
      alert('Categoria já existe ou nome inválido')
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const imageUrl = await handleImageUpload(file)
        setFormData({...formData, image: imageUrl})
      } catch (error) {
        alert(error)
      }
    }
  }

  if (!isAdmin()) {
    return <div>Acesso negado</div>
  }

  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"></li>
            <li>
              <Link to="/admin" className="admin-link">Usuários</Link>
            </li>
            <li>
              <Link to="/" className="sign-in">Home</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <div className='content'>
        <main className="admin-content">
          <h1>Gerenciar Produtos</h1>
        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
          <button onClick={() => setShowAddForm(true)} className="btn-add">Adicionar Produto</button>
          <button onClick={() => setShowCategoryForm(true)} className="btn-add">Adicionar Categoria</button>
        </div>
        
        {showAddForm && (
          <form onSubmit={handleAdd} className="product-form">
            <input 
              type="text" 
              placeholder="Nome do produto" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
            <input 
              type="number" 
              placeholder="Preço" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required 
            />
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Selecione categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="URL da imagem" 
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <div>
              <button type="submit" className="btn-save">Salvar</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">Cancelar</button>
            </div>
          </form>
        )}

        {showCategoryForm && (
          <form onSubmit={handleAddCategory} className="product-form">
            <input 
              type="text" 
              placeholder="Nome da categoria" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required 
            />
            <div>
              <button type="submit" className="btn-save">Adicionar</button>
              <button type="button" onClick={() => setShowCategoryForm(false)} className="btn-cancel">Cancelar</button>
            </div>
          </form>
        )}

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    {editingProduct === product.id ? (
                      <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    ) : product.name}
                  </td>
                  <td>
                    {editingProduct === product.id ? (
                      <input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    ) : `R$${product.price.toFixed(2)}`}
                  </td>
                  <td>
                    {editingProduct === product.id ? (
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    ) : product.category}
                  </td>
                  <td className="actions">
                    {editingProduct === product.id ? (
                      <>
                        <button onClick={() => handleUpdate(product.id)} className="btn-save">Salvar</button>
                        <button onClick={() => setEditingProduct(null)} className="btn-cancel">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(product)} className="btn-edit">Editar</button>
                        <button onClick={() => handleDelete(product.id)} className="btn-delete">Deletar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </main>
      </div>
    </>
  )
}

export default AdminProducts