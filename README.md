# ECO SUN - Sistema de Orçamento de Energia Solar

Site para solicitação de orçamentos personalizados de sistemas de energia solar residencial.

## Funcionalidades

- **Calculadora de Orçamento**: Sistema inteligente que calcula a potência necessária, número de painéis e investimento total
- **Catálogo de Produtos**: Visualização de equipamentos de energia solar (painéis, inversores, baterias, controladores)
- **Sistema de Avaliações**: Usuários podem avaliar e comentar sobre os produtos
- **Integração WhatsApp**: Envio direto do orçamento via WhatsApp
- **Modo Escuro**: Interface adaptável com tema claro e escuro (sincronizado via API)
- **Sistema de Usuários**: Cadastro, login e gerenciamento completo via API REST
- **Painel Administrativo**: Gestão completa de usuários e produtos
- **Autenticação JWT**: Sistema seguro de autenticação com tokens
- **Preferências do Usuário**: Configurações personalizadas armazenadas no banco

## Tecnologias Utilizadas

- **React 19** - Framework frontend
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router** - Roteamento
- **CSS3** - Estilização com suporte a modo escuro
- **Spring Boot** - Backend API REST
- **SQL Server** - Banco de dados
- **JWT** - Autenticação segura

## Como Executar

### Ambiente Local
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `npm run dev`
4. Acesse `http://localhost:5173`

### GitHub Codespaces
1. Execute o script de inicialização: `./start-project.sh`
2. Acesse a URL fornecida pelo script
3. **Login de teste**: `admin@ecosun.com` / `admin123`

**Ou execute manualmente:**
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar backend em background
cd backend && mvn spring-boot:run &

# 3. Voltar para raiz e iniciar frontend
cd .. && npm run dev
```

**Alternativa com terminais separados:**
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
npm run dev
```

### Testar Migração
Para verificar se a migração do localStorage para API foi bem-sucedida:
```bash
./test-migration.sh
```

## Estrutura do Projeto

### Frontend
- `/src/Home.jsx` - Página principal com catálogo e hero section
- `/src/SolarQuote.jsx` - Componente de orçamento de energia solar
- `/src/ProductDetails.jsx` - Detalhes dos produtos com sistema de avaliações
- `/src/utils/` - Utilitários para autenticação, produtos, usuários, avaliações e preferências via API
- `/src/services/api.js` - Configuração e endpoints da API REST
- `/src/components/` - Componentes reutilizáveis (Login, Register, etc.)
- `/src/assets/` - Imagens e recursos estáticos

### Backend
- `/backend/src/main/java/com/ecosun/controller/` - Controllers REST (Auth, Usuario, Produto, Avaliacao)
- `/backend/src/main/java/com/ecosun/entity/` - Entidades JPA (Usuario, Produto, Avaliacao, Preferencias)
- `/backend/src/main/java/com/ecosun/service/` - Lógica de negócio
- `/backend/src/main/java/com/ecosun/repository/` - Repositórios JPA para acesso aos dados
- `/backend/src/main/resources/data.sql` - Scripts de inicialização do banco

## Funcionalidades do Orçamento

O sistema calcula automaticamente:
- Potência do sistema necessária (kWp)
- Número de painéis solares
- Investimento total estimado
- Economia mensal na conta de luz
- Tempo de retorno do investimento
- Redução de CO₂ anual