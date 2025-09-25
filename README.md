# ECO SUN - Sistema de Orçamento de Energia Solar

Site para solicitação de orçamentos personalizados de sistemas de energia solar residencial.

## Funcionalidades

- **Calculadora de Orçamento**: Sistema inteligente que calcula a potência necessária, número de painéis e investimento total
- **Catálogo de Produtos**: Visualização de equipamentos de energia solar (painéis, inversores, baterias, controladores)
- **Sistema de Avaliações**: Usuários podem avaliar e comentar sobre os produtos
- **Integração WhatsApp**: Envio direto do orçamento via WhatsApp
- **Modo Escuro**: Interface adaptável com tema claro e escuro
- **Sistema de Usuários**: Cadastro, login e gerenciamento de perfil
- **Painel Administrativo**: Gestão de usuários e produtos

## Tecnologias Utilizadas

- **React 19** - Framework frontend
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router** - Roteamento
- **CSS3** - Estilização com suporte a modo escuro
- **LocalStorage** - Persistência de dados local

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
# Backend
cd backend && mvn spring-boot:run &
# Frontend  
cd .. && npm run dev
```

## Estrutura do Projeto

- `/src/Home.jsx` - Página principal com catálogo e hero section
- `/src/SolarQuote.jsx` - Componente de orçamento de energia solar
- `/src/ProductDetails.jsx` - Detalhes dos produtos com sistema de avaliações
- `/src/utils/` - Utilitários para autenticação, produtos, categorias e temas
- `/src/assets/` - Imagens e recursos estáticos

## Funcionalidades do Orçamento

O sistema calcula automaticamente:
- Potência do sistema necessária (kWp)
- Número de painéis solares
- Investimento total estimado
- Economia mensal na conta de luz
- Tempo de retorno do investimento
- Redução de CO₂ anual