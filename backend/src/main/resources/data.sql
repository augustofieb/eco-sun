-- Inserir dados iniciais apenas se não existirem

-- Criar tabela Avaliacao se não existir
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Avaliacao' AND xtype='U')
CREATE TABLE Avaliacao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ProdutoId INT NOT NULL,
    UsuarioId INT NOT NULL,
    NomeUsuario NVARCHAR(100) NOT NULL,
    Nota INT NOT NULL,
    Comentario NTEXT,
    DataAvaliacao DATETIME2 NOT NULL
);

-- Criar tabela Orcamento se não existir
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orcamento' AND xtype='U')
CREATE TABLE Orcamento (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    area_telhado DECIMAL(8,2),
    conta_mensal_media DECIMAL(8,2),
    tipo_telhado VARCHAR(50),
    objetivo_energia VARCHAR(50),
    potencia_sistema DECIMAL(8,2),
    numero_paineis INT,
    produtos_selecionados NTEXT,
    preco_total DECIMAL(10,2),
    energia_total_gerada DECIMAL(8,2),
    economia_mensal DECIMAL(8,2),
    tempo_retorno_meses INT,
    reducao_co2_anual DECIMAL(8,2),
    data_criacao DATETIME2 DEFAULT GETDATE(),
    data_orcamento DATETIME2,
    status NVARCHAR(20) DEFAULT 'RASCUNHO'
);

-- Garantir coluna nome na tabela Orcamento (migração caso a tabela já exista)
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'nome'
)
BEGIN
    ALTER TABLE Orcamento ADD nome VARCHAR(100) NOT NULL DEFAULT 'Orçamento';
END

IF OBJECT_ID('Orcamento', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'email')
        ALTER TABLE Orcamento ADD email VARCHAR(100);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'telefone')
        ALTER TABLE Orcamento ADD telefone VARCHAR(20);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'endereco')
        ALTER TABLE Orcamento ADD endereco VARCHAR(255);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'area_telhado')
        ALTER TABLE Orcamento ADD area_telhado DECIMAL(8,2);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'conta_mensal_media')
        ALTER TABLE Orcamento ADD conta_mensal_media DECIMAL(8,2);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'tipo_telhado')
        ALTER TABLE Orcamento ADD tipo_telhado VARCHAR(50);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'objetivo_energia')
        ALTER TABLE Orcamento ADD objetivo_energia VARCHAR(50);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'potencia_sistema')
        ALTER TABLE Orcamento ADD potencia_sistema DECIMAL(8,2);
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'numero_paineis')
        ALTER TABLE Orcamento ADD numero_paineis INT;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Orcamento' AND COLUMN_NAME = 'data_orcamento')
        ALTER TABLE Orcamento ADD data_orcamento DATETIME2;
END

-- Adicionar colunas às tabelas existentes se não existirem
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categoria' AND COLUMN_NAME = 'especificacoes_obrigatorias')
ALTER TABLE Categoria ADD especificacoes_obrigatorias NTEXT;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Produto' AND COLUMN_NAME = 'especificacoes_tecnicas')
ALTER TABLE Produto ADD especificacoes_tecnicas NTEXT;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Produto' AND COLUMN_NAME = 'produtos_compativeis')
ALTER TABLE Produto ADD produtos_compativeis NTEXT;

-- Inserir usuário admin se não existir
IF NOT EXISTS (SELECT * FROM Usuario WHERE email = 'admin@ecosun.com')
INSERT INTO Usuario (nome, email, senha, nivelAcesso, dataCadastro, statusUsuario) VALUES 
('Admin', 'admin@ecosun.com', '$2a$10$8K1p/wgDKRoYBk7YQBXAve7rUzHFCxCqAU8W2Y.Glr9AiWYf.yvAW', 'ADMIN', GETDATE(), 'ATIVO');

