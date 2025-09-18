import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sql from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body
    
    const hashedPassword = await bcrypt.hash(senha, 10)
    
    const request = new sql.Request()
    await request
      .input('nome', sql.VarChar, nome)
      .input('email', sql.VarChar, email)
      .input('senha', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Usuario (nome, email, senha, nivelAcesso, dataCadastro, statusUsuario)
        VALUES (@nome, @email, @senha, 'CLIENTE', GETDATE(), 'ATIVO')
      `)
    
    res.status(201).json({ message: 'Usuário criado com sucesso' })
  } catch (error) {
    if (error.number === 2627) {
      res.status(400).json({ message: 'Email já cadastrado' })
    } else {
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body
    
    const request = new sql.Request()
    const result = await request
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Usuario WHERE email = @email AND statusUsuario = \'ATIVO\'')
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }
    
    const user = result.recordset[0]
    const validPassword = await bcrypt.compare(senha, user.senha)
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, nivelAcesso: user.nivelAcesso },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        nivelAcesso: user.nivelAcesso
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Esqueci a senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    const request = new sql.Request()
    const result = await request
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM Usuario WHERE email = @email')
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Email não encontrado' })
    }
    
    // Gerar nova senha temporária
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)
    
    await request
      .input('senha', sql.VarChar, hashedPassword)
      .input('id', sql.Int, result.recordset[0].id)
      .query('UPDATE Usuario SET senha = @senha, statusUsuario = \'TROCAR_SENHA\' WHERE id = @id')
    
    res.json({ 
      message: 'Nova senha enviada',
      tempPassword // Em produção, enviar por email
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Alterar senha
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body
    
    const request = new sql.Request()
    const result = await request
      .input('id', sql.Int, req.user.id)
      .query('SELECT senha FROM Usuario WHERE id = @id')
    
    const user = result.recordset[0]
    const validPassword = await bcrypt.compare(senhaAtual, user.senha)
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Senha atual incorreta' })
    }
    
    const hashedPassword = await bcrypt.hash(novaSenha, 10)
    
    await request
      .input('senha', sql.VarChar, hashedPassword)
      .query('UPDATE Usuario SET senha = @senha, statusUsuario = \'ATIVO\' WHERE id = @id')
    
    res.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router