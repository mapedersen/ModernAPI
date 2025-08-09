# Authentication & Authorization Guide

## Overview

ModernAPI implements JWT (JSON Web Token) based authentication with refresh tokens for secure, stateless authentication. The system follows OAuth 2.0 best practices and provides comprehensive user authentication and authorization features.

## Architecture

### Clean Architecture Implementation

The authentication system is implemented following Clean Architecture principles:

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                               │
│  • AuthController: HTTP endpoints                               │
│  • JWT middleware configuration                                 │
│  • Authentication/Authorization attributes                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    Application Layer                            │
│  • IAuthService: Authentication business logic                  │
│  • IJwtTokenService: Token generation/validation                │
│  • IPasswordService: Password validation abstraction            │
│  • AuthDtos: Data transfer objects                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      Domain Layer                               │
│  • User: User entity with business rules                        │
│  • RefreshToken: Refresh token entity                           │
│  • IRefreshTokenRepository: Repository interface                │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   Infrastructure Layer                          │
│  • PasswordService: ASP.NET Identity integration                │
│  • RefreshTokenRepository: EF Core implementation               │
│  • ApplicationDbContext: Database context                       │
└──────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. User Registration

```mermaid
sequenceDiagram
    Client->>API: POST /api/auth/register
    API->>AuthService: RegisterAsync(RegisterRequest)
    AuthService->>UserManager: CreateAsync(user, password)
    AuthService->>JwtTokenService: GenerateAccessTokenAsync(user)
    AuthService->>Database: Save RefreshToken
    AuthService-->>API: AuthResponse
    API-->>Client: 201 Created + Tokens
```

### 2. User Login

```mermaid
sequenceDiagram
    Client->>API: POST /api/auth/login
    API->>AuthService: LoginAsync(LoginRequest)
    AuthService->>UserManager: FindByEmailAsync(email)
    AuthService->>PasswordService: ValidatePasswordAsync(userId, password)
    AuthService->>JwtTokenService: GenerateAccessTokenAsync(user)
    AuthService->>Database: Save RefreshToken
    AuthService-->>API: AuthResponse
    API-->>Client: 200 OK + Tokens
```

### 3. Token Refresh

```mermaid
sequenceDiagram
    Client->>API: POST /api/auth/refresh
    API->>AuthService: RefreshTokenAsync(RefreshTokenRequest)
    AuthService->>Database: GetByTokenAsync(refreshToken)
    AuthService->>RefreshToken: IsValid()
    AuthService->>JwtTokenService: GenerateAccessTokenAsync(user)
    AuthService->>Database: Revoke old, Save new RefreshToken
    AuthService-->>API: AuthResponse
    API-->>Client: 200 OK + New Tokens
```

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|------------------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/refresh` | POST | Refresh access token | No |
| `/api/auth/logout` | POST | Logout (revoke refresh token) | No |
| `/api/auth/logout-all` | POST | Logout from all devices | Yes |
| `/api/auth/change-password` | POST | Change user password | Yes |
| `/api/auth/me` | GET | Get current user info | Yes |
| `/api/auth/validate-token` | POST | Validate refresh token | No |

### Request/Response Examples

#### Register New User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accessTokenExpiresAt": "2025-08-08T02:45:00.000Z",
  "refreshTokenExpiresAt": "2025-08-15T02:30:00.000Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2025-08-08T02:30:00.000Z",
    "updatedAt": "2025-08-08T02:30:00.000Z"
  }
}
```

#### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response:** Same as registration response

#### Refresh Token

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response:** Same as login response with new tokens

#### Logout

**Request:**
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### Get Current User

