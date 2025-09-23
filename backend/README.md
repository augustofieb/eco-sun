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