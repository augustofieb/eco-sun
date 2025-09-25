-- Inserir categorias
INSERT INTO Categoria (Nome, Descricao, StatusCategoria) VALUES 
('Painéis Solares', 'Painéis fotovoltaicos para captação de energia solar', 'ATIVO'),
('Inversores', 'Equipamentos para conversão de energia DC para AC', 'ATIVO'),
('Baterias', 'Sistemas de armazenamento de energia', 'ATIVO'),
('Controladores', 'Controladores de carga solar', 'ATIVO');

-- Inserir produtos de exemplo
INSERT INTO Produto (Nome, Descricao, Preco, CategoriaId, FotoUrl, StatusProduto) VALUES 
('Painel Solar 450W', 'Painel solar monocristalino de alta eficiência 450W', 899.99, 1, '/assets/placa_solar.png', 'ATIVO'),
('Inversor 3000W', 'Inversor senoidal pura 3000W 24V', 1299.99, 2, '/assets/microinversor.png', 'ATIVO'),
('Bateria Lithium 100Ah', 'Bateria de lítio 12V 100Ah para sistemas solares', 2499.99, 3, '/assets/Bateria_solar.png', 'ATIVO'),
('Controlador MPPT 60A', 'Controlador de carga MPPT 60A 12V/24V', 399.99, 4, '/assets/controlador.png', 'ATIVO'),
('Painel Solar 550W', 'Painel solar monocristalino premium 550W', 1099.99, 1, '/assets/placa_solar.png', 'ATIVO'),
('Inversor 5000W', 'Inversor híbrido 5000W com MPPT integrado', 2199.99, 2, '/assets/microinversor.png', 'ATIVO');

-- Inserir usuário admin padrão
INSERT INTO Usuario (Nome, Email, Senha, NivelAcesso, DataCadastro, StatusUsuario) VALUES 
('Administrador', 'admin@ecosun.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', NOW(), 'ATIVO');
-- Senha: password