-- Inserir categorias se não existirem
IF NOT EXISTS (SELECT * FROM Categoria)
BEGIN
    INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES 
    ('Painéis Solares', 'Painéis fotovoltaicos para geração de energia', '{"energia":"Potência (W)","dimensoes":"Dimensões (cm)","eficiencia":"Eficiência (%)","garantia":"Garantia (anos)"}'),
    ('Inversores', 'Inversores para conversão de energia', '{"potencia":"Potência (W)","tensao_entrada":"Tensão de Entrada (V)","tensao_saida":"Tensão de Saída (V)","eficiencia":"Eficiência (%)"}'),
    ('Baterias', 'Sistemas de armazenamento de energia', '{"capacidade":"Capacidade (Ah)","tensao":"Tensão (V)","tipo":"Tipo de Bateria","ciclos_vida":"Ciclos de Vida"}'),
    ('Controladores', 'Controladores de carga e descarga', '{"corrente_maxima":"Corrente Máxima (A)","tensao_sistema":"Tensão do Sistema (V)","tipo":"Tipo (PWM/MPPT)","display":"Display"}');
END

-- Inserir produtos se não existirem
IF NOT EXISTS (SELECT * FROM Produto)
BEGIN
    INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, especificacoes_tecnicas, produtos_compativeis) VALUES 
    ('Painel Solar 400W', 'Painel solar monocristalino de alta eficiência', 899.99, 1, 'ATIVO', '{"energia":400,"dimensoes":"200x100x3.5","eficiencia":21.5,"garantia":25}', '[2,4]'),
    ('Inversor 3000W', 'Inversor senoidal puro para sistemas residenciais', 1299.99, 2, 'ATIVO', '{"potencia":3000,"tensao_entrada":"12-48","tensao_saida":"220","eficiencia":95}', '[1,3]'),
    ('Bateria Lithium 100Ah', 'Bateria de lítio para armazenamento de energia', 2499.99, 3, 'ATIVO', '{"capacidade":100,"tensao":12,"tipo":"Lítio","ciclos_vida":6000}', '[2,4]'),
    ('Controlador MPPT 60A', 'Controlador de carga com tecnologia MPPT', 599.99, 4, 'ATIVO', '{"corrente_maxima":60,"tensao_sistema":"12/24/48","tipo":"MPPT","display":"LCD"}', '[1,3]');
END

-- Inserir conteúdo inicial editável se não existir
IF NOT EXISTS (SELECT * FROM Conteudo)
BEGIN
    INSERT INTO Conteudo (chave, conteudo) VALUES
    ('sobre', 'A ECO SUN é uma empresa dedicada a fornecer soluções sustentáveis de energia solar para residências e empresas. Nossa missão é tornar a energia limpa acessível a todos.\n\nFundada em 2020, já ajudamos centenas de famílias a reduzirem sua pegada de carbono e economizarem na conta de luz.'),
    ('renovavel', 'Economia: Reduza até 95% da sua conta de luz\nSustentabilidade: Energia limpa e renovável\nValorização: Aumenta o valor do seu imóvel\nIndependência: Menos dependência da rede elétrica\nDurabilidade: Painéis com vida útil de 25+ anos'),
    ('faq', 'Quanto tempo dura a instalação?|A instalação residencial típica leva de 1 a 3 dias.\nFunciona em dias nublados?|Sim, os painéis geram energia mesmo com pouca luz solar.\nQual a garantia dos equipamentos?|Oferecemos 2 anos de garantia em todos os equipamentos.');
END

-- Indices usados pelos filtros publicos e consultas de relacionamento.
IF OBJECT_ID('Produto', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_produtos_status_categoria')
    CREATE INDEX IX_produtos_status_categoria ON Produto (status_produto, categoria_id);
IF OBJECT_ID('Avaliacao', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_avaliacoes_produto')
    CREATE INDEX IX_avaliacoes_produto ON Avaliacao (ProdutoId);
IF OBJECT_ID('Orcamento', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_orcamentos_usuario')
    CREATE INDEX IX_orcamentos_usuario ON Orcamento (usuario_id);