import sql from 'mssql'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

let pool

export const connectDB = async () => {
  try {
    pool = await sql.connect(config)
    console.log('Conectado ao SQL Server')
    return pool
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err)
    throw err
  }
}

export const getPool = () => pool

export default sql