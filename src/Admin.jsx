import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/authAPI'
import { getUsers, searchUsers, updateUser, deleteUser } from './utils/usersAPI'
import './Admin.css'
import Logo from './assets/Logo.png'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState({ nome: '', email: '', nivelAcesso: '', statusUsuario: '' })
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadUsers()
  }, [navigate])

  const loadUsers = async () => {
    const allUsers = await getUsers()
    setUsers(allUsers)
    setFilteredUsers(allUsers)
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredUsers(users)
    } else {
      const searchResults = await searchUsers(query)
      setFilteredUsers(searchResults)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user.id)
    setShowEditForm(true)
    setEditForm({ 
      nome: user.nome, 
      email: user.email, 
      nivelAcesso: user.nivelAcesso,
      statusUsuario: user.statusUsuario
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateUser(editingUser, editForm)
      setEditingUser(null)
      setShowEditForm(false)
      setEditForm({ nome: '', email: '', nivelAcesso: '', statusUsuario: '' })
      loadUsers()
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }

  const handleDeactivate = async (user) => {
    try {
      const updatedUser = {
        nome: user.nome,
        email: user.email,
        nivelAcesso: user.nivelAcesso,
        statusUsuario: 'INATIVO'
      }
      await updateUser(user.id, updatedUser)
      loadUsers()
    } catch (error) {
      console.error('Erro ao desativar usuário:', error)
    }
  }

  const handleReactivate = async (user) => {
    try {
      const updatedUser = {
        nome: user.nome,
        email: user.email,
        nivelAcesso: user.nivelAcesso,
        statusUsuario: 'ATIVO'
      }
      await updateUser(user.id, updatedUser)
      loadUsers()
    } catch (error) {
      console.error('Erro ao reativar usuário:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Nível de Acesso', 'Status']
    const csvData = filteredUsers.map(user => [
      user.id,
      user.nome,
      user.email,
      user.nivelAcesso,
      user.statusUsuario
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_usuarios_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <Link to="/admin-products" className="admin-link">Produtos</Link>
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
        <h1> Painel Administrativo</h1>
        <div className="users-table">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Gerenciar Usuários ({filteredUsers.length} usuários)</h2>
            <button onClick={exportToCSV} className="btn-save" style={{padding: '10px 20px'}}>
               Exportar Relatório
            </button>
          </div>
          
          {showEditForm && (
            <form onSubmit={handleUpdate} className="product-form">
              <input 
                type="text" 
                placeholder="Nome do usuário" 
                value={editForm.nome}
                onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                required 
              />
              <select 
                value={editForm.nivelAcesso}
                onChange={(e) => setEditForm({...editForm, nivelAcesso: e.target.value})}
                required
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <select 
                value={editForm.statusUsuario}
                onChange={(e) => setEditForm({...editForm, statusUsuario: e.target.value})}
                required
              >
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
              <div>
                <button type="submit" className="btn-save">Atualizar</button>
                <button type="button" onClick={() => {
                  setShowEditForm(false)
                  setEditingUser(null)
                  setEditForm({ nome: '', email: '', nivelAcesso: '', statusUsuario: '' })
                }} className="btn-cancel">Cancelar</button>
              </div>
            </form>
          )}
          
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Pesquisar por nome, email ou ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Nível</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                    {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário registrado'}
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.nivelAcesso}</td>
                  <td>{user.statusUsuario}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(user)} className="btn-edit">Editar</button>
                    {user.statusUsuario === 'ATIVO' ? (
                      <button onClick={() => handleDeactivate(user)} className="btn-delete">Desativar</button>
                    ) : (
                      <button onClick={() => handleReactivate(user)} className="btn-save">Reativar</button>
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

export default Admin