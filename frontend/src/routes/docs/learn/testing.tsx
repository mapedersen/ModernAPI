import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { ScrollArea } from '~/components/ui/scroll-area'
import { 
  TestTube, 
  Play, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Code,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Zap,
  BookOpen,
  Activity,
  BarChart3,
  PieChart,
  Bug,
  Shield,
  Layers,
  Database,
  Server,
  Settings,
  FileText,
  GitBranch,
  Users,
  ArrowRight,
  Plus,
  Minus,
  Pause,
  SkipForward,
  Triangle
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/docs/learn/testing')({
  component: TestingPage,
})

interface TestCase {
  id: string
  name: string
  description: string
  category: 'unit' | 'integration' | 'e2e'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration?: number
  coverage: number
  assertions: number
  errorMessage?: string
  code: string
  layer: 'domain' | 'application' | 'infrastructure' | 'api'
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestCase[]
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  coverage: number
  duration: number
  status: 'idle' | 'running' | 'completed'
}

interface CoverageHotspot {
  id: string
  file: string
  line: number
  coverage: number
  complexity: number
  riskLevel: 'low' | 'medium' | 'high'
  description: string
}

interface MockingExample {
  id: string
  title: string
  description: string
  type: 'repository' | 'service' | 'external-api' | 'database'
  code: string
  benefits: string[]
}

interface TestingPyramidLayer {
  id: string
  name: string
  description: string
  testCount: number
  coverage: number
  executionTime: number
  cost: number
  confidence: number
  color: string
  icon: React.ReactNode
  examples: string[]
}

