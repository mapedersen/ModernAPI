# Testing Strategy - ModernAPI Template

## Overview
This testing suite implements a **comprehensive, per-layer testing strategy** that enforces Clean Architecture boundaries while providing excellent coverage and maintainability. Each layer has dedicated tests that focus on its specific responsibilities and concerns.

## Testing Philosophy

### **Architectural Enforcement**
- ✅ **Layer Isolation**: Each test project only tests its corresponding layer's functionality
- ✅ **Dependency Direction**: Tests verify that dependencies flow in the correct direction
- ✅ **Boundary Validation**: Tests ensure that layers only interact through defined interfaces
- ✅ **Business Logic Focus**: Domain tests focus on business rules, not technical concerns

### **Test Pyramid Approach**
```
           Integration Tests (E2E)
          /                       \
     API Tests                Infrastructure Tests
    /         \                  /                 \
Domain Tests   Application Tests
```

## Test Projects Structure

### **1. ModernAPI.Domain.Tests**
**Purpose**: Test business logic, domain rules, and entity behavior

**Test Subjects**:
- ✅ **Entities**: Business logic, validation, invariants, and domain events
- ✅ **Value Objects**: Validation, equality, and immutability
- ✅ **Domain Events**: Event creation and properties
- ✅ **Domain Exceptions**: Error conditions and business rule violations

**Testing Approach**:
- **Pure Unit Tests**: No external dependencies, fast execution
- **Business Rule Validation**: Verify domain logic correctness
- **Domain Event Testing**: Ensure events are raised when expected
- **Value Object Behavior**: Test immutability and validation

**Base Class**: `DomainTestBase`
```csharp
public abstract class DomainTestBase
{
    protected TEvent AssertDomainEventRaised<TEvent>(Entity entity);
    protected void AssertNoDomainEventsRaised(Entity entity);
    protected User CreateValidUser();
    protected Email CreateValidEmail();
}
```

### **2. ModernAPI.Application.Tests** 
**Purpose**: Test application services, DTOs, validators, and use case orchestration

**Test Subjects**:
- ✅ **Services**: Application logic, coordination, and transaction boundaries
- ✅ **DTOs**: Data transfer and mapping
- ✅ **Validators**: FluentValidation rules and error messages
- ✅ **Mappings**: AutoMapper profile configurations

**Testing Approach**:
- **Mocked Dependencies**: Mock repositories and infrastructure concerns
- **Service Logic Testing**: Verify orchestration and business flow
- **Validation Testing**: Ensure proper input validation
- **Exception Handling**: Test error scenarios and exception propagation

**Base Class**: `ApplicationTestBase`
```csharp
public abstract class ApplicationTestBase
{
    protected readonly Mock<IUnitOfWork> MockUnitOfWork;
    protected readonly Mock<IUserRepository> MockUserRepository;
    protected readonly IMapper Mapper;
    
    protected void SetupUserRepositoryGetById(User user);
    protected void VerifyUnitOfWorkSaveChangesWasCalled();
}
```

### **3. ModernAPI.Infrastructure.Tests**
**Purpose**: Test data access, repositories, and external integrations

**Test Subjects**:
- ✅ **Repositories**: Data access patterns, querying, and persistence
- ✅ **Unit of Work**: Transaction coordination and change tracking
- ✅ **Entity Configurations**: EF Core mappings and database constraints
- ✅ **Data Migrations**: Schema evolution and data integrity

**Testing Approach**:
- **In-Memory Database**: Fast, isolated database testing
- **TestContainers**: Real PostgreSQL for integration scenarios
- **Repository Patterns**: Verify CRUD operations and queries
- **Database Integration**: Test actual persistence and retrieval

**Base Classes**: 
- `InfrastructureTestBase` (In-Memory)
- `PostgreSqlInfrastructureTestBase` (TestContainers)

```csharp
public abstract class InfrastructureTestBase : IAsyncDisposable
{
    protected readonly ApplicationDbContext DbContext;
    
    protected async Task<User> AddUserToDatabase(User user);
    protected async Task ClearDatabase();
    protected void DetachAllEntities();
}
```

### **4. ModernAPI.API.Tests**
**Purpose**: Test controllers, middleware, and HTTP-specific functionality

**Test Subjects**:
- ✅ **Controllers**: HTTP request/response handling and routing
- ✅ **Middleware**: Request pipeline processing
- ✅ **Authentication**: JWT validation and authorization
- ✅ **Model Binding**: Request deserialization and validation

**Testing Approach**:
- **Controller Unit Tests**: Mock application services
- **HTTP Response Testing**: Verify status codes and response formats
- **Authentication Testing**: Test security and authorization logic
- ✅ **Route Testing**: Ensure correct endpoint routing

**Base Class**: `ApiTestBase`
```csharp
public abstract class ApiTestBase
{
    protected readonly Mock<IUserService> MockUserService;
    
    protected ClaimsPrincipal CreateAuthenticatedUser(string userId, string email, params string[] roles);
    protected void SetupControllerUser(ControllerBase controller, ClaimsPrincipal user);
}
```

### **5. ModernAPI.IntegrationTests**
**Purpose**: Test complete end-to-end workflows across all layers

**Test Subjects**:
- ✅ **Full Request Pipeline**: HTTP → API → Application → Domain → Infrastructure
- ✅ **Authentication Flows**: JWT token validation and role-based access
- ✅ **Database Integration**: Real PostgreSQL with migrations
- ✅ **Error Handling**: Global exception middleware and error responses

**Testing Approach**:
- **WebApplicationFactory**: Full application hosting
- **TestContainers**: Real PostgreSQL database
- **HTTP Client Testing**: Actual HTTP requests and responses
- **Database Cleanup**: Respawn for test isolation

