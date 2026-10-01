# RELATÓRIO DE TESTES DE SEGURANÇA DA APLICAÇÃO ECO SUN

## 1 INTRODUÇÃO

Este relatório apresenta a análise e os testes de segurança realizados na aplicação ECO SUN, composta por uma interface desenvolvida em React e uma API implementada com Spring Boot. A avaliação teve como objetivo verificar os controles de autenticação, autorização, proteção de dados, validação de entradas, segurança dos endpoints, armazenamento de senhas e gerenciamento de sessões.

A análise também contemplou falhas identificadas durante a inspeção do código-fonte. As correções foram implementadas e submetidas a testes automatizados. Os resultados descritos neste documento correspondem exclusivamente às verificações efetivamente executadas no ambiente de desenvolvimento.

## 2 PROCEDIMENTOS METODOLÓGICOS

Foram inspecionados os controladores, serviços de autenticação, filtros JWT, regras de autorização, consultas aos dados, pontos de renderização de conteúdo HTML e chamadas realizadas pela interface. A validação prática foi feita por testes unitários e de integração do backend, testes unitários do frontend, testes automatizados de ponta a ponta com Playwright, build de produção e auditoria das dependências npm.

Os testes de integração do backend utilizaram banco H2 em memória. Para comprovar as respostas de autorização, foram criadas contas de teste com perfis distintos e realizadas requisições sem token, com perfil de cliente e com perfil administrativo. Também foram enviados dados inválidos e arquivos com conteúdo incompatível com o tipo declarado.

Em cada critério, são apresentados o procedimento empregado, o resultado esperado, o resultado obtido, a avaliação e as evidências correspondentes.

## 3 CRITÉRIOS DE SEGURANÇA E RESULTADOS

### 3.1 Autenticação

**Procedimento:** foram realizadas requisições sem token a endpoints protegidos, incluindo consulta de orçamentos e tentativa de escrita em categorias. Também foi executado o fluxo de autenticação pela interface.

**Resultado esperado:** requisições sem identidade autenticada devem ser recusadas, e o login com credenciais válidas deve permitir o acesso aos fluxos correspondentes.

**Resultado obtido:** as requisições sem token receberam HTTP 401 (Unauthorized). O fluxo de login pela interface foi concluído no teste de ponta a ponta.

**Avaliação:** aprovado.

**Evidências:** teste `exigeAutenticacaoEImpedeUsuarioComumDeAcessarDadosAdministrativos`, em `backend/src/test/java/com/ecosun/integration/AuthBudgetIntegrationTest.java`; cenário de login e orçamento em `e2e/system-integration.spec.js`.

### 3.2 Controle de acesso

**Procedimento:** uma conta de cliente tentou acessar estatísticas, listar usuários e criar categorias. Em seguida, o nível de acesso da conta foi alterado no banco durante a mesma sessão. Também foi tentada a transferência da titularidade de um orçamento por meio do campo `usuarioId` enviado no corpo da atualização.

**Resultado esperado:** usuários comuns não devem executar operações administrativas; alterações de permissão devem ser refletidas sem depender de um token novo; a titularidade do orçamento não deve ser alterada por dados fornecidos pelo cliente.

**Resultado obtido:** as operações administrativas foram recusadas com HTTP 403 (Forbidden) para a conta de cliente. Após a alteração para administrador, a permissão foi refletida na requisição seguinte. A tentativa de transferir o orçamento não alterou o proprietário persistido.

**Avaliação:** aprovado.

**Evidências:** testes `exigeAutenticacaoEImpedeUsuarioComumDeAcessarDadosAdministrativos`, `tokenRefleteAlteracaoDePermissaoEContaInativa` e `impedeQueUsuarioConsulteOrcamentosDeOutraConta`, em `AuthBudgetIntegrationTest.java`; testes unitários em `backend/src/test/java/com/ecosun/security/AuthorizationGuardTest.java`.

### 3.3 Proteção de dados

**Procedimento:** foram testadas consultas de estatísticas e orçamentos por usuários sem perfil administrativo ou sem vínculo de titularidade. Também foram inspecionadas as consultas de usuários e os pontos da interface que renderizam conteúdo HTML.

**Resultado esperado:** informações administrativas e dados pertencentes a outros usuários devem ser inacessíveis a clientes; senhas não devem ser incluídas em respostas; conteúdo HTML potencialmente malicioso não deve executar código no navegador.

