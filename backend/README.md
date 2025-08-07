# ModernAPI Backend

A modern .NET 9 Web API implementing Clean Architecture with PostgreSQL database.

## Quick Start

### Prerequisites
- .NET 9 SDK
- Docker & Docker Compose

### Database Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Start PostgreSQL database:
```bash
docker-compose up -d
```

3. Verify database is running:
```bash
docker-compose ps
```

### Development

1. Restore NuGet packages:
```bash
dotnet restore
```

2. Build the solution:
```bash
dotnet build
```

3. Run the API:
```bash
dotnet run --project ModernAPI.API
```

### Database Connection

- **Host**: localhost
- **Port**: 5432
- **Database**: modernapi
- **Username**: modernapi_user
- **Password**: dev_password_123 (default, change in .env)

Connect using JetBrains DataGrip or any PostgreSQL client.

### Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (removes all data)
docker-compose down -v && docker-compose up -d
```