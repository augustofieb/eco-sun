import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/authAPI'
import { getProducts, searchProducts, createProduct, updateProduct, deleteProduct } from './utils/productsAPI'
import { getCategories, addCategory, searchCategories, deleteCategory, updateCategory } from './utils/categories'
import RichTextEditor from './components/RichTextEditor'
import AdminLayout from './components/AdminLayout'
import './AdminProducts.css'

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
  const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', categorySpecs: {} })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ nome: '', descricao: '', especificacoes: [] })

  const [newSpec, setNewSpec] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
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

  const filesToBase64 = (files) =>
    Promise.all(files.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })))

  const addFiles = (newFiles) => {
    const entries = newFiles.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setSelectedFiles(prev => [...prev, ...entries])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearFiles = () => {
    setSelectedFiles(prev => { prev.forEach(e => URL.revokeObjectURL(e.preview)); return [] })
  }

  const buildEspecificacoes = () => {
    const especificacoesTecnicas = {}
    if (formData.categorySpecs && Object.keys(formData.categorySpecs).length > 0) {
      Object.keys(formData.categorySpecs).forEach(key => {
        const value = formData[`spec_${key}`]
        if (value) especificacoesTecnicas[key] = value
      })
    }
    return JSON.stringify(especificacoesTecnicas)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const price = parseFloat(formData.price)
    if (price > 999999.99) return
    try {
      const base64Images = await filesToBase64(selectedFiles.map(e => e.file))
      await createProduct({
        nome: formData.name,
        preco: price,
        categoriaId: parseInt(formData.category),
        descricao: formData.description,
        foto: base64Images.join('|'),
        especificacoesTecnicas: buildEspecificacoes()
      })
      setFormData({ name: '', price: '', category: '', description: '', categorySpecs: {} })
      clearFiles()
      setShowAddForm(false)
      loadProducts()
    } catch (error) {
      console.error('Erro ao adicionar produto:', error.response?.data || error.message)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product.id)
    setShowAddForm(true)

    // Carregar especificações existentes do produto
    let existingSpecs = {}
    if (product.especificacoes_tecnicas) {
      try {
        existingSpecs = JSON.parse(product.especificacoes_tecnicas)
      } catch (e) {
        existingSpecs = {}
      }
    }

    // Preparar formData com especificações
    const formDataWithSpecs = {
      name: product.nome,
      price: product.preco,
      category: product.categoriaId,
      description: product.descricao || '',
      categorySpecs: {}
    }

    // Carregar especificações da categoria
    const selectedCategory = categories.find(cat => cat.id === product.categoriaId)
    if (selectedCategory?.especificacoes_obrigatorias) {
      try {
        const categorySpecs = JSON.parse(selectedCategory.especificacoes_obrigatorias)
        formDataWithSpecs.categorySpecs = categorySpecs

        // Preencher valores das especificações da categoria
        Object.keys(categorySpecs).forEach(key => {
          formDataWithSpecs[`spec_${key}`] = existingSpecs[key] || ''
        })
      } catch (e) {
        formDataWithSpecs.categorySpecs = {}
      }
    }

    // Adicionar especificações antigas que não estão mais na categoria
    Object.keys(existingSpecs).forEach(key => {
      if (!formDataWithSpecs.categorySpecs[key]) {
        formDataWithSpecs.categorySpecs[key] = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        formDataWithSpecs[`spec_${key}`] = existingSpecs[key]
      }
    })

    setFormData(formDataWithSpecs)
  }

  const handleUpdate = async (productId) => {
    try {
      const product = products.find(p => p.id === productId)
      let fotoUrl = product?.fotoUrl || ''
      if (selectedFiles.length > 0) {
        const base64Images = await filesToBase64(selectedFiles.map(e => e.file))
        fotoUrl = base64Images.join('|')
      }
      await updateProduct(productId, {
        nome: formData.name,
        preco: parseFloat(formData.price),
        categoriaId: parseInt(formData.category),
        descricao: formData.description,
        foto: fotoUrl,
        especificacoesTecnicas: buildEspecificacoes()
      })
      setEditingProduct(null)
      setShowAddForm(false)
      setFormData({ name: '', price: '', category: '', description: '', categorySpecs: {} })
      clearFiles()
      loadProducts()
    } catch (error) {
      // removed alert
    }
  }

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId)
      setDeletingProduct(null)
      loadProducts()
    } catch (error) {
      // removed alert
      setDeletingProduct(null)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    
    // Verificar se já existe categoria com o mesmo nome (apenas para nova categoria)
    if (!editingCategory) {
      const existingCategory = categories.find(cat => 
        cat.nome.toLowerCase() === newCategory.nome.toLowerCase()
      )
      
      if (existingCategory) {
        return
      }
    }
    
    try {
      const especificacoesObj = {}
      newCategory.especificacoes.forEach(spec => {
        especificacoesObj[spec.toLowerCase().replace(/\s+/g, '_')] = spec
      })
      
      if (editingCategory) {
        await updateCategory(editingCategory, {
          nome: newCategory.nome,
          descricao: newCategory.descricao,
          especificacoes: JSON.stringify(especificacoesObj)
        })
        setSuccessMessage('Categoria atualizada com sucesso!')
        setEditingCategory(null)
      } else {
        await addCategory(newCategory.nome, newCategory.descricao, JSON.stringify(especificacoesObj))
        setSuccessMessage('Categoria adicionada com sucesso!')
      }
      
      setNewCategory({ nome: '', descricao: '', especificacoes: [] })
      setNewSpec('')
      setShowCategoryForm(false)
      loadCategories()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      // removed alert
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId)
      setDeletingCategory(null)
      loadCategories()
      setSuccessMessage('Categoria removida com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      // removed alert
      setDeletingCategory(null)
    }
  }

  const addSpecification = () => {
    if (newSpec.trim()) {
      setNewCategory({
        ...newCategory,
        especificacoes: [...newCategory.especificacoes, newSpec.trim()]
      })
      setNewSpec('')
    }
  }

  const removeSpecification = (index) => {
    setNewCategory({
      ...newCategory,
      especificacoes: newCategory.especificacoes.filter((_, i) => i !== index)
    })
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category.id)
    setShowCategoryForm(true)
    
    // Carregar especificações existentes
    let existingSpecs = []
    if (category.especificacoes_obrigatorias) {
      try {
        const specsObj = JSON.parse(category.especificacoes_obrigatorias)
        existingSpecs = Object.values(specsObj)
      } catch (e) {
        existingSpecs = []
      }
    }
    
    setNewCategory({
      nome: category.nome,
      descricao: category.descricao || '',
      especificacoes: existingSpecs
    })
  }



  if (!isAdmin()) {
    return <div>Acesso negado</div>
  }

  return (
    <AdminLayout>
      <main className="admin-content">
      
          <h1>Gerenciar Produtos e Categorias</h1>
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
        
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
              <form onSubmit={editingProduct ? (e) => { e.preventDefault(); handleUpdate(editingProduct); } : handleAdd} className="product-form">
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
                  onChange={(e) => {
                    setFormData({...formData, category: e.target.value})
                    const selectedCategory = categories.find(cat => cat.id === parseInt(e.target.value))
                    if (selectedCategory?.especificacoes_obrigatorias) {
                      try {
                        const specs = JSON.parse(selectedCategory.especificacoes_obrigatorias)
                        setFormData(prev => ({...prev, categorySpecs: specs}))
                      } catch (e) {
                        setFormData(prev => ({...prev, categorySpecs: {}}))
                      }
                    } else {
                      setFormData(prev => ({...prev, categorySpecs: {}}))
                    }
                  }}
                  required
                >
                  <option value="">Selecione categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                
                {formData.categorySpecs && Object.keys(formData.categorySpecs).length > 0 && (
                  <div className="category-specs">
                    <h4>Especificações da Categoria:</h4>
                    {Object.entries(formData.categorySpecs).map(([key, label]) => (
                      <input
                        key={key}
                        type="text"
                        placeholder={label}
                        value={formData[`spec_${key}`] || ''}
                        onChange={(e) => setFormData({...formData, [`spec_${key}`]: e.target.value})}
                      />
                    ))}
                  </div>
                )}
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({...formData, description: value})}
                  placeholder="Descrição do produto..."
                />
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => addFiles(Array.from(e.target.files))}
                  required={!editingProduct}
                />
                {selectedFiles.length > 0 && (
                  <div style={{marginTop: '8px'}}>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '6px'}}>
                      {selectedFiles.length} foto(s) selecionada(s)
                    </div>
                    <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                      {selectedFiles.map((entry, i) => (
                        <div key={i} style={{position: 'relative'}}>
                          <img
                            src={entry.preview}
                            alt={`preview ${i + 1}`}
                            style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}}
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            style={{position: 'absolute', top: '-6px', right: '-6px', background: '#e53935', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', cursor: 'pointer', lineHeight: '1', padding: 0}}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {editingProduct && selectedFiles.length === 0 && (
                  <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>
                    Nenhum arquivo selecionado — imagens atuais serão mantidas
                  </div>
                )}
                <div>
                  <button type="submit" className="btn-save">{editingProduct ? 'Atualizar' : 'Salvar'}</button>
                  <button type="button" onClick={() => {
                    setShowAddForm(false)
                    setEditingProduct(null)
                    clearFiles()
                    setFormData({ name: '', price: '', category: '', description: '', categorySpecs: {} })
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
                
                <div className="specifications-section">
                  <h4>Especificações da Categoria</h4>
                  <div className="spec-input-container">
                    <input 
                      type="text" 
                      placeholder="Nova especificação" 
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                    />
                    <button type="button" onClick={addSpecification} className="btn-add-spec">+</button>
                  </div>
                  
                  {newCategory.especificacoes.length > 0 && (
                    <div className="specs-list">
                      {newCategory.especificacoes.map((spec, index) => (
                        <div key={index} className="spec-item">
                          <span>{spec}</span>
                          <button type="button" onClick={() => removeSpecification(index)} className="btn-remove-spec">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <button type="submit" className="btn-save">{editingCategory ? 'Atualizar' : 'Adicionar'}</button>
                  <button type="button" onClick={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                    setNewCategory({ nome: '', descricao: '', especificacoes: [] })
                    setNewSpec('')
                  }} className="btn-cancel">Cancelar</button>
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
                    <td>{product.nome}</td>
                    <td>`R$${(product.preco || 0).toFixed(2)}`</td>
                    <td>{categories.find(cat => cat.id === product.categoriaId)?.nome || 'N/A'}</td>
                    <td>{product.descricao ? product.descricao.substring(0, 50) + '...' : 'Sem descrição'}</td>
                    <td className="actions">
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
                      <button onClick={() => handleEditCategory(category)} className="btn-edit">Editar</button>
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
    </AdminLayout>
  )
}

export default AdminProducts