**Request:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "isEmailVerified": true,
  "roles": ["User"]
}
```

## Token Structure

### Access Token (JWT)

The access token is a JWT containing the following claims:

```json
{
  "sub": "123e4567-e89b-12d3-a456-426614174000",  // User ID
  "email": "user@example.com",
  "unique_name": "John Doe",
  "role": ["User", "Admin"],
  "nbf": 1723080600,
  "exp": 1723081500,  // Expires in 15 minutes (default)
  "iat": 1723080600,
  "iss": "ModernAPI",
  "aud": "ModernAPI.Users"
}
```

### Refresh Token

Refresh tokens are:
- Cryptographically secure random strings (256-bit)
- Stored in the database with metadata
- Single-use (revoked after use)
- Have longer expiry (7 days default, 30 days with "Remember Me")

## Configuration

### JWT Settings (appsettings.json)

```json
{
  "JwtSettings": {
    "Secret": "ThisIsAVeryLongSecretKeyForJWTTokenGenerationAndValidation2024!",
    "Issuer": "ModernAPI",
    "Audience": "ModernAPI.Users",
    "AccessTokenExpiryInMinutes": 15,
    "RefreshTokenExpiryInDays": 7,
    "RememberMeExpiryInDays": 30
  }
}
```

### Environment Variables

For production, use environment variables:

```bash
JwtSettings__Secret=YourProductionSecretKeyAtLeast32CharactersLong
JwtSettings__Issuer=https://api.yourcompany.com
JwtSettings__Audience=YourAppUsers
```

## Security Features

### Password Requirements

Configured in `Program.cs`:
- Minimum length: 8 characters
- Requires digit
- Requires uppercase letter
- Requires lowercase letter
- Requires non-alphanumeric character

### Account Lockout

- Failed attempts before lockout: 5
- Lockout duration: 15 minutes
- Lockout enabled for new users

### Token Security

1. **Access Token Security:**
   - Short-lived (15 minutes default)
   - Signed with HMAC SHA256
   - Contains minimal user information
   - Stateless validation

2. **Refresh Token Security:**
   - Long-lived but single-use
   - Stored securely in database
   - Revoked on password change
   - Can be revoked manually

3. **HTTPS Enforcement:**
   - Required in production
   - Secure cookie transmission
   - Protection against man-in-the-middle attacks

## Client Implementation

### JavaScript/TypeScript

```typescript
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiryTimeout: NodeJS.Timeout | null = null;

  async login(email: string, password: string): Promise<boolean> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken, data.accessTokenExpiresAt);
      return true;
    }
    return false;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken, data.accessTokenExpiresAt);
      return true;
    }
    
    this.logout();
    return false;
  }

  private setTokens(accessToken: string, refreshToken: string, expiresAt: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Store in localStorage or secure storage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Setup auto-refresh before expiry
    this.scheduleTokenRefresh(expiresAt);
  }

  private scheduleTokenRefresh(expiresAt: string) {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }

    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const refreshTime = expiryTime - currentTime - 60000; // Refresh 1 minute before expiry

    if (refreshTime > 0) {
      this.tokenExpiryTimeout = setTimeout(() => {
        this.refreshAccessToken();
      }, refreshTime);
    }
  }

  getAuthHeaders(): HeadersInit {
    return this.accessToken 
      ? { 'Authorization': `Bearer ${this.accessToken}` }
      : {};
  }

  logout() {
    if (this.refreshToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
    }
    
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }
  }
}
```

### React Hook

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored tokens on mount
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedAccessToken && storedRefreshToken) {
      // Validate and refresh if needed
      validateAndRefreshToken(storedAccessToken, storedRefreshToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  const logout = async () => {
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }
    
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!accessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Testing Authentication

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Use authenticated endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the API collection from `/docs/postman/ModernAPI.postman_collection.json`
2. Set environment variables for tokens
3. Use the pre-request scripts for automatic token refresh

## Troubleshooting

### Common Issues

#### 1. "Invalid token" error
- **Cause:** Token expired or malformed
- **Solution:** Refresh the token or re-authenticate

#### 2. "Account is locked out"
- **Cause:** Too many failed login attempts
- **Solution:** Wait 15 minutes or contact admin to unlock

#### 3. "Refresh token is invalid"
- **Cause:** Refresh token expired, revoked, or already used
- **Solution:** Re-authenticate with credentials

#### 4. 401 Unauthorized on protected endpoints
- **Cause:** Missing or invalid Authorization header
- **Solution:** Include `Authorization: Bearer {token}` header

### Debug Logging

Enable detailed logging in `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore.Authentication": "Debug",
      "ModernAPI.Application.Services.AuthService": "Debug"
    }
  }
}
```

## Migration Guide

### From Cookie Authentication

```csharp
// Old: Cookie-based
services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options => { /* ... */ });