function TestingPage() {
  const [selectedTestSuite, setSelectedTestSuite] = React.useState<string>('domain-tests')
  const [selectedTestCase, setSelectedTestCase] = React.useState<string | null>(null)
  const [isRunningTests, setIsRunningTests] = React.useState(false)
  const [testProgress, setTestProgress] = React.useState(0)
  const [currentRunningTest, setCurrentRunningTest] = React.useState<string | null>(null)
  const [showCodeCoverage, setShowCodeCoverage] = React.useState(true)
  const [selectedPyramidLayer, setSelectedPyramidLayer] = React.useState<string>('unit')
  const [selectedMockExample, setSelectedMockExample] = React.useState<string>('repository')
  const [showCode, setShowCode] = React.useState<Record<string, boolean>>({})
  const [interactiveMode, setInteractiveMode] = React.useState(true)
  const [autoRun, setAutoRun] = React.useState(false)

  // Handle module completion and progression
  useModuleCompletion('testing')

  // Testing pyramid layers
  const pyramidLayers: TestingPyramidLayer[] = [
    {
      id: 'unit',
      name: 'Unit Tests',
      description: 'Fast, isolated tests for individual components and business logic',
      testCount: 127,
      coverage: 94,
      executionTime: 0.8,
      cost: 1,
      confidence: 70,
      color: '#10b981',
      icon: <TestTube className="w-4 h-4" />,
      examples: [
        'Domain entity business rules',
        'Value object validation',
        'Service method logic',
        'Extension method functionality'
      ]
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      description: 'Test component interactions and database operations',
      testCount: 43,
      coverage: 87,
      executionTime: 4.2,
      cost: 3,
      confidence: 85,
      color: '#f59e0b',
      icon: <Layers className="w-4 h-4" />,
      examples: [
        'Repository operations with real database',
        'Service layer integration',
        'Entity Framework migrations',
        'External API integration'
      ]
    },
    {
      id: 'e2e',
      name: 'End-to-End Tests',
      description: 'Full workflow testing through HTTP endpoints',
      testCount: 18,
      coverage: 76,
      executionTime: 12.5,
      cost: 8,
      confidence: 95,
      color: '#8b5cf6',
      icon: <Target className="w-4 h-4" />,
      examples: [
        'Complete user registration flow',
        'Authentication and authorization',
        'CRUD operations via API',
        'Complex business workflows'
      ]
    }
  ]

  // Sample test suites
  const testSuites: TestSuite[] = [
    {
      id: 'domain-tests',
      name: 'Domain Layer Tests',
      description: 'Unit tests for business logic and domain entities',
      totalTests: 48,
      passedTests: 45,
      failedTests: 2,
      skippedTests: 1,
      coverage: 94,
      duration: 1.2,
      status: 'completed',
      tests: [
        {
          id: 'user-creation',
          name: 'User Entity Creation',
          description: 'Test user entity validation and business rules',
          category: 'unit',
          status: 'passed',
          duration: 0.045,
          coverage: 98,
          assertions: 8,
          layer: 'domain',
          code: `[Fact]
public void Constructor_WithValidData_ShouldCreateUser()
{
    // Arrange
    var email = "test@example.com";
    var displayName = "Test User";
    var firstName = "Test";
    var lastName = "User";
    
    // Act
    var user = new User(email, displayName, firstName, lastName);
    
    // Assert
    user.Email.Should().Be(email);
    user.DisplayName.Should().Be(displayName);
    user.FirstName.Should().Be(firstName);
    user.LastName.Should().Be(lastName);
    user.IsActive.Should().BeTrue();
    user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    user.DomainEvents.Should().ContainSingle()
        .Which.Should().BeOfType<UserCreatedEvent>();
}`
        },
        {
          id: 'user-email-validation',
          name: 'User Email Validation',
          description: 'Test email format validation in user entity',
          category: 'unit',
          status: 'failed',
          duration: 0.032,
          coverage: 85,
          assertions: 5,
          layer: 'domain',
          errorMessage: 'Expected ArgumentException to be thrown for invalid email format',
          code: `[Theory]
[InlineData("invalid-email")]
[InlineData("")]
[InlineData(null)]
[InlineData("@example.com")]
public void Constructor_WithInvalidEmail_ShouldThrowArgumentException(string invalidEmail)
{
    // Act & Assert
    var exception = Assert.Throws<ArgumentException>(() => 
        new User(invalidEmail, "Test", "Test", "User"));
    exception.Message.Should().Contain("valid email address");
}`
        },
        {
          id: 'user-deactivation',
          name: 'User Deactivation',
          description: 'Test user deactivation business logic',
          category: 'unit',
          status: 'passed',
          duration: 0.028,
          coverage: 92,
          assertions: 4,
          layer: 'domain',
          code: `[Fact]
public void Deactivate_ActiveUser_ShouldDeactivateUser()
{
    // Arrange
    var user = CreateValidUser();
    
    // Act
    user.Deactivate("Account closed by user");
    
    // Assert
    user.IsActive.Should().BeFalse();
    user.DeactivatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    user.DomainEvents.Should().Contain(e => e is UserDeactivatedEvent);
}`
        }
      ]
    },
    {
      id: 'application-tests',
      name: 'Application Service Tests',
      description: 'Tests for application services and orchestration logic',
      totalTests: 32,
      passedTests: 30,
      failedTests: 1,
      skippedTests: 1,
      coverage: 87,
      duration: 2.8,
      status: 'completed',
      tests: [
        {
          id: 'user-service-create',
          name: 'User Service Create User',
          description: 'Test user creation through application service',
          category: 'integration',
          status: 'passed',
          duration: 0.156,
          coverage: 91,
          assertions: 12,
          layer: 'application',
          code: `[Fact]
public async Task CreateUserAsync_WithValidRequest_ShouldReturnUserResponse()
{
    // Arrange
    var request = new CreateUserRequest("test@example.com", "Test User", "Test", "User");
    
    _mockUserRepository.Setup(x => x.ExistsByEmailAsync(request.Email, default))
        .ReturnsAsync(false);
    
    // Act
    var result = await _userService.CreateUserAsync(request);
    
    // Assert
    result.Should().NotBeNull();
    result.User.Email.Should().Be(request.Email);
    result.Message.Should().Be("User created successfully");
    
    _mockUserRepository.Verify(x => x.AddAsync(It.IsAny<User>(), default), Times.Once);
    _mockUnitOfWork.Verify(x => x.SaveChangesAsync(default), Times.Once);
}`
        }
      ]
    },
    {
      id: 'api-tests',
      name: 'API Integration Tests',
      description: 'End-to-end tests for HTTP endpoints',
      totalTests: 24,
      passedTests: 22,
      failedTests: 0,
      skippedTests: 2,
      coverage: 76,
      duration: 8.4,
      status: 'completed',
      tests: [
        {
          id: 'users-controller-create',
          name: 'Users Controller Create Endpoint',
          description: 'Test user creation via HTTP POST',
          category: 'e2e',
          status: 'passed',
          duration: 0.342,
          coverage: 68,
          assertions: 15,
          layer: 'api',
          code: `[Fact]
public async Task CreateUser_WithValidRequest_ShouldReturn201Created()
{
    // Arrange
    var request = new CreateUserRequest("test@example.com", "Test User", "Test", "User");
    
    // Act
    var response = await _client.PostAsJsonAsync("/api/users", request);
    
    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Created);
    
    var userResponse = await response.Content.ReadFromJsonAsync<UserResponse>();
    userResponse.Should().NotBeNull();
    userResponse.User.Email.Should().Be(request.Email);
    
    // Verify database state
    var createdUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
    createdUser.Should().NotBeNull();
}`
        }
      ]
    }
  ]

  // Coverage hotspots
  const coverageHotspots: CoverageHotspot[] = [
    {
      id: 'user-validation',
      file: 'Domain/Entities/User.cs',
      line: 45,
      coverage: 67,
      complexity: 8,
      riskLevel: 'high',
      description: 'Complex email validation logic with multiple edge cases'
    },
    {
      id: 'order-calculation',
      file: 'Domain/Entities/Order.cs',
      line: 123,
      coverage: 73,
      complexity: 12,
      riskLevel: 'high',
      description: 'Order total calculation with tax and discount logic'
    },
    {
      id: 'product-stock',
      file: 'Domain/Entities/Product.cs',
      line: 89,
      coverage: 82,
      complexity: 6,
      riskLevel: 'medium',
      description: 'Stock adjustment with concurrency checks'
    },
    {
      id: 'auth-token',
      file: 'Application/Services/JwtTokenService.cs',
      line: 67,
      coverage: 91,
      complexity: 4,
      riskLevel: 'low',
      description: 'JWT token generation and validation'
    }
  ]

  // Mocking examples
  const mockingExamples: MockingExample[] = [
    {
      id: 'repository',
      title: 'Repository Mocking',
      description: 'Mock repository dependencies for isolated unit testing',
      type: 'repository',
      benefits: ['Fast test execution', 'Isolated testing', 'Deterministic results', 'No database dependencies'],
      code: `public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly Mock<IMapper> _mockMapper;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _mockMapper = new Mock<IMapper>();
        
        _mockUnitOfWork.Setup(x => x.Users).Returns(_mockUserRepository.Object);
        
        _userService = new UserService(
            _mockUnitOfWork.Object,
            _mockMapper.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task GetUserByIdAsync_ExistingUser_ShouldReturnUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User("test@example.com", "Test User", "Test", "User");
        var expectedDto = new UserDto(userId, "test@example.com", "Test User");
        
        _mockUserRepository.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _mockMapper.Setup(x => x.MapToUserDto(user))
            .Returns(expectedDto);

        // Act
        var result = await _userService.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("test@example.com");
        
        _mockUserRepository.Verify(x => x.GetByIdAsync(userId, default), Times.Once);
        _mockMapper.Verify(x => x.MapToUserDto(user), Times.Once);
    }
}`
    },
    {
      id: 'service',
      title: 'External Service Mocking',
      description: 'Mock external services and APIs for predictable testing',
      type: 'external-api',
      benefits: ['No external dependencies', 'Controlled test scenarios', 'Error condition testing', 'Fast execution'],
      code: `public class EmailServiceTests
{
    private readonly Mock<IHttpClientFactory> _mockHttpClientFactory;
    private readonly Mock<IOptions<EmailSettings>> _mockOptions;
    private readonly Mock<ILogger<EmailService>> _mockLogger;
    private readonly EmailService _emailService;
    private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;

    public EmailServiceTests()
    {
        _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        _mockHttpClientFactory = new Mock<IHttpClientFactory>();
        _mockOptions = new Mock<IOptions<EmailSettings>>();
        _mockLogger = new Mock<ILogger<EmailService>>();

        var httpClient = new HttpClient(_mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.emailprovider.com/")
        };

        _mockHttpClientFactory.Setup(x => x.CreateClient("EmailProvider"))
            .Returns(httpClient);

        var emailSettings = new EmailSettings
        {
            ApiKey = "test-api-key",
            FromEmail = "noreply@modernapi.com"
        };
        _mockOptions.Setup(x => x.Value).Returns(emailSettings);

        _emailService = new EmailService(
            _mockHttpClientFactory.Object,
            _mockOptions.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task SendEmailAsync_ValidRequest_ShouldCallEmailProvider()
    {
        // Arrange
        var emailRequest = new EmailRequest("user@example.com", "Welcome", "Welcome to ModernAPI!");
        var expectedResponse = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(new { success = true, id = "email-123" }))
        };

        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.Method == HttpMethod.Post &&
                    req.RequestUri.ToString().Contains("/send")),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _emailService.SendEmailAsync(emailRequest);

        // Assert
        result.Should().BeTrue();
        
        _mockHttpMessageHandler
            .Protected()
            .Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.Method == HttpMethod.Post &&
                    req.RequestUri.ToString().Contains("/send")),
                ItExpr.IsAny<CancellationToken>());
    }
}`
    },
    {
      id: 'database',
      title: 'Database Test Doubles',
      description: 'Use in-memory database or test containers for integration tests',
      type: 'database',
      benefits: ['Real database behavior', 'Migration testing', 'Query optimization', 'Relationship validation'],
      code: `public class IntegrationTestBase : IDisposable
{
    protected readonly ApplicationDbContext Context;
    protected readonly IServiceProvider ServiceProvider;

    protected IntegrationTestBase()
    {
        var services = new ServiceCollection();
        
        // Use in-memory database for fast tests
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
            
        // Or use test containers for production-like testing
        // services.AddDbContext<ApplicationDbContext>(options =>
        //     options.UseNpgsql(_testContainer.GetConnectionString()));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        ServiceProvider = services.BuildServiceProvider();
        Context = ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        Context.Database.EnsureCreated();
        SeedTestData();
    }

    private void SeedTestData()
    {
        var users = new[]
        {
            new User("user1@example.com", "User One", "User", "One"),
            new User("user2@example.com", "User Two", "User", "Two")
        };

        Context.Users.AddRange(users);
        Context.SaveChanges();
    }

    public void Dispose()
    {
        Context.Dispose();
        ServiceProvider.Dispose();
    }
}

public class UserRepositoryTests : IntegrationTestBase
{
    [Fact]
    public async Task GetByEmailAsync_ExistingUser_ShouldReturnUser()
    {
        // Arrange
        var repository = new UserRepository(Context);
        var email = "user1@example.com";

        // Act
        var user = await repository.GetByEmailAsync(email);

        // Assert
        user.Should().NotBeNull();
        user.Email.Should().Be(email);
    }

    [Fact]
    public async Task AddAsync_NewUser_ShouldPersistToDatabase()
    {
        // Arrange
        var repository = new UserRepository(Context);
        var newUser = new User("new@example.com", "New User", "New", "User");

        // Act
        await repository.AddAsync(newUser);
        await Context.SaveChangesAsync();

        // Assert
        var savedUser = await Context.Users.FirstOrDefaultAsync(u => u.Email == "new@example.com");
        savedUser.Should().NotBeNull();
        savedUser.DisplayName.Should().Be("New User");
    }
}`
    },
    {
      id: 'external-api',
      title: 'Test Data Builders',
      description: 'Use builder pattern for creating test data objects',
      type: 'service',
      benefits: ['Readable test setup', 'Reusable test data', 'Complex object creation', 'Maintainable tests'],
      code: `public class UserTestDataBuilder
{
    private string _email = "test@example.com";
    private string _displayName = "Test User";
    private string _firstName = "Test";
    private string _lastName = "User";
    private bool _isActive = true;
    private DateTime? _createdAt;

    public static UserTestDataBuilder AUser() => new UserTestDataBuilder();

    public UserTestDataBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public UserTestDataBuilder WithDisplayName(string displayName)
    {
        _displayName = displayName;
        return this;
    }

    public UserTestDataBuilder WithName(string firstName, string lastName)
    {
        _firstName = firstName;
        _lastName = lastName;
        return this;
    }

    public UserTestDataBuilder ThatIsInactive()
    {
        _isActive = false;
        return this;
    }

    public UserTestDataBuilder CreatedAt(DateTime createdAt)
    {
        _createdAt = createdAt;
        return this;
    }

    public User Build()
    {
        var user = new User(_email, _displayName, _firstName, _lastName);
        
        if (!_isActive)
        {
            user.Deactivate("Test deactivation");
        }
        
        if (_createdAt.HasValue)
        {
            // Use reflection or internal setter for test scenarios
            typeof(User).GetProperty("CreatedAt")?.SetValue(user, _createdAt.Value);
        }
        
        return user;
    }

    public CreateUserRequest BuildRequest() => new CreateUserRequest(_email, _displayName, _firstName, _lastName);
}

// Usage in tests:
[Fact]
public void TestUserCreation()
{
    // Arrange
    var user = UserTestDataBuilder
        .AUser()
        .WithEmail("specific@example.com")
        .WithName("John", "Doe")
        .CreatedAt(DateTime.UtcNow.AddDays(-30))
        .Build();

    // Act & Assert
    user.Email.Should().Be("specific@example.com");
    user.FirstName.Should().Be("John");
    user.LastName.Should().Be("Doe");
}`
    }
  ]

  const runTestSuite = async (suiteId: string) => {
    if (isRunningTests) return

    setIsRunningTests(true)
    setTestProgress(0)
    setCurrentRunningTest(null)

    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite) return

    const tests = suite.tests
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setCurrentRunningTest(test.id)
      
      // Update test status to running
      test.status = 'running'
      
      // Simulate test execution time
      const executionTime = test.duration ? test.duration * 1000 : Math.random() * 2000 + 500
      await new Promise(resolve => setTimeout(resolve, executionTime))
      
      // Randomly fail some tests for demonstration (but respect predefined status)
      if (test.status === 'running') {
        test.status = Math.random() > 0.9 ? 'failed' : 'passed'
        if (test.status === 'failed') {
          test.errorMessage = 'Assertion failed: Expected value did not match actual value'
        }
      }
      
      setTestProgress(((i + 1) / tests.length) * 100)
      
      // Small delay between tests
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setCurrentRunningTest(null)
    setIsRunningTests(false)
  }

  const getSelectedTestSuite = () => testSuites.find(s => s.id === selectedTestSuite)
  const getSelectedPyramidLayer = () => pyramidLayers.find(l => l.id === selectedPyramidLayer)
  const getSelectedMockExample = () => mockingExamples.find(m => m.id === selectedMockExample)

  const toggleCodeView = (key: string) => {
    setShowCode(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0)
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0)
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0)
  const averageCoverage = Math.round(testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TestTube className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Testing Philosophy & TDD Mastery</h1>
            <p className="text-muted-foreground">
              Master test-driven development, testing strategies, and quality assurance practices
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <TestTube className="w-3 h-3" />
            {totalTests} Total Tests
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            {totalPassed} Passed
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <BarChart3 className="w-3 h-3" />
            {averageCoverage}% Coverage
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            TDD Workflow
          </Badge>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="interactive-mode"
              checked={interactiveMode}
              onCheckedChange={setInteractiveMode}
            />
            <label htmlFor="interactive-mode" className="text-sm">
              Interactive Mode
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-run"
              checked={autoRun}
              onCheckedChange={setAutoRun}
            />
            <label htmlFor="auto-run" className="text-sm">
              Auto-run Tests
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-coverage"
              checked={showCodeCoverage}
              onCheckedChange={setShowCodeCoverage}
            />
            <label htmlFor="show-coverage" className="text-sm">
              Show Coverage
            </label>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side - Testing Pyramid & Strategy */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Triangle className="w-5 h-5" />
                Testing Strategy Pyramid
              </CardTitle>
              <CardDescription>
                Interactive testing pyramid with layer exploration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pyramid Visualization */}
              <div className="relative">
                {pyramidLayers.map((layer, index) => {
                  const isSelected = selectedPyramidLayer === layer.id
                  const width = 100 - (index * 25)
                  const height = 60
                  
                  return (
                    <div
                      key={layer.id}
                      className={cn(
                        'relative mx-auto mb-2 cursor-pointer transition-all duration-300 rounded-lg border-2 flex items-center justify-center',
                        isSelected && 'ring-2 ring-primary border-primary scale-105',
                        !isSelected && 'hover:scale-102 border-transparent'
                      )}
                      style={{
                        width: `${width}%`,
                        height: `${height}px`,
                        backgroundColor: `${layer.color}20`,
                        borderColor: layer.color
                      }}
                      onClick={() => setSelectedPyramidLayer(layer.id)}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {layer.icon}
                          <span className="font-medium text-sm">{layer.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {layer.testCount} tests • {layer.coverage}% coverage
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Layer Details */}
              {getSelectedPyramidLayer() && (
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getSelectedPyramidLayer()!.icon}
                    <h4 className="font-medium">{getSelectedPyramidLayer()!.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getSelectedPyramidLayer()!.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{getSelectedPyramidLayer()!.testCount}</div>
                      <div className="text-xs text-muted-foreground">Tests</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{getSelectedPyramidLayer()!.coverage}%</div>
                      <div className="text-xs text-muted-foreground">Coverage</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{getSelectedPyramidLayer()!.executionTime}s</div>
                      <div className="text-xs text-muted-foreground">Execution</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{getSelectedPyramidLayer()!.confidence}%</div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Test Examples:</h5>
                    {getSelectedPyramidLayer()!.examples.map((example, index) => (
                      <div key={index} className="text-xs p-2 bg-muted/30 rounded">
                        • {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Suites Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Test Suites
              </CardTitle>
              <CardDescription>
                Organized by architecture layer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testSuites.map((suite) => (
                <div
                  key={suite.id}
                  className={cn(
                    'p-3 border rounded-lg cursor-pointer transition-all',
                    selectedTestSuite === suite.id && 'ring-2 ring-primary border-primary bg-primary/5'
                  )}
                  onClick={() => setSelectedTestSuite(suite.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{suite.name}</h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {suite.totalTests} tests
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          runTestSuite(suite.id)
                        }}
                        disabled={isRunningTests}
                        className="h-6 w-6 p-0"
                      >
                        {isRunningTests && selectedTestSuite === suite.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {suite.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600">{suite.passedTests} passed</span>
                      {suite.failedTests > 0 && (
                        <span className="text-red-600">{suite.failedTests} failed</span>
                      )}
                      {suite.skippedTests > 0 && (
                        <span className="text-yellow-600">{suite.skippedTests} skipped</span>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {suite.coverage}% coverage
                    </div>
                  </div>
                  
                  <Progress 
                    value={(suite.passedTests / suite.totalTests) * 100} 
                    className="mt-2 h-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center - Test Runner & Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Live Test Runner
              </CardTitle>
              <CardDescription>
                Real-time test execution with detailed results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Progress */}
              {isRunningTests && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Running Tests...</span>
                    <span>{Math.round(testProgress)}%</span>
                  </div>
                  <Progress value={testProgress} className="w-full" />
                  {currentRunningTest && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running: {getSelectedTestSuite()?.tests.find(t => t.id === currentRunningTest)?.name}
                    </div>
                  )}
                </div>
              )}

              {/* Test Suite Results */}
              {getSelectedTestSuite() && (
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-2">
                    {getSelectedTestSuite()!.tests.map((test) => (
                      <div
                        key={test.id}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-all',
                          selectedTestCase === test.id && 'ring-2 ring-primary',
                          test.status === 'passed' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10',
                          test.status === 'failed' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                          test.status === 'running' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 animate-pulse',
                          test.status === 'pending' && 'border-muted-foreground/20'
                        )}
                        onClick={() => setSelectedTestCase(test.id === selectedTestCase ? null : test.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {test.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {test.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                            {test.status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                            {test.status === 'pending' && <Clock className="w-4 h-4 text-muted-foreground" />}
                            {test.status === 'skipped' && <SkipForward className="w-4 h-4 text-yellow-500" />}
                            <h4 className="font-medium text-sm">{test.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {test.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {test.layer}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {test.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span>{test.assertions} assertions</span>
                            {test.duration && <span>{(test.duration * 1000).toFixed(0)}ms</span>}
                            {showCodeCoverage && (
                              <span className="text-muted-foreground">{test.coverage}% coverage</span>
                            )}
                          </div>
                          <Badge 
                            variant={test.status === 'passed' ? 'default' : test.status === 'failed' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {test.status}
                          </Badge>
                        </div>
                        
                        {test.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {test.errorMessage}
                          </div>
                        )}

                        {selectedTestCase === test.id && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium">Test Code</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigator.clipboard.writeText(test.code)
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <ScrollArea className="h-32 w-full">
                              <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">
                                <code>{test.code}</code>
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* TDD Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                TDD Workflow
              </CardTitle>
              <CardDescription>
                Red-Green-Refactor cycle demonstration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
                    <div className="w-8 h-8 mx-auto mb-2 bg-red-500 text-white rounded-full flex items-center justify-center">
                      1
                    </div>
                    <h4 className="font-medium text-sm text-red-700 dark:text-red-400 mb-1">RED</h4>
                    <p className="text-xs text-red-600 dark:text-red-500">Write failing test</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
                    <div className="w-8 h-8 mx-auto mb-2 bg-green-500 text-white rounded-full flex items-center justify-center">
                      2
                    </div>
                    <h4 className="font-medium text-sm text-green-700 dark:text-green-400 mb-1">GREEN</h4>
                    <p className="text-xs text-green-600 dark:text-green-500">Make test pass</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      3
                    </div>
                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-400 mb-1">REFACTOR</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-500">Improve code</p>
                  </div>
                </div>
                
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>TDD Benefits</AlertTitle>
                  <AlertDescription className="text-sm">
                    <ul className="space-y-1 mt-2">
                      <li>• Design-driven development</li>
                      <li>• High test coverage by design</li>
                      <li>• Better code architecture</li>
                      <li>• Reduced debugging time</li>
                      <li>• Living documentation</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Coverage & Mocking */}
        <div className="space-y-6">
          {/* Code Coverage Visualization */}
          {showCodeCoverage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Code Coverage Analysis
                </CardTitle>
                <CardDescription>
                  Interactive coverage hotspots and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coverage Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {averageCoverage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Coverage</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {coverageHotspots.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Hotspots</div>
                  </div>
                </div>

                {/* Coverage Hotspots */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Coverage Hotspots</h4>
                  {coverageHotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className={cn(
                        'p-3 border rounded-lg',
                        hotspot.riskLevel === 'high' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                        hotspot.riskLevel === 'medium' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
                        hotspot.riskLevel === 'low' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={cn(
                            'w-4 h-4',
                            hotspot.riskLevel === 'high' && 'text-red-500',
                            hotspot.riskLevel === 'medium' && 'text-yellow-500',
                            hotspot.riskLevel === 'low' && 'text-green-500'
                          )} />
                          <Badge 
                            variant={hotspot.riskLevel === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {hotspot.riskLevel} risk
                          </Badge>
                        </div>
                        <div className="text-xs font-mono">
                          {hotspot.coverage}% coverage
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium mb-1">
                        {hotspot.file}:{hotspot.line}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {hotspot.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span>Complexity: {hotspot.complexity}</span>
                        <Progress value={hotspot.coverage} className="w-20 h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mocking Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Mocking Strategies
              </CardTitle>
              <CardDescription>
                Test isolation and dependency management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock Type Selector */}
              <div className="flex flex-wrap gap-2">
                {mockingExamples.map((example) => (
                  <Button
                    key={example.id}
                    variant={selectedMockExample === example.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMockExample(example.id)}
                  >
                    {example.title}
                  </Button>
                ))}
              </div>

              {/* Selected Mock Example */}
              {getSelectedMockExample() && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{getSelectedMockExample()!.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {getSelectedMockExample()!.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {getSelectedMockExample()!.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Implementation Example</h5>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCodeView(`mock-${selectedMockExample}`)}
                        >
                          {showCode[`mock-${selectedMockExample}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(getSelectedMockExample()!.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {showCode[`mock-${selectedMockExample}`] && (
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-xs bg-muted p-4 rounded-lg font-mono overflow-x-auto">
                          <code>{getSelectedMockExample()!.code}</code>
                        </pre>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Testing Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Testing
              </CardTitle>
              <CardDescription>
                Test execution metrics and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">2.3s</div>
                  <div className="text-xs text-muted-foreground">Avg Test Time</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">67ms</div>
                  <div className="text-xs text-muted-foreground">DB Round Trip</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">12GB</div>
                  <div className="text-xs text-muted-foreground">Memory Usage</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">99.7%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Optimization Tips</h4>
                <div className="space-y-2">
                  {[
                    'Use in-memory databases for integration tests',
                    'Parallel test execution for faster CI/CD',
                    'Mock external dependencies appropriately',
                    'Test data builders for maintainable setup',
                    'Categorize tests by execution speed'
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>Testing Resources</AlertTitle>
                <AlertDescription className="text-sm">
                  Comprehensive testing guides, best practices, and advanced patterns available in the documentation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="testing" />
    </div>
  )
}