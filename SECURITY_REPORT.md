# Relatório de Segurança

## Escopo e ambiente

Foi feita revisão do backend Spring, autenticação JWT, controladores da API, fluxos React e dependências npm. Os testes de integração usam H2 em memória; não houve acesso ao banco SQL Server de produção nem teste de infraestrutura implantada.

## Critérios e resultados

| Critério | Procedimento | Esperado | Obtido | Resultado e evidência |
|---|---|---|---|---|
| Autenticação | Consultar endpoint administrativo sem token e tentar escrita sem token | `401 Unauthorized` | O endpoint de orçamentos e a escrita em categorias retornaram `401` | **Aprovado**. `AuthBudgetIntegrationTest.exigeAutenticacaoEImpedeUsuarioComumDeAcessarDadosAdministrativos` |
| Controle de acesso | Tentar escrita/administração como cliente; alterar role e status durante uma sessão; tentar transferir orçamento no corpo do `PUT` | `403` sem role; permissões e titularidade sempre refletirem o banco | Cliente recebeu `403`; mudança para ADMIN foi aplicada na requisição seguinte; conta inativa recebeu `401`; titularidade do orçamento permaneceu com o dono original | **Aprovado**. `AuthBudgetIntegrationTest` e `AuthorizationGuardTest` |
| Proteção de dados | Consultar estatísticas e dados de outros usuários como cliente; verificar dados de senha em respostas e persistência; verificar renderização de HTML malicioso | Dados pessoais e administrativos restritos; hash nunca exposto; HTML perigoso inerte | Estatísticas/usuários foram negados a cliente; consultas de orçamento alheio receberam `403`; a API de usuários seleciona campos sem senha; scripts, handlers e `javascript:` são removidos nos pontos de renderização | **Aprovado no escopo testado**. Integração, `sanitizeHtml.test.js` e inspeção das consultas. A rota de estatísticas continua retornando dados administrativos necessários ao painel, agora restritos a ADMIN. |
| Validação de entradas | Enviar nome vazio a produto, categoria e orçamento; enviar bytes que fingem ser PNG; exercitar assinaturas permitidas, MIME divergente e arquivo acima de 5 MB | Rejeição antes de persistir, sem detalhes internos | APIs responderam `400`; validador rejeitou conteúdo falso, MIME divergente e excesso de tamanho; PNG/JPEG/WebP reconhecidos pelas assinaturas | **Aprovado**. `AuthBudgetIntegrationTest` e `ImageUploadValidatorTest` |
| Proteção da API | Chamar endpoints de estatísticas, usuários e mutações de categorias sem autenticação e como CLIENTE | `401` sem identidade e `403` sem role necessária | Status observados conforme esperado; operações administrativas usam `@PreAuthorize` no servidor | **Aprovado**. `AuthBudgetIntegrationTest` |
| Senhas | Registrar usuário, consultar o valor persistido e autenticar com a senha original | Hash com algoritmo adequado; senha em claro nunca persistida | O valor persistido corresponde ao formato BCrypt e difere da senha enviada; autenticação subsequente funcionou | **Aprovado**. `AuthBudgetIntegrationTest.persisteSenhaComoHashBcrypt` |
| Sessões/autorização | Usar token após logout, alterar role e inativar conta sem emitir novo token | Token revogado/inativo negado; role refletida sem token antigo autorizar privilégio removido | Reuso após logout e conta inativa retornaram `401`; alteração de role foi refletida imediatamente | **Aprovado**. `AuthBudgetIntegrationTest.logoutRevogaTokenNoServidor` e `tokenRefleteAlteracaoDePermissaoEContaInativa` |

## Problemas encontrados e correções

- Havia credencial administrativa padrão e fallback previsível para assinatura JWT. O bootstrap agora depende de configuração explícita, a senha inicial precisa ter pelo menos 16 caracteres e `JWT_SECRET` é obrigatório, com mínimo de 32 bytes.
- A escrita de categorias não tinha restrição suficiente e estatísticas expunham dados a usuários comuns. As mutações agora exigem ADMIN e estatísticas são restritas a ADMIN.
- O filtro JWT não refletia adequadamente revogação/estado da conta em todas as requisições. Foram adicionadas verificações de conta ativa, atualização de role pelo banco e revogação persistida por hash do token no logout.
- A autorização de edição de orçamento verificava o dono persistido, mas o controlador podia substituir `usuarioId` pelo valor do corpo. O controlador agora preserva o vínculo existente.
- Upload aceitava o MIME declarado pelo cliente e erros retornavam detalhes internos. Foram adicionadas validação de tamanho e assinatura PNG/JPEG/WebP, validação de campos e mensagens genéricas.
- Categorias, produtos e orçamentos tinham validações inconsistentes. Foram incluídos limites e verificações de campos nos endpoints de escrita; consultas JDBC de produtos agora retornam nomes de chave estáveis entre H2 e SQL Server.
- Conteúdo editável e descrição de produto eram inseridos em HTML sem sanitização. DOMPurify agora sanitiza os conteúdos antes de renderizar, ao inicializar o editor e ao aceitar HTML colado.
- A auditoria npm encontrou vulnerabilidades em dependências de runtime. Axios, React Router e Vite foram atualizados sem `--force`; o audit de produção ficou sem vulnerabilidades conhecidas.

## Evidências de execução

- Backend: `mvn -q test` — 14 testes, 0 falhas, 0 erros (2 AuthController, 2 upload, 7 integração, 3 AuthorizationGuard).
- Frontend: `npm test` — 7 testes aprovados.
- Navegador: `npm run test:e2e` — 3 cenários aprovados, incluindo login, criação de orçamento e leitura persistida.
- Build: `npm run build` — concluído com Vite 6.4.3.
- Dependências de produção: `npm audit --omit=dev` — 0 vulnerabilidades.
- Dependências completas: `npm audit` — 2 vulnerabilidades moderadas somente na ferramenta de desenvolvimento Vitest/@vitest/mocker. A versão corrigida disponível requer Node 20; não foi feito downgrade major automático.
- Lint: `npm run lint` ainda falha com 17 erros e 2 avisos preexistentes em telas/utilitários; os apontamentos do helper de autenticação e do teste E2E alterados nesta tarefa foram corrigidos.
- Integridade: `git diff --check` — sem erros.

## Limitações e riscos residuais

- Os testes de API usam H2 e não demonstram comportamento do SQL Server implantado, HTTPS, configuração real de CORS, backups ou controles de acesso à infraestrutura.
- O audit Maven/SCA das dependências Java não foi executado. Também não foi feito teste de penetração externo.
- React Router 7.18.4 declara Node `>=20`; o ambiente usado nesta execução é Node 18.20.8. Testes/build passaram, mas o runtime de desenvolvimento/implantação deve ser alinhado a Node 20 ou superior.
- Restam 2 advisories moderadas em dependências de desenvolvimento do Vitest; a atualização segura identificada requer Node 20 e mudança major.
- A sanitização impede execução de HTML perigoso no frontend atual; o conteúdo original ainda pode permanecer armazenado e consumidores externos da API devem aplicar sanitização própria.
- Não foi implementado rate limiting distribuído para tentativas de login; o controle de recuperação de senha existente é local ao processo.