**Resultado obtido:** clientes receberam HTTP 403 ao consultar estatísticas e orçamentos de outras contas. A consulta administrativa de usuários seleciona campos sem incluir a senha. Os conteúdos editáveis e descrições de produtos são sanitizados antes da renderização no frontend.

**Avaliação:** aprovado no escopo testado. A rota de estatísticas mantém dados necessários ao painel administrativo, mas seu acesso exige perfil ADMIN.

**Evidências:** `AuthBudgetIntegrationTest.java`; teste `src/utils/sanitizeHtml.test.js`; verificações em `backend/src/main/java/com/ecosun/controller/StatsController.java`, `UsuarioController.java`, `src/Home.jsx` e `src/ProductDetails.jsx`.

### 3.4 Validação de entradas

**Procedimento:** foram enviados nomes vazios para criação de produtos, categorias e orçamentos; foi enviado um arquivo textual com MIME declarado como imagem PNG; e foram testadas assinaturas PNG, JPEG e WebP, divergência entre conteúdo e MIME, além do limite de tamanho de arquivo.

**Resultado esperado:** entradas fora dos limites e arquivos incompatíveis devem ser recusados antes da persistência, sem exposição de detalhes internos da aplicação.

**Resultado obtido:** as APIs recusaram os campos inválidos e o upload falso com HTTP 400 (Bad Request). Os testes unitários confirmaram a rejeição de MIME divergente e de arquivo acima de 5 MB, bem como o reconhecimento das assinaturas permitidas.

**Avaliação:** aprovado.

**Evidências:** `AuthBudgetIntegrationTest.java` e `backend/src/test/java/com/ecosun/controller/ImageUploadValidatorTest.java`; implementação em `backend/src/main/java/com/ecosun/controller/ImageUploadValidator.java`.

### 3.5 Proteção da API

**Procedimento:** foram enviadas requisições autenticadas como cliente e como administrador para endpoints de usuários, estatísticas, categorias e orçamentos. Também foram verificadas as regras de autorização declaradas nos controladores.

**Resultado esperado:** endpoints administrativos e operações de escrita devem exigir identidade válida e o perfil adequado; endpoints públicos de consulta não devem expor funções administrativas.

**Resultado obtido:** chamadas sem autenticação receberam HTTP 401 e chamadas de clientes sem a permissão necessária receberam HTTP 403. As operações administrativas são protegidas no servidor por regras de autorização, independentemente das verificações visuais da interface.

**Avaliação:** aprovado.

**Evidências:** `AuthBudgetIntegrationTest.java`; configuração em `backend/src/main/java/com/ecosun/config/SecurityConfig.java` e anotações de autorização nos controladores.

### 3.6 Proteção de senhas

**Procedimento:** foi registrada uma conta de teste, consultado o valor persistido no banco e realizada autenticação com a senha original.

**Resultado esperado:** a senha deve ser armazenada por meio de algoritmo de hash apropriado, sem persistência em texto puro, e a autenticação deve continuar funcionando.

**Resultado obtido:** o valor persistido corresponde ao formato de hash BCrypt e é diferente da senha enviada. A autenticação com a senha original foi concluída com sucesso.

**Avaliação:** aprovado.

**Evidências:** teste `persisteSenhaComoHashBcrypt`, em `AuthBudgetIntegrationTest.java`; configuração do `BCryptPasswordEncoder` em `backend/src/main/java/com/ecosun/config/SecurityConfig.java`.

### 3.7 Sessões e autorização

**Procedimento:** foi utilizado um token após logout; também foram alterados o nível de acesso e o estado da conta enquanto o token original ainda existia.

**Resultado esperado:** tokens revogados ou associados a contas inativas devem ser recusados; permissões atuais devem prevalecer sobre o estado anterior da sessão.

**Resultado obtido:** após logout, o reuso do token recebeu HTTP 401. A conta inativada também recebeu HTTP 401, e a alteração do nível de acesso foi refletida imediatamente pelo backend.

**Avaliação:** aprovado.

**Evidências:** testes `logoutRevogaTokenNoServidor` e `tokenRefleteAlteracaoDePermissaoEContaInativa`, em `AuthBudgetIntegrationTest.java`; implementação em `backend/src/main/java/com/ecosun/security/JwtAuthenticationFilter.java` e `TokenRevocationService.java`.

## 4 PROBLEMAS IDENTIFICADOS E CORREÇÕES

Durante a inspeção foram identificadas as seguintes falhas e aplicadas as respectivas correções:

