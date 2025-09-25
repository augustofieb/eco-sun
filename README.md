# ECO SUN - Sistema de Orçamento de Energia Solar

Site para solicitação de orçamentos personalizados de sistemas de energia solar residencial.

## Funcionalidades

- **Calculadora de Orçamento**: Sistema inteligente que calcula a potência necessária, número de painéis e investimento total
- **Catálogo de Produtos**: Visualização de equipamentos de energia solar (painéis, inversores, baterias, controladores)
- **Sistema de Avaliações**: Usuários podem avaliar e comentar sobre os produtos (via API)
- **Integração WhatsApp**: Envio direto do orçamento via WhatsApp
- **Modo Escuro**: Interface adaptável com tema claro e escuro
- **Sistema de Usuários**: Cadastro, login e gerenciamento via API REST
- **Painel Administrativo**: Gestão completa de usuários e produtos via API
- **Autenticação JWT**: Sistema seguro de autenticação com tokens

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
3. **Login de teste**: `admin@ecosun.com` / `password`

**Ou execute manualmente:**
```bash
# Backend
cd backend && mvn spring-boot:run &
# Frontend  
cd .. && npm run dev
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
- `/src/utils/` - Utilitários para autenticação, produtos, usuários e avaliações via API
- `/src/services/api.js` - Configuração e endpoints da API
- `/src/assets/` - Imagens e recursos estáticos

### Backend
- `/backend/src/main/java/com/ecosun/controller/` - Controllers REST
- `/backend/src/main/java/com/ecosun/entity/` - Entidades JPA
- `/backend/src/main/java/com/ecosun/service/` - Lógica de negócio
- `/backend/src/main/java/com/ecosun/repository/` - Repositórios de dados

## Funcionalidades do Orçamento

O sistema calcula automaticamente:
- Potência do sistema necessária (kWp)
- Número de painéis solares
- Investimento total estimado
- Economia mensal na conta de luz
- Tempo de retorno do investimento
- Redução de CO₂ anual