-- Criar tabelas se não existirem

-- Tabela de usuários
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso VARCHAR(20) DEFAULT 'CLIENTE',
    data_criacao DATETIME DEFAULT GETDATE()
);

-- Tabela de produtos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='produtos' AND xtype='U')
CREATE TABLE produtos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    foto_url VARCHAR(500),
    categoria_id INT NOT NULL,
    status_produto VARCHAR(20) DEFAULT 'ATIVO',
    data_criacao DATETIME DEFAULT GETDATE()
);

-- Tabela de avaliações
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='avaliacoes' AND xtype='U')
CREATE TABLE avaliacoes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    produto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_criacao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de preferências
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='preferencias' AND xtype='U')
CREATE TABLE preferencias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    tema VARCHAR(20) DEFAULT 'light',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);