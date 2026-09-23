# ECO SUN Backend

Spring Boot backend for the ECO SUN solar energy system.

## Database Configuration

The application connects to SQL Server database:
- Server: Eco_Sun.mssql.somee.com
- Database: Eco_Sun
- Username: ecosun_SQLLogin_2
- Password: v4qnn3ktfu

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/forgot-password` - Password recovery
- POST `/api/auth/reset-password` - Define a new password using the emailed token

### Email de recuperação

Configure as credenciais da conta SMTP antes de usar a recuperação de senha. Para uma conta Outlook/Microsoft 365:

```bash
export MAIL_HOST=smtp.office365.com
export MAIL_PORT=587
export MAIL_USERNAME=seu-email@outlook.com
export MAIL_PASSWORD=sua-senha-do-outlook
```

Para Gmail, use `MAIL_HOST=smtp.gmail.com` e uma senha de aplicativo. Se a conta
Outlook tiver autenticação em duas etapas, use uma senha de aplicativo quando a
Microsoft exigir. Sem essas variáveis, o backend não conseguirá enviar o email.

 Se o provedor de hospedagem bloquear conexões SMTP de saída (erro `connect timed out`), use um provedor de API HTTP como o Resend:

 ```bash
 export EMAIL_PROVIDER=resend
 export RESEND_API_KEY=re_xxxxxxxxx
 export RESEND_FROM="ECO SUN <noreply@seu-dominio.com>"
 ```

 O remetente ou domínio precisa estar verificado no Resend. Com `EMAIL_PROVIDER=smtp` (padrão), as variáveis SMTP acima continuam sendo usadas.

Configure também `FRONTEND_URL` com a URL pública do frontend para que o botão do e-mail aponte para a página correta, por exemplo:

```bash
export FRONTEND_URL=https://seu-frontend.exemplo.com
```

Como alternativa sem domínio próprio, use o Brevo. Cadastre e confirme o e-mail do remetente no Brevo e configure:

```bash
export EMAIL_PROVIDER=brevo
export BREVO_API_KEY=xkeysib-xxxxxxxx
export BREVO_FROM=tcc.ecosun@hotmail.com
```

### Products
- GET `/api/produtos` - Get all active products
- GET `/api/produtos/categoria/{id}` - Get products by category
- GET `/api/produtos/{id}` - Get product by ID
- POST `/api/produtos` - Create new product (admin)
- PUT `/api/produtos/{id}` - Update product (admin)
- DELETE `/api/produtos/{id}` - Delete product (admin)

## Running the Application

1. Ensure Java 17+ is installed
2. Run: `./start.sh` or `mvn spring-boot:run`
3. Server will start on http://localhost:8080

## Frontend Integration

The frontend should make requests to `http://localhost:8080/api`