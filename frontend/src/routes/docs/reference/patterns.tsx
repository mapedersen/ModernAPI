import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Code, Layers, Database, Server, Shield } from 'lucide-react'

export const Route = createFileRoute('/docs/reference/patterns')({
  component: PatternLibraryComponent,
})

function PatternLibraryComponent() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pattern Library</h1>
            <p className="text-muted-foreground">Design patterns used throughout the template with examples</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Reference</Badge>
          <Badge variant="outline">Intermediate</Badge>
          <span className="text-sm text-muted-foreground">• 20 min read</span>
        </div>
      </div>

      <Tabs defaultValue="architectural" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architectural">Architectural</TabsTrigger>
          <TabsTrigger value="creational">Creational</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="architectural" className="space-y-6">
          {/* Repository Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Repository Pattern
              </CardTitle>
              <CardDescription>
                Encapsulates data access logic and provides a consistent interface for data operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Interface Definition</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`public interface IUserRepository : IRepository<User, Guid>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> IsEmailUniqueAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default);
}`}</code></pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Implementation</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`public class UserRepository : Repository<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }
    
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await Context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }
    
    public async Task<bool> IsEmailUniqueAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
    {
        return !await Context.Users
            .AnyAsync(u => u.Email == email && u.Id != excludeUserId, cancellationToken);
    }
}`}</code></pre>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Benefits</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Centralizes data access logic</li>
                    <li>• Makes testing easier with mocking</li>
                    <li>• Provides consistent query interfaces</li>
                    <li>• Supports dependency injection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit of Work Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Unit of Work Pattern
              </CardTitle>
              <CardDescription>
                Maintains a list of objects affected by a business transaction and coordinates changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Interface & Implementation</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    
    public IUserRepository Users { get; }
    public IRefreshTokenRepository RefreshTokens { get; }
    
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await DispatchDomainEventsAsync();
        return await _context.SaveChangesAsync(cancellationToken);
    }
}`}</code></pre>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Usage Example</h4>
                <div className="bg-green-100 dark:bg-green-900/40 rounded p-3">
                  <pre className="text-sm text-green-700 dark:text-green-300"><code>{`public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
{
    var user = new User(request.Email, request.DisplayName);
    
    await _unitOfWork.Users.AddAsync(user);
    await _unitOfWork.SaveChangesAsync(); // Saves all changes atomically
    
    return _mapper.MapToUserResponse(user);
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creational" className="space-y-6">
          {/* Factory Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Factory Pattern
              </CardTitle>
              <CardDescription>
                Creates objects without exposing creation logic to the client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">JWT Token Factory</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`public interface IJwtTokenFactory
{
    string GenerateAccessToken(User user, IEnumerable<string> roles);
    RefreshToken GenerateRefreshToken(Guid userId);
    ClaimsPrincipal? ValidateToken(string token);
}

public class JwtTokenFactory : IJwtTokenFactory
{
    private readonly JwtSettings _jwtSettings;
    
    public string GenerateAccessToken(User user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.DisplayName)
        };
        
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}`}</code></pre>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Benefits</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Centralizes object creation logic</li>
                  <li>• Easy to test and mock</li>
                  <li>• Consistent token generation</li>
                  <li>• Configuration management</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Builder Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Builder Pattern</CardTitle>
              <CardDescription>
                Constructs complex objects step by step
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Query Builder Example</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`public class UserQueryBuilder
{
    private IQueryable<User> _query;
    
    public UserQueryBuilder(IQueryable<User> query)
    {
        _query = query;
    }
    
    public UserQueryBuilder WhereActive()
    {
        _query = _query.Where(u => u.IsActive);
        return this;
    }
    
    public UserQueryBuilder WhereEmailContains(string email)
    {
        if (!string.IsNullOrEmpty(email))
            _query = _query.Where(u => u.Email.Contains(email));
        return this;
    }
    
    public UserQueryBuilder OrderByDisplayName()
    {
        _query = _query.OrderBy(u => u.DisplayName);
        return this;
    }
    
    public IQueryable<User> Build() => _query;
}

// Usage
var users = await new UserQueryBuilder(context.Users)
    .WhereActive()
    .WhereEmailContains("@company.com")
    .OrderByDisplayName()
    .Build()
    .ToListAsync();`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-6">
          {/* Strategy Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Strategy Pattern
              </CardTitle>
              <CardDescription>
                Defines a family of algorithms and makes them interchangeable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Password Validation Strategy</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`public interface IPasswordValidationStrategy
{
    ValidationResult Validate(string password);
}

public class StrongPasswordStrategy : IPasswordValidationStrategy
{
    public ValidationResult Validate(string password)
    {
        var errors = new List<string>();
        
        if (password.Length < 12)
            errors.Add("Password must be at least 12 characters long");
            
        if (!password.Any(char.IsUpper))
            errors.Add("Password must contain at least one uppercase letter");
            
        return errors.Any() 
            ? ValidationResult.Failure(errors) 
            : ValidationResult.Success();
    }
}

public class BasicPasswordStrategy : IPasswordValidationStrategy
{
    public ValidationResult Validate(string password)
    {
        return password.Length >= 6 
            ? ValidationResult.Success() 
            : ValidationResult.Failure("Password must be at least 6 characters");
    }
}

// Usage in service
public class PasswordService
{
    private readonly IPasswordValidationStrategy _strategy;
    
    public ValidationResult ValidatePassword(string password)
    {
        return _strategy.Validate(password);
    }
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observer Pattern (Domain Events) */}
          <Card>
            <CardHeader>
              <CardTitle>Observer Pattern (Domain Events)</CardTitle>
              <CardDescription>
                Notifies multiple objects about events that happen to the object they're observing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Domain Event Implementation</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`// Event
