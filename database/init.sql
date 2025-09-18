-- Inserir categorias
INSERT INTO Categoria (nome, descricao) VALUES 
('Painéis Solares', 'Painéis fotovoltaicos para geração de energia solar'),
('Inversores', 'Equipamentos para conversão de energia DC para AC'),
('Baterias', 'Sistemas de armazenamento de energia'),
('Controladores', 'Controladores de carga solar'),
('Acessórios', 'Cabos, conectores e outros acessórios');

-- Inserir produtos
INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto) VALUES 
('Painel Solar 550W', 'Painel solar monocristalino de alta eficiência', 899.99, 1, 'ATIVO'),
('Painel Solar 450W', 'Painel solar policristalino econômico', 699.99, 1, 'ATIVO'),
('Microinversor 600W', 'Microinversor para sistemas residenciais', 1299.99, 2, 'ATIVO'),
('Inversor String 5kW', 'Inversor string para sistemas comerciais', 2499.99, 2, 'ATIVO'),
('Bateria Lítio 100Ah', 'Bateria de lítio para armazenamento', 3999.99, 3, 'ATIVO'),
('Controlador MPPT 60A', 'Controlador de carga MPPT avançado', 899.99, 4, 'ATIVO');