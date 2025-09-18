import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/auth'
import { usersAPI } from './services/api'
import './Admin.css'
import Logo from './assets/Logo.png'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    loadUsers()
  }, [navigate])

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const handleDelete = async (userId) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await usersAPI.delete(userId)
        loadUsers()
      } catch (error) {
        alert('Erro ao deletar usuário')
      }
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user.id)
    setEditForm({ name: user.nome, email: user.email })
  }

  const handleUpdate = async (userId) => {
    try {
      await usersAPI.update(userId, editForm)
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      alert('Erro ao atualizar usuário')
    }
  }

  const handleToggleAdmin = async (userId) => {
    const user = users.find(u => u.id === userId)
    const newLevel = user.nivelAcesso === 'ADMIN' ? 'CLIENTE' : 'ADMIN'
    try {
      await usersAPI.update(userId, { ...user, nivelAcesso: newLevel })
      loadUsers()
    } catch (error) {
      alert('Erro ao alterar nível de acesso')
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
          <h2>Gerenciar Usuários ({users.length} usuários)</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                    Nenhum usuário registrado
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>
                    {editingUser === user.id ? (
                      <input 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
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
                  <td>{user.nivelAcesso === 'ADMIN' ? 'Sim' : 'Não'}</td>
                  <td className="actions">
                    {editingUser === user.id ? (
                      <>
                        <button onClick={() => handleUpdate(user.id)} className="btn-save">Salvar</button>
                        <button onClick={() => setEditingUser(null)} className="btn-cancel">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(user)} className="btn-edit">Editar</button>
                        <button onClick={() => handleToggleAdmin(user.id)} className="btn-admin">
                          {user.nivelAcesso === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
                        </button>
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