public record UserCreatedEvent(Guid UserId, string Email, string DisplayName) : DomainEvent;

// Event Handler
public class UserCreatedEventHandler : INotificationHandler<UserCreatedEvent>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<UserCreatedEventHandler> _logger;
    
    public async Task Handle(UserCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("User created: {UserId}", notification.UserId);
        
        await _emailService.SendWelcomeEmailAsync(
            notification.Email, 
            notification.DisplayName, 
            cancellationToken);
    }
}

// Entity raising event
public class User : Entity<Guid>
{
    public User(string email, string displayName)
    {
        Id = Guid.NewGuid();
        Email = email;
        DisplayName = displayName;
        CreatedAt = DateTime.UtcNow;
        
        RaiseDomainEvent(new UserCreatedEvent(Id, Email, DisplayName));
    }
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          {/* Gateway Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Gateway Pattern
              </CardTitle>
              <CardDescription>
                Encapsulates access to external services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Email Service Gateway</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`public interface IEmailGateway
{
    Task<bool> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
    Task<bool> SendBulkEmailAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default);
}

public class SendGridEmailGateway : IEmailGateway
{
    private readonly ISendGridClient _client;
    private readonly ILogger<SendGridEmailGateway> _logger;
    
    public async Task<bool> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        try
        {
            var sendGridMessage = new SendGridMessage
            {
                From = new EmailAddress("noreply@modernapi.dev", "ModernAPI"),
                Subject = message.Subject,
                HtmlContent = message.Body
            };
            
            sendGridMessage.AddTo(message.To, message.ToName);
            
            var response = await _client.SendEmailAsync(sendGridMessage, cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {Email}", message.To);
                return true;
            }
            
            _logger.LogWarning("Email sending failed with status {StatusCode}", response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", message.To);
            return false;
        }
    }
}`}</code></pre>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Best Practices</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Handle external service failures gracefully</li>
                  <li>• Implement retry logic for transient failures</li>
                  <li>• Log external service interactions</li>
                  <li>• Use circuit breaker for resilience</li>
                  <li>• Abstract external dependencies behind interfaces</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}