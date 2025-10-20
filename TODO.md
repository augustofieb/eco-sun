# Correção: Especificações aparecendo como NULL ao criar produto

## Problema
Ao criar um novo produto, as especificações técnicas estão aparecendo como NULL no banco de dados devido a inconsistências no envio e processamento dos dados.

## Plano de Correção

### 1. Atualizar ProdutoRequest.java
- [x] Adicionar campo especificacoesTecnicas ao ProdutoRequest

### 2. Atualizar AdminProducts.jsx (Frontend)
- [x] Tornar consistente o envio de especificacoesTecnicas (sempre como JSON string)
- [x] Carregar especificacoes existentes no modo de edição
- [x] Garantir que especificacoesTecnicas seja sempre enviada, mesmo vazia

### 3. Atualizar SimpleProdutoController.java (Backend)
- [x] Garantir que especificacoesTecnicas seja string não-null (usar "{}" se null)

### 4. Testar
- [x] Correção implementada - especificacoes_tecnicas agora sempre será "{}" se vazio/null
- [x] Frontend envia sempre JSON string
- [x] Backend garante não-null
- [x] Modo de edição carrega especificações existentes