1. Existiam credenciais administrativas padrão e um valor previsível de fallback para assinatura JWT. O bootstrap administrativo passou a depender de configuração explícita, e a aplicação exige segredo JWT com pelo menos 32 bytes.
2. A rota de estatísticas permitia acesso indevido e operações de escrita em categorias não tinham proteção suficiente. As estatísticas e mutações administrativas passaram a exigir perfil ADMIN.
3. O estado da conta e a permissão atual não eram refletidos de maneira suficiente em todas as requisições, e o logout não invalidava o token no servidor. O filtro passou a validar conta e permissões atuais, e o logout passou a revogar o token por meio de seu hash persistido.
4. A atualização de orçamento aceitava uma nova titularidade enviada no corpo da requisição. O controlador passou a preservar o vínculo de usuário já persistido.
5. Uploads confiavam no MIME informado pelo cliente e respostas de erro podiam revelar detalhes internos. Foram incluídas verificações de tamanho e assinatura da imagem e respostas genéricas para falhas de processamento.
6. Campos de produto, categoria e orçamento tinham validações inconsistentes. Foram adicionados limites e verificações antes das operações de escrita.
7. Conteúdo editável e descrição de produto eram inseridos no HTML sem sanitização. A interface passou a sanitizar o conteúdo com DOMPurify antes da renderização e da edição.
8. A auditoria npm identificou vulnerabilidades em dependências de produção. As dependências foram atualizadas sem uso da opção `--force`; o audit de produção passou a reportar zero vulnerabilidades conhecidas.
9. O acesso local podia falhar com `Invalid CORS request` quando o frontend era aberto por uma origem/porta encaminhada diferente da origem CORS configurada. O Vite passou a encaminhar `/api` por proxy same-origin ao backend, sem liberar origens adicionais no Spring. O destino do proxy usa host e porta do backend, sem duplicar o prefixo `/api`.

## 5 RESULTADOS GERAIS E LIMITAÇÕES

Na suíte backend foram executados 14 testes, sem falhas ou erros. A suíte unitária frontend executou 7 testes aprovados. Os testes Playwright executaram 3 cenários aprovados, incluindo autenticação pela interface, criação de orçamento e consulta do registro persistido. O build de produção foi concluído com Vite 6.4.3.

A auditoria das dependências de produção, executada por `npm audit --omit=dev`, não identificou vulnerabilidades conhecidas. A auditoria completa identificou duas vulnerabilidades moderadas em dependências de desenvolvimento do Vitest. A versão corrigida identificada requer Node 20 ou superior; não foi aplicado downgrade major automático. React Router 7.18.4 também declara requisito de Node 20 ou superior. Os testes e o build passaram no ambiente Node 18.20.8 utilizado, mas recomenda-se alinhar o ambiente de desenvolvimento e implantação à versão suportada.

A execução de `npm run lint` não foi aprovada: foram observados 17 erros e 2 avisos em arquivos da aplicação. Os apontamentos presentes no helper de autenticação e no teste E2E modificados durante esta atividade foram corrigidos; os demais apontamentos permanecem fora do escopo desta correção de segurança.

Os testes de integração utilizaram H2 em memória. Foi validado o proxy CORS do ambiente local por meio do Playwright, mas não a política CORS implantada em produção, HTTPS, backups, controles de infraestrutura ou o serviço real de envio de e-mails. Também não foram executados uma análise SCA das dependências Java nem um teste de penetração externo. A sanitização protege os pontos de renderização da interface atual; consumidores externos da API devem sanitizar HTML recebido. Não foi implementado rate limiting distribuído para tentativas de login.

## 6 CONSIDERAÇÕES FINAIS

Com base nos testes realizados, os sete critérios de segurança avaliados foram aprovados no ambiente controlado descrito neste relatório. As correções aumentaram a proteção contra acesso não autorizado, alterações indevidas de titularidade, entradas inválidas, reutilização de tokens após logout e execução de HTML malicioso na interface.

Os resultados não constituem certificação de segurança da aplicação em produção. Recomenda-se executar os testes contra o SQL Server utilizado na implantação, alinhar o runtime a Node 20 ou superior, tratar os advisories restantes das dependências de desenvolvimento e complementar a avaliação com análise das dependências Java e teste de segurança do ambiente publicado.

**Fonte:** resultados dos testes automatizados e inspeção do código-fonte do projeto ECO SUN, executados em 1 out. 2026.