**Base Class**: `IntegrationTestBase`
```csharp
public abstract class IntegrationTestBase : IAsyncDisposable
{
    protected readonly HttpClient HttpClient;
    protected readonly ApplicationDbContext DbContext;
    
    protected async Task<HttpResponseMessage> PostAsJsonAsync<T>(string uri, T content);
    protected async Task ResetDatabase();
    protected void SetAuthorizationHeader(string token);
}
```

## Testing Tools & Libraries

### **Core Testing Framework**
- **xUnit**: Primary test framework with excellent .NET integration
- **FluentAssertions**: Readable and expressive assertions
- **AutoFixture/Bogus**: Test data generation for realistic scenarios

### **Mocking & Isolation**
- **Moq**: Mocking framework for isolating dependencies
- **Microsoft.AspNetCore.Mvc.Testing**: Web application testing
- **Microsoft.EntityFrameworkCore.InMemory**: Fast database testing

### **Database Testing**
- **Testcontainers**: Real PostgreSQL instances for integration tests
- **Respawn**: Database cleanup and state management
- **Microsoft.EntityFrameworkCore.InMemory**: Lightweight database testing

## Running Tests

### **Run All Tests**
```bash
dotnet test
```

### **Run Tests by Layer**
```bash
# Domain layer tests (fastest)
dotnet test tests/ModernAPI.Domain.Tests

# Application layer tests
dotnet test tests/ModernAPI.Application.Tests

# Infrastructure layer tests
dotnet test tests/ModernAPI.Infrastructure.Tests

# API layer tests
dotnet test tests/ModernAPI.API.Tests

# Integration tests (slowest)
dotnet test tests/ModernAPI.IntegrationTests
```

### **Run with Coverage**
```bash
dotnet test --collect:"XPlat Code Coverage"
```

### **Run in Watch Mode**
```bash
dotnet watch test tests/ModernAPI.Domain.Tests
```

## Test Organization Patterns

### **Naming Conventions**
```csharp
// Pattern: [MethodUnderTest]_[Scenario]_[ExpectedBehavior]
public void CreateUser_WithValidData_ShouldCreateUserSuccessfully()
public void CreateUser_WithDuplicateEmail_ShouldThrowConflictException()
public void GetUser_WithNonExistentId_ShouldThrowNotFoundException()
```

### **Test Structure (AAA Pattern)**
```csharp
[Fact]
public async Task CreateUser_WithValidRequest_ShouldCreateUser()
{
    // Arrange
    var request = CreateValidCreateUserRequest();
    SetupUserRepositoryEmailNotExists(new Email(request.Email));

    // Act
    var result = await _userService.CreateUserAsync(request);

    // Assert
    result.Should().NotBeNull();
    result.User.Email.Should().Be(request.Email);
    VerifyUserWasAdded();
    VerifyUnitOfWorkSaveChangesWasCalled();
}
```

### **Test Data Creation**
```csharp
// Use builder pattern or factory methods for consistent test data
protected User CreateValidUser() => new User(
    CreateValidEmail(),
    CreateValidDisplayName(),
    CreateValidFirstName(),
    CreateValidLastName());

// Use Bogus/Faker for realistic random data
protected string CreateValidDisplayName() => Faker.Name.FullName();
```

## Best Practices

### **Test Independence**
- ✅ Each test should be independent and not rely on other tests
- ✅ Use fresh test data for each test method
- ✅ Clean up database state between integration tests

### **Test Performance**
- ✅ Domain tests: Sub-second execution (pure unit tests)
- ✅ Application tests: Fast execution with mocked dependencies
- ✅ Infrastructure tests: In-memory database for speed
- ✅ Integration tests: TestContainers but with database cleanup

### **Test Maintainability**
- ✅ Use base classes to share common functionality
- ✅ Create helper methods for test data generation
- ✅ Keep tests focused on single responsibilities
- ✅ Use descriptive test names that explain the scenario

### **Coverage Goals**
- **Domain Layer**: 95%+ coverage (critical business logic)
- **Application Layer**: 90%+ coverage (orchestration logic)
- **Infrastructure Layer**: 80%+ coverage (data access patterns)
- **API Layer**: 85%+ coverage (HTTP handling)
- **Integration Tests**: Key user journeys and error scenarios

## Example Test Execution

```bash
# Fast feedback loop (Domain + Application)
$ dotnet test tests/ModernAPI.Domain.Tests tests/ModernAPI.Application.Tests
  Determining projects to restore...
  All projects are up-to-date for restore.
  ModernAPI.Domain.Tests -> Passed: 42, Failed: 0, Skipped: 0
  ModernAPI.Application.Tests -> Passed: 38, Failed: 0, Skipped: 0
  
  Total tests: 80, Passed: 80, Failed: 0, Skipped: 0
  Test run time: 3.2s

# Full test suite
$ dotnet test
  ModernAPI.Domain.Tests -> Passed: 42, Failed: 0, Skipped: 0
  ModernAPI.Application.Tests -> Passed: 38, Failed: 0, Skipped: 0  
  ModernAPI.Infrastructure.Tests -> Passed: 28, Failed: 0, Skipped: 0
  ModernAPI.API.Tests -> Passed: 35, Failed: 0, Skipped: 0
  ModernAPI.IntegrationTests -> Passed: 15, Failed: 0, Skipped: 0
  
  Total tests: 158, Passed: 158, Failed: 0, Skipped: 0
  Test run time: 45.7s
```

---

**Complete Testing Foundation**: This testing strategy provides comprehensive coverage while enforcing Clean Architecture principles and enabling rapid, confident development cycles.