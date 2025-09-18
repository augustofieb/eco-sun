# COMO INICIAR O PROJETO ECO SUN

## ⚠️ IMPORTANTE: Execute os scripts SQL primeiro!

### 1. Criar tabelas no banco de dados
Execute o script SQL fornecido no banco `eco_sun` para criar as tabelas:
- Usuario
- Categoria  
- Produto
- Orcamento
- ItensOrcamento

### 2. Comandos para iniciar:

```bash
# Navegar para o diretório
cd /workspaces/eco-sun

# Instalar dependências (se necessário)
npm install

# Iniciar APENAS o frontend (sem API)
npm run dev

# OU iniciar backend + frontend
npm run dev:full
```

### 3. Acessar:
- **Site**: http://localhost:5173

### 4. Status atual:
- ✅ Frontend funcionando
- ❌ Backend precisa das tabelas no banco
- ❌ Criar conta não funciona sem backend

### 5. Para usar sem banco:
O site funciona normalmente, mas sem:
- Criar conta
- Login
- Produtos do banco
- Orçamentos salvos

### 6. Solução temporária:
Use o sistema local (localStorage) removendo as chamadas de API.