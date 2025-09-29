import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/authAPI'
import { getProducts, searchProducts, createProduct, updateProduct, deleteProduct } from './utils/productsAPI'
import { getCategories, addCategory, searchCategories, deleteCategory } from './utils/categories'
import './AdminProducts.css'
import Logo from './assets/Logo.png'

const AdminProducts = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', category: '', image: '', description: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [useFileUpload, setUseFileUpload] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [newCategory, setNewCategory] = useState({ nome: '', descricao: '' })
  const [imageError, setImageError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadProducts()
    loadCategories()
  }, [navigate])

  const loadCategories = async () => {
    const categoriesData = await getCategories()
    setCategories(categoriesData)
    setFilteredCategories(categoriesData)
  }

  const loadProducts = async () => {
    const productsData = await getProducts()
    setProducts(productsData)
    setFilteredProducts(productsData)
  }

  const handleProductSearch = async (query) => {
    setProductSearchQuery(query)
    if (query.trim() === '') {
      setFilteredProducts(products)
    } else {
      const searchResults = await searchProducts(query)
      setFilteredProducts(searchResults)
    }
  }

  const handleCategorySearch = async (query) => {
    setCategorySearchQuery(query)
    if (query.trim() === '') {
      setFilteredCategories(categories)
    } else {
      const searchResults = await searchCategories(query)
      const formattedResults = searchResults.map(cat => ({ id: cat.id, nome: cat.nome }))
      setFilteredCategories(formattedResults)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const price = parseFloat(formData.price)
    if (price > 999999.99) {
      alert('Preço muito alto. Máximo: R$ 999.999,99')
      return
    }
    if (!useFileUpload && formData.image && formData.image.length > 255) {
      alert('URL da imagem muito longa. Use URLs curtas de imagens hospedadas online.')
      return
    }
    
    try {
      if (useFileUpload && selectedFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('nome', formData.name)
        formDataUpload.append('preco', price)
        formDataUpload.append('categoriaId', parseInt(formData.category))
        formDataUpload.append('descricao', formData.description)
        formDataUpload.append('foto', selectedFile)
        
        const response = await fetch('/api/produtos/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataUpload
        })
        
        if (!response.ok) throw new Error('Erro ao criar produto')
      } else {
        const productData = {
          nome: formData.name,
          preco: price,
          categoriaId: parseInt(formData.category),
          descricao: formData.description,
          foto: formData.image
        }
        await createProduct(productData)
      }
      
      setFormData({ name: '', price: '', category: '', image: '', description: '' })
      setSelectedFile(null)
      setUseFileUpload(false)
      setShowAddForm(false)
      setImageError('')
      loadProducts()
    } catch (error) {
      console.error('Erro ao adicionar produto:', error.response?.data || error.message)
      alert('Erro ao adicionar produto: ' + (error.response?.data || error.message))
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product.id)
    setFormData({ 
      name: product.nome, 
      price: product.preco, 
      category: product.categoriaId, 
      image: product.fotoUrl || '', 
      description: product.descricao || '' 
    })
  }

  const handleUpdate = async (productId) => {
    if (!useFileUpload && formData.image && formData.image.length > 255) {
      alert('URL da imagem muito longa. Use URLs curtas de imagens hospedadas online.')
      return
    }
    
    try {
      if (useFileUpload && selectedFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('nome', formData.name)
        formDataUpload.append('preco', parseFloat(formData.price))
        formDataUpload.append('categoriaId', parseInt(formData.category))
        formDataUpload.append('descricao', formData.description)
        formDataUpload.append('foto', selectedFile)
        
        const response = await fetch(`/api/produtos/upload/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataUpload
        })
        
        if (!response.ok) throw new Error('Erro ao atualizar produto')
      } else {
        await updateProduct(productId, {
          nome: formData.name,
          preco: parseFloat(formData.price),
          categoriaId: parseInt(formData.category),
          descricao: formData.description,
          foto: formData.image
        })
      }
      
      setEditingProduct(null)
      setFormData({ name: '', price: '', category: '', image: '', description: '' })
      setSelectedFile(null)
      setUseFileUpload(false)
      loadProducts()
    } catch (error) {
      alert('Erro ao atualizar produto')
    }
  }

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId)
      setDeletingProduct(null)
      loadProducts()
    } catch (error) {
      alert('Erro ao deletar produto')
      setDeletingProduct(null)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      await addCategory(newCategory.nome, newCategory.descricao)
      setNewCategory({ nome: '', descricao: '' })
      setShowCategoryForm(false)
      loadCategories()
      alert('Categoria adicionada com sucesso!')
    } catch (error) {
      alert('Erro ao adicionar categoria: ' + (error.response?.data || error.message))
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId)
      setDeletingCategory(null)
      loadCategories()
      alert('Categoria deletada com sucesso!')
    } catch (error) {
      alert('Erro ao deletar categoria: ' + (error.response?.data || error.message))
      setDeletingCategory(null)
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
          <h1>Gerenciar Produtos e Categorias</h1>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Produtos
          </button>
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categorias
          </button>
        </div>
        
        {activeTab === 'products' && (
          <>
            <div className="add-button-container">
              <button onClick={() => setShowAddForm(true)} className="btn-add">Adicionar Produto</button>
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
                  max="999999.99"
                  step="0.01"
                  required 
                />
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Selecione categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                <div className="image-upload-section">
                  <label>
                    <input 
                      type="radio" 
                      name="imageType" 
                      checked={!useFileUpload}
                      onChange={() => {
                        setUseFileUpload(false)
                        setSelectedFile(null)
                      }}
                    />
                    URL da imagem
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="imageType" 
                      checked={useFileUpload}
                      onChange={() => {
                        setUseFileUpload(true)
                        setFormData({...formData, image: ''})
                        setImageError('')
                      }}
                    />
                    Upload de arquivo
                  </label>
                </div>
                
                {!useFileUpload ? (
                  <>
                    <input 
                      type="text" 
                      placeholder="URL da imagem (máx. 255 caracteres)" 
                      value={formData.image}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({...formData, image: value})
                        if (value.length > 255) {
                          setImageError('URL muito longa! Máximo 255 caracteres.')
                        } else {
                          setImageError('')
                        }
                      }}
                      style={{borderColor: imageError ? 'red' : '#ddd'}}
                    />
                    {imageError && <div style={{color: 'red', fontSize: '0.8rem', marginTop: '5px'}}>{imageError}</div>}
                  </>
                ) : (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                )}
                <textarea 
                  placeholder="Descrição do produto" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                />
                <div>
                  <button type="submit" className="btn-save" disabled={imageError}>Salvar</button>
                  <button type="button" onClick={() => {
                    setShowAddForm(false)
                    setImageError('')
                    setSelectedFile(null)
                    setUseFileUpload(false)
                  }} className="btn-cancel">Cancelar</button>
                </div>
              </form>
            )}
            
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Pesquisar por nome, descrição ou ID..."
                value={productSearchQuery}
                onChange={(e) => handleProductSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="add-button-container">
              <button onClick={() => setShowCategoryForm(true)} className="btn-add">Adicionar Categoria</button>
            </div>

            {showCategoryForm && (
              <form onSubmit={handleAddCategory} className="product-form">
                <input 
                  type="text" 
                  placeholder="Nome da categoria" 
                  value={newCategory.nome}
                  onChange={(e) => setNewCategory({...newCategory, nome: e.target.value})}
                  required 
                />
                <textarea 
                  placeholder="Descrição da categoria" 
                  value={newCategory.descricao}
                  onChange={(e) => setNewCategory({...newCategory, descricao: e.target.value})}
                  rows="3"
                />
                <div>
                  <button type="submit" className="btn-save">Adicionar</button>
                  <button type="button" onClick={() => setShowCategoryForm(false)} className="btn-cancel">Cancelar</button>
                </div>
              </form>
            )}
            
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Pesquisar por nome, descrição ou ID..."
                value={categorySearchQuery}
                onChange={(e) => handleCategorySearch(e.target.value)}
                className="search-input"
              />
            </div>
          </>
        )}

        {activeTab === 'products' && (
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                      {productSearchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                    </td>
                  </tr>
                ) : filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      {editingProduct === product.id ? (
                        <input 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      ) : product.nome}
                    </td>
                    <td>
                      {editingProduct === product.id ? (
                        <input 
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                      ) : `R$${(product.preco || 0).toFixed(2)}`}
                    </td>
                    <td>
                      {editingProduct === product.id ? (
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                          ))}
                        </select>
                      ) : (categories.find(cat => cat.id === product.categoriaId)?.nome || 'N/A')}
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
                          <button 
                            onClick={() => deletingProduct === product.id ? setDeletingProduct(null) : setDeletingProduct(product.id)} 
                            className={deletingProduct === product.id ? "btn-cancel" : "btn-delete"}
                          >
                            {deletingProduct === product.id ? "Cancelar" : "Deletar"}
                          </button>
                          {deletingProduct === product.id && (
                            <button onClick={() => handleDelete(product.id)} className="btn-save">Confirmar</button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                      {categorySearchQuery ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                    </td>
                  </tr>
                ) : filteredCategories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.nome}</td>
                    <td>{category.descricao || 'Sem descrição'}</td>
                    <td className="actions">
                      <button 
                        onClick={() => deletingCategory === category.id ? setDeletingCategory(null) : setDeletingCategory(category.id)} 
                        className={deletingCategory === category.id ? "btn-cancel" : "btn-delete"}
                      >
                        {deletingCategory === category.id ? "Cancelar" : "Deletar"}
                      </button>
                      {deletingCategory === category.id && (
                        <button onClick={() => handleDeleteCategory(category.id)} className="btn-save">Confirmar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </main>
      </div>
    </>
  )
}

export default AdminProducts