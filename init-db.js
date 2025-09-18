import sql from './server/config/database.js'
import { connectDB } from './server/config/database.js'

const initDatabase = async () => {
  try {
    await connectDB()
    
    // Inserir categorias
    const request = new sql.Request()
    
    await request.query(`
      IF NOT EXISTS (SELECT 1 FROM Categoria WHERE nome = 'Painéis Solares')
      INSERT INTO Categoria (nome, descricao) VALUES 
      ('Painéis Solares', 'Painéis fotovoltaicos para geração de energia solar'),
      ('Inversores', 'Equipamentos para conversão de energia DC para AC'),
      ('Baterias', 'Sistemas de armazenamento de energia'),
      ('Controladores', 'Controladores de carga solar')
    `)
    
    await request.query(`
      IF NOT EXISTS (SELECT 1 FROM Produto WHERE nome = 'Painel Solar 550W')
      INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto) VALUES 
      ('Painel Solar 550W', 'Painel solar monocristalino de alta eficiência', 899.99, 1, 'ATIVO'),
      ('Microinversor 600W', 'Microinversor para sistemas residenciais', 1299.99, 2, 'ATIVO'),
      ('Bateria Lítio 100Ah', 'Bateria de lítio para armazenamento', 3999.99, 3, 'ATIVO'),
      ('Controlador MPPT 60A', 'Controlador de carga MPPT avançado', 899.99, 4, 'ATIVO')
    `)
    
    console.log('Dados inseridos com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('Erro:', error)
    process.exit(1)
  }
}

initDatabase()