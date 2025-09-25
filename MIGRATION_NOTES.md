# Migração do LocalStorage para API

## Mudanças Realizadas

### Backend
1. **Criado UsuarioController** - API para gerenciar usuários
2. **Criado AvaliacaoController** - API para gerenciar avaliações de produtos
3. **Criada entidade Avaliacao** - Para armazenar avaliações no banco
4. **Adicionado data.sql** - Dados iniciais para desenvolvimento

### Frontend
1. **Criados novos utilitários API**:
   - `usersAPI.js` - Gerenciamento de usuários via API
   - `reviewsAPI.js` - Gerenciamento de avaliações via API

2. **Componentes atualizados**:
   - `Admin.jsx` - Agora usa API para gerenciar usuários
   - `AdminProducts.jsx` - Usa API para produtos
   - `ProductDetails.jsx` - Usa API para produtos e avaliações
   - `Home.jsx` - Ajustado para campos corretos da API

3. **APIs expandidas**:
   - `api.js` - Adicionadas APIs para usuários e avaliações

## Funcionalidades Migradas

### ✅ Completamente Migradas
- **Autenticação** - Login/Register via API
- **Produtos** - CRUD completo via API
- **Usuários** - Gerenciamento via API (Admin)
- **Avaliações** - Sistema de reviews via API

### ⚠️ Mantidas no LocalStorage
- **Tema** - Preferência local do usuário
- **Token JWT** - Armazenamento seguro local

### 🚧 Em Desenvolvimento
- **Perfil do usuário** - Atualização de dados pessoais
- **Categorias** - CRUD de categorias via API

## Como Testar

1. **Inicie o backend**:
   ```bash
   cd backend && mvn spring-boot:run
   ```

2. **Inicie o frontend**:
   ```bash
   npm run dev
   ```

3. **Login de teste**:
   - Email: `admin@ecosun.com`
   - Senha: `password`

## Dados de Exemplo

O sistema agora carrega automaticamente:
- 4 categorias de produtos
- 6 produtos de exemplo
- 1 usuário administrador

## Próximos Passos

1. Implementar API para categorias
2. Adicionar API para atualização de perfil
3. Implementar upload de imagens
4. Adicionar validações mais robustas