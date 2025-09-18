import express from 'express'
import sql from '../config/database.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Listar categorias
router.get('/', async (req, res) => {
  try {
    const request = new sql.Request()
    const result = await request.query('SELECT * FROM Categoria ORDER BY nome')
    res.json(result.recordset)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({ message: 'Erro ao buscar categorias' })
  }
})

// Criar categoria (Admin)
router.post('/', async (req, res) => {
  try {
    const { nome, descricao } = req.body
    
    if (!nome) {
      return res.status(400).json({ message: 'Nome da categoria é obrigatório' })
    }
    
    console.log('Criando categoria:', nome)
    
    const request = new sql.Request()
    await request
      .input('nome', sql.VarChar, nome)
      .input('descricao', sql.VarChar, descricao || '')
      .query('INSERT INTO Categoria (nome, descricao) VALUES (@nome, @descricao)')
    
    res.json({ message: 'Categoria criada com sucesso' })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({ message: 'Erro ao criar categoria' })
  }
})

export default router