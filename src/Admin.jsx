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
    setEditForm({ 
      nome: user.nome, 
      email: user.email, 
      nivelAcesso: user.nivelAcesso,
      statusUsuario: user.statusUsuario
    })
  }

  const handleUpdate = async (userId) => {
    try {
      await updateUser(userId, editForm)
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      // removed alert
    }
  }

  const handleDelete = async (userId) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await deleteUser(userId)
        loadUsers()
      } catch (error) {
        // removed alert
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
          <h2>Gerenciar Usuários ({filteredUsers.length} usuários)</h2>
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
                  <td>
                    {editingUser === user.id ? (
                      <input 
                        value={editForm.nome}
                        onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                      />
                    ) : user.nome}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <input 
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      />
                    ) : user.email}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <select 
                        value={editForm.nivelAcesso}
                        onChange={(e) => setEditForm({...editForm, nivelAcesso: e.target.value})}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : user.nivelAcesso}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <select 
                        value={editForm.statusUsuario}
                        onChange={(e) => setEditForm({...editForm, statusUsuario: e.target.value})}
                      >
                        <option value="ATIVO">ATIVO</option>
                        <option value="INATIVO">INATIVO</option>
                      </select>
                    ) : user.statusUsuario}
                  </td>
                  <td className="actions">
                    {editingUser === user.id ? (
                      <>
                        <button onClick={() => handleUpdate(user.id)} className="btn-save">Salvar</button>
                        <button onClick={() => setEditingUser(null)} className="btn-cancel">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(user)} className="btn-edit">Editar</button>
                        <button onClick={() => handleDelete(user.id)} className="btn-delete">Deletar</button>
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

export default Admin