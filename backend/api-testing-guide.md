# ModernAPI Testing Guide

## HTTPie Installation

```bash
# macOS with Homebrew
brew install httpie

# Alternative: Python pip
pip install httpie

# Verify installation
http --version
```

## API Endpoints

**Base URL:** `http://localhost:5051`

### Health Check
```bash
http GET localhost:5051/health
```

### Authentication Endpoints
```bash
# Register new user (if Identity API was enabled)
http POST localhost:5051/register \
  email="user@example.com" \
  password="SecurePass123!"

# Login (if Identity API was enabled)  
http POST localhost:5051/login \
  email="admin@modernapi.dev" \
  password="Admin@123!"
```

### User Management Endpoints
```bash
# Get all users
http GET localhost:5051/api/users

# Get user by ID
http GET localhost:5051/api/users/{user-id}

# Create new user
http POST localhost:5051/api/users \
  email="newuser@example.com" \
  displayName="New User" \
  firstName="John" \
  lastName="Doe"

# Update user profile
http PUT localhost:5051/api/users/{user-id} \
  displayName="Updated Name" \
  firstName="Jane" \
  lastName="Smith"

# Delete user
http DELETE localhost:5051/api/users/{user-id}
```

### API Documentation
- **Scalar UI:** http://localhost:5051/scalar/v1
- **OpenAPI JSON:** http://localhost:5051/openapi/v1.json

## Database Info

- **Default Admin User:**
  - Email: `admin@modernapi.dev`
  - Password: `Admin@123!`
  - Role: Administrator

## Common HTTP Headers
```bash
# JSON Content-Type
http POST localhost:5051/api/users \
  Content-Type:application/json \
  email="test@example.com"

# Authentication (when JWT is implemented)
http GET localhost:5051/api/users \
  Authorization:"Bearer your-jwt-token-here"
```

## Testing Workflow

1. **Start the API:** `dotnet run` (from ModernAPI.API directory)
2. **Check health:** `http GET localhost:5051/health`
3. **View documentation:** Open http://localhost:5051/scalar/v1
4. **Test endpoints:** Use the commands above
5. **Check database:** Verify data in PostgreSQL

## Database Connection
- **Host:** localhost:5432
- **Database:** modernapi  
- **Username:** modernapi_user
- **Password:** dev_password_123