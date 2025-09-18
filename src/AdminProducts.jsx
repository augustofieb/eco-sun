import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/auth'
import { productsAPI, categoriesAPI } from './services/api'

import './AdminProducts.css'
import Logo from './assets/Logo.png'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', category: '', image: '', description: '' })
  const [newCategory, setNewCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadProducts()
    loadCategories()
  }, [navigate])

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll()
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

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await productsAPI.create({ 
        nome: formData.name, 
        preco: parseFloat(formData.price),
        categoria_id: categories.find(c => c.nome === formData.category)?.id,
        descricao: formData.description
      })
      setFormData({ name: '', price: '', category: '', image: '', description: '' })
      setShowAddForm(false)
      loadProducts()
    } catch (error) {
      alert('Erro ao adicionar produto')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product.id)
    setFormData({ name: product.nome, price: product.preco, category: product.categoria_nome, image: product.image || '', description: product.descricao || '' })
  }

  const handleUpdate = async (productId) => {
    try {
      await productsAPI.update(productId, {
        nome: formData.name,
        preco: parseFloat(formData.price),
        categoria_id: categories.find(c => c.nome === formData.category)?.id,
        descricao: formData.description
      })
      setEditingProduct(null)
      setFormData({ name: '', price: '', category: '', image: '', description: '' })
      loadProducts()
    } catch (error) {
      alert('Erro ao atualizar produto')
    }
  }

  const handleDelete = async (productId) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await productsAPI.delete(productId)
        loadProducts()
      } catch (error) {
        alert('Erro ao deletar produto')
      }
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) {
      alert('Nome da categoria é obrigatório')
      return
    }
    
    try {
      console.log('Tentando criar categoria:', newCategory)
      const response = await categoriesAPI.create({ nome: newCategory.trim() })
      console.log('Resposta:', response)
      setNewCategory('')
      setShowCategoryForm(false)
      loadCategories()
      alert('Categoria criada com sucesso!')
    } catch (error) {
      console.error('Erro detalhado:', error)
      alert('Erro ao criar categoria: ' + (error.response?.data?.message || error.message))
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
                <option key={cat.id} value={cat.nome}>{cat.nome}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="URL da imagem" 
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />

            <textarea 
              placeholder="Descrição do produto" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
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
                <th>Descrição</th>
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
                    ) : `R$${product.preco.toFixed(2)}`}
                  </td>
                  <td>
                    {editingProduct === product.id ? (
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                        ))}
                      </select>
                    ) : product.categoria_nome}
                  </td>
                  <td>
                    {editingProduct === product.id ? (
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows="2"
                      />
                    ) : (product.descricao ? product.descricao.substring(0, 50) + '...' : 'Sem descrição')}
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