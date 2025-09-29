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

-- Inserir conteúdo inicial editável se não existir
IF NOT EXISTS (SELECT * FROM Conteudo)
BEGIN
    INSERT INTO Conteudo (chave, conteudo) VALUES
    ('sobre', 'A ECO SUN é uma empresa dedicada a fornecer soluções sustentáveis de energia solar para residências e empresas. Nossa missão é tornar a energia limpa acessível a todos.\n\nFundada em 2020, já ajudamos centenas de famílias a reduzirem sua pegada de carbono e economizarem na conta de luz.'),
    ('renovavel', 'Economia: Reduza até 95% da sua conta de luz\nSustentabilidade: Energia limpa e renovável\nValorização: Aumenta o valor do seu imóvel\nIndependência: Menos dependência da rede elétrica\nDurabilidade: Painéis com vida útil de 25+ anos'),
    ('faq', 'Quanto tempo dura a instalação?|A instalação residencial típica leva de 1 a 3 dias.\nFunciona em dias nublados?|Sim, os painéis geram energia mesmo com pouca luz solar.\nQual a garantia dos equipamentos?|Oferecemos 2 anos de garantia em todos os equipamentos.');
END