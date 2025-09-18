import express from 'express'
import sql from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Criar orçamento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { valor, itens } = req.body
    
    const request = new sql.Request()
    
    // Criar orçamento
    const orcamentoResult = await request
      .input('usuario_id', sql.Int, req.user.id)
      .input('valor', sql.Decimal, valor)
      .query(`
        INSERT INTO Orcamento (usuario_id, data_orcamento, valor, status_orcamento)
        OUTPUT INSERTED.id
        VALUES (@usuario_id, GETDATE(), @valor, 'PENDENTE')
      `)
    
    const orcamentoId = orcamentoResult.recordset[0].id
    
    // Adicionar itens
    for (const item of itens) {
      await request
        .input('orcamento_id', sql.Int, orcamentoId)
        .input('produto_id', sql.Int, item.produto_id)
        .input('quantidade', sql.Int, item.quantidade)
        .input('obs', sql.VarChar, item.obs || null)
        .query(`
          INSERT INTO ItensOrcamento (orcamento_id, produto_id, quantidade, obs, status_item)
          VALUES (@orcamento_id, @produto_id, @quantidade, @obs, 'PENDENTE')
        `)
    }
    
    res.status(201).json({ 
      message: 'Orçamento criado com sucesso',
      orcamentoId
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar orçamento' })
  }
})

// Listar orçamentos do usuário
router.get('/meus', authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request()
    const result = await request
      .input('usuario_id', sql.Int, req.user.id)
      .query(`
        SELECT o.*, 
               COUNT(i.id) as total_itens
        FROM Orcamento o
        LEFT JOIN ItensOrcamento i ON o.id = i.orcamento_id
        WHERE o.usuario_id = @usuario_id
        GROUP BY o.id, o.usuario_id, o.data_orcamento, o.valor, o.status_orcamento
        ORDER BY o.data_orcamento DESC
      `)
    
    res.json(result.recordset)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar orçamentos' })
  }
})

export default router