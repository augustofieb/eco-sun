import express from 'express'
import sql from '../config/database.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Listar produtos
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query
    
    const request = new sql.Request()
    let query = `
      SELECT p.*, c.nome as categoria_nome 
      FROM Produto p 
      INNER JOIN Categoria c ON p.categoria_id = c.id 
      WHERE p.status_produto = 'ATIVO'
    `
    
    if (categoria && categoria !== 'all') {
      query += ' AND c.nome = @categoria'
      request.input('categoria', sql.VarChar, categoria)
    }
    
    const result = await request.query(query)
    res.json(result.recordset)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos' })
  }
})

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const request = new sql.Request()
    const result = await request
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT p.*, c.nome as categoria_nome 
        FROM Produto p 
        INNER JOIN Categoria c ON p.categoria_id = c.id 
        WHERE p.id = @id AND p.status_produto = 'ATIVO'
      `)
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' })
    }
    
    res.json(result.recordset[0])
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto' })
  }
})

// Criar produto (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, descricao, preco, categoria_id } = req.body
    
    const request = new sql.Request()
    const result = await request
      .input('nome', sql.VarChar, nome)
      .input('descricao', sql.VarChar, descricao)
      .input('preco', sql.Decimal, preco)
      .input('categoria_id', sql.Int, categoria_id)
      .query(`
        INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto)
        OUTPUT INSERTED.id
        VALUES (@nome, @descricao, @preco, @categoria_id, 'ATIVO')
      `)
    
    res.status(201).json({ 
      message: 'Produto criado com sucesso',
      id: result.recordset[0].id
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto' })
  }
})

// Atualizar produto (Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, descricao, preco, categoria_id } = req.body
    
    const request = new sql.Request()
    await request
      .input('id', sql.Int, req.params.id)
      .input('nome', sql.VarChar, nome)
      .input('descricao', sql.VarChar, descricao)
      .input('preco', sql.Decimal, preco)
      .input('categoria_id', sql.Int, categoria_id)
      .query(`
        UPDATE Produto 
        SET nome = @nome, descricao = @descricao, preco = @preco, categoria_id = @categoria_id
        WHERE id = @id
      `)
    
    res.json({ message: 'Produto atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto' })
  }
})

// Deletar produto (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const request = new sql.Request()
    await request
      .input('id', sql.Int, req.params.id)
      .query('UPDATE Produto SET status_produto = \'INATIVO\' WHERE id = @id')
    
    res.json({ message: 'Produto removido com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover produto' })
  }
})

export default router