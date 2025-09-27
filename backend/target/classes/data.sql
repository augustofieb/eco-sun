-- Inserir dados iniciais apenas se não existirem

-- Inserir usuário admin se não existir
IF NOT EXISTS (SELECT * FROM Usuario WHERE email = 'admin@ecosun.com')
INSERT INTO Usuario (nome, email, senha, nivelAcesso, dataCadastro, statusUsuario) VALUES 
('Admin', 'admin@ecosun.com', '$2a$10$8K1p/wgDKRoYBk7YQBXAve7rUzHFCxCqAU8W2Y.Glr9AiWYf.yvAW', 'ADMIN', GETDATE(), 'ATIVO');

-- Inserir categorias se não existirem
IF NOT EXISTS (SELECT * FROM Categoria)
BEGIN
    INSERT INTO Categoria (nome, descricao) VALUES 
    ('Painéis Solares', 'Painéis fotovoltaicos para geração de energia'),
    ('Inversores', 'Inversores para conversão de energia'),
    ('Baterias', 'Sistemas de armazenamento de energia'),
    ('Controladores', 'Controladores de carga e descarga');
END

-- Inserir produtos se não existirem
IF NOT EXISTS (SELECT * FROM Produto)
BEGIN
    INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto) VALUES 
    ('Painel Solar 400W', 'Painel solar monocristalino de alta eficiência', 899.99, 1, 'ATIVO'),
    ('Inversor 3000W', 'Inversor senoidal puro para sistemas residenciais', 1299.99, 2, 'ATIVO'),
    ('Bateria Lithium 100Ah', 'Bateria de lítio para armazenamento de energia', 2499.99, 3, 'ATIVO'),
    ('Controlador MPPT 60A', 'Controlador de carga com tecnologia MPPT', 599.99, 4, 'ATIVO');
END