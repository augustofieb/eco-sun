import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './server/config/database.js'
import authRoutes from './server/routes/auth.js'
import productRoutes from './server/routes/products.js'
import categoryRoutes from './server/routes/categories.js'
import orcamentoRoutes from './server/routes/orcamentos.js'
import userRoutes from './server/routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orcamentos', orcamentoRoutes)
app.use('/api/users', userRoutes)

// Inicializar servidor
const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

startServer()