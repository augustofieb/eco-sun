# Setup do Projeto ECO SUN

## Configuração do Banco de Dados

### 1. Executar Scripts SQL
Execute os scripts na seguinte ordem no banco `eco_sun`:

1. **Criar tabelas** (script fornecido pelo usuário)
2. **Inserir dados iniciais**:
```sql
-- Execute o arquivo database/init.sql
```

### 2. Configuração do Ambiente
O arquivo `.env` já está configurado com as credenciais:
```
DB_SERVER=Eco_Sun.mssql.somee.com
DB_DATABASE=eco_sun
DB_USER=ecosun_SQLLogin_2
DB_PASSWORD=v4qnn3ktfu
JWT_SECRET=eco_sun_jwt_secret_key_2024
PORT=3001
```

## Executar o Projeto

### Opção 1: Frontend e Backend separados
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### Opção 2: Executar tudo junto
```bash
npm run dev:full
```

## Funcionalidades Implementadas

### Backend (API)
- ✅ Autenticação JWT
- ✅ Login/Registro de usuários
- ✅ Recuperação de senha
- ✅ CRUD de produtos
- ✅ Listagem de categorias
- ✅ Sistema de orçamentos

### Frontend
- ✅ Login integrado com API
- ✅ Registro integrado com API
- ✅ Recuperação de senha
- ✅ Carregamento de produtos via API
- ✅ Carregamento de categorias via API

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/forgot-password` - Recuperar senha
- `PUT /api/auth/change-password` - Alterar senha

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto
- `POST /api/products` - Criar produto (Admin)
- `PUT /api/products/:id` - Atualizar produto (Admin)
- `DELETE /api/products/:id` - Remover produto (Admin)

### Categorias
- `GET /api/categories` - Listar categorias

### Orçamentos
- `POST /api/orcamentos` - Criar orçamento
- `GET /api/orcamentos/meus` - Listar meus orçamentos

## Usuário Admin Padrão
- Email: fulano@email.com.br
- Senha: 12345678 (base64: MTIzNDU2Nzg=)