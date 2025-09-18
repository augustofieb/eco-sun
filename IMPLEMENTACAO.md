# Implementação - Integração com Banco de Dados SQL Server

## ✅ Implementado

### Backend (Node.js + Express)
- **Servidor Express** (`server.js`)
- **Conexão SQL Server** (`server/config/database.js`)
- **Middleware de Autenticação JWT** (`server/middleware/auth.js`)

### Rotas da API
- **Autenticação** (`server/routes/auth.js`)
  - POST `/api/auth/register` - Registro de usuário
  - POST `/api/auth/login` - Login
  - POST `/api/auth/forgot-password` - Recuperação de senha
  - PUT `/api/auth/change-password` - Alterar senha

- **Produtos** (`server/routes/products.js`)
  - GET `/api/products` - Listar produtos (com filtro por categoria)
  - GET `/api/products/:id` - Buscar produto específico
  - POST `/api/products` - Criar produto (Admin)
  - PUT `/api/products/:id` - Atualizar produto (Admin)
  - DELETE `/api/products/:id` - Remover produto (Admin)

- **Categorias** (`server/routes/categories.js`)
  - GET `/api/categories` - Listar categorias

- **Orçamentos** (`server/routes/orcamentos.js`)
  - POST `/api/orcamentos` - Criar orçamento
  - GET `/api/orcamentos/meus` - Listar orçamentos do usuário

### Frontend (React)
- **Serviço de API** (`src/services/api.js`) - Cliente Axios configurado
- **Login atualizado** (`src/Login.jsx`) - Integrado com API
- **Registro atualizado** (`src/Register.jsx`) - Integrado com API
- **Recuperação de senha** (`src/ForgotPassword.jsx`) - Novo componente
- **Home atualizado** (`src/Home.jsx`) - Carrega dados via API

### Banco de Dados
- **Conexão configurada** com SQL Server na Somee
- **Script de dados iniciais** (`database/init.sql`)
- **Estrutura de tabelas** conforme especificado

## 🔧 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar projeto completo
```bash
npm run dev:full
```

### 3. Ou executar separadamente
```bash
# Backend (porta 3001)
npm run server

# Frontend (porta 5173)  
npm run dev
```

## 🗄️ Estrutura do Banco

### Tabelas Utilizadas
- `Usuario` - Usuários do sistema
- `Categoria` - Categorias de produtos
- `Produto` - Produtos de energia solar
- `Orcamento` - Orçamentos solicitados
- `ItensOrcamento` - Itens dos orçamentos

### Credenciais
- **Servidor**: Eco_Sun.mssql.somee.com
- **Banco**: eco_sun
- **Usuário**: ecosun_SQLLogin_2
- **Senha**: v4qnn3ktfu

## 🔐 Segurança
- Senhas criptografadas com bcrypt
- Autenticação JWT
- Middleware de autorização
- Validação de dados de entrada

## 📱 Funcionalidades
- ✅ Sistema completo de autenticação
- ✅ Gestão de produtos integrada ao banco
- ✅ Sistema de orçamentos
- ✅ Recuperação de senha
- ✅ Níveis de acesso (Admin/Cliente)
- ✅ Interface responsiva mantida

O projeto agora está completamente integrado ao banco de dados SQL Server, mantendo todas as funcionalidades originais do frontend e adicionando persistência real dos dados.