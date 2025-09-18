import express from 'express'
import sql from '../config/database.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Listar usuários (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const request = new sql.Request()
    const result = await request.query(`
      SELECT id, nome, email, nivelAcesso, dataCadastro, statusUsuario 
      FROM Usuario 
      ORDER BY dataCadastro DESC
    `)
    res.json(result.recordset)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' })
  }
})

// Atualizar usuário (Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, email, nivelAcesso } = req.body
    
    const request = new sql.Request()
    await request
      .input('id', sql.Int, req.params.id)
      .input('nome', sql.VarChar, nome)
      .input('email', sql.VarChar, email)
      .input('nivelAcesso', sql.VarChar, nivelAcesso)
      .query(`
        UPDATE Usuario 
        SET nome = @nome, email = @email, nivelAcesso = @nivelAcesso
        WHERE id = @id
      `)
    
    res.json({ message: 'Usuário atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário' })
  }
})

// Deletar usuário (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const request = new sql.Request()
    await request
      .input('id', sql.Int, req.params.id)
      .query('UPDATE Usuario SET statusUsuario = \'INATIVO\' WHERE id = @id')
    
    res.json({ message: 'Usuário removido com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover usuário' })
  }
})

export default router