// New: JWT-based
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* ... */ });
```

### From Session-based Authentication

1. Remove session middleware
2. Implement token storage on client
3. Update API calls to include Authorization header
4. Implement token refresh logic

## Best Practices

### For API Developers

1. **Token Expiry:** Keep access tokens short-lived (15-30 minutes)
2. **Refresh Tokens:** Implement single-use refresh tokens
3. **Password Changes:** Revoke all refresh tokens on password change
4. **Secure Storage:** Never store tokens in code or configuration
5. **HTTPS Only:** Always use HTTPS in production
6. **Rate Limiting:** Implement rate limiting on auth endpoints
7. **Audit Logging:** Log all authentication events

### For Client Developers

1. **Secure Storage:** Use secure storage mechanisms (Keychain, Keystore)
2. **Token Refresh:** Implement automatic token refresh
3. **Error Handling:** Handle token expiry gracefully
4. **Logout:** Always call logout endpoint to revoke tokens
5. **XSS Protection:** Never store tokens in localStorage for sensitive apps
6. **CORS:** Configure CORS properly for browser-based apps

## Security Considerations

### Token Storage

**DO:**
- Store tokens in memory for SPAs
- Use secure storage (Keychain/Keystore) for mobile apps
- Implement token rotation

**DON'T:**
- Store tokens in localStorage for sensitive applications
- Include tokens in URLs
- Log tokens in production

### Network Security

- Always use HTTPS
- Implement certificate pinning for mobile apps
- Use secure WebSocket connections for real-time features

### Additional Security Layers

Consider implementing:
- Multi-factor authentication (MFA)
- Device fingerprinting
- Anomaly detection
- IP allowlisting for admin endpoints
- Rate limiting and throttling

## Extending Authentication

### Adding OAuth Providers

```csharp
// In Program.cs
services.AddAuthentication()
    .AddJwtBearer(/* ... */)
    .AddGoogle(options =>
    {
        options.ClientId = configuration["Authentication:Google:ClientId"];
        options.ClientSecret = configuration["Authentication:Google:ClientSecret"];
    })
    .AddMicrosoftAccount(options =>
    {
        options.ClientId = configuration["Authentication:Microsoft:ClientId"];
        options.ClientSecret = configuration["Authentication:Microsoft:ClientSecret"];
    });
```

### Adding Custom Claims

```csharp
// In JwtTokenService.cs
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
    new Claim(ClaimTypes.Name, user.DisplayName),
    // Add custom claims
    new Claim("department", user.Department),
    new Claim("permission", "read:reports"),
    new Claim("subscription", "premium")
};
```

### Implementing Role-Based Access Control (RBAC)

```csharp
// In controller
[Authorize(Roles = "Admin")]
[HttpGet("admin/users")]
public async Task<IActionResult> GetAllUsers()
{
    // Admin only endpoint
}

// In Startup/Program.cs
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("PremiumUser", policy => policy.RequireClaim("subscription", "premium"));
});
```

## Related Documentation

- [Error Handling Guide](ERROR_HANDLING.md) - Error responses for auth failures
- [API Documentation](../ModernAPI.API/README.md) - General API guidelines
- [Domain Model](../ModernAPI.Domain/README.md) - User entity details