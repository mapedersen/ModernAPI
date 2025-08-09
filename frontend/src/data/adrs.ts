import type { ADR } from '~/types/platform'

export const adrs: ADR[] = [
  {
    id: 'adr-001-clean-architecture',
    number: 1,
    title: 'Adopt Clean Architecture Pattern',
    status: 'accepted',
    date: '2024-01-15',
    deciders: ['Lead Architect', 'Senior Backend Developer'],
    context: `We need to establish a scalable and maintainable architecture for the ModernAPI template that will serve as a foundation for enterprise applications. The architecture should support long-term maintainability, testability, and allow for easy extension and modification.`,
    problem: `Traditional layered architectures often lead to tight coupling between business logic and external dependencies, making the code harder to test and maintain. We need an architecture that:
    - Keeps business logic independent from external concerns
    - Makes the system highly testable
    - Supports easy integration of new features
    - Provides clear separation of responsibilities`,
    alternatives: [
      {
        name: 'Traditional N-Tier Architecture',
        description: 'Standard three-tier architecture with Presentation, Business, and Data layers',
        pros: [
          'Well-known pattern',
          'Simple to implement',
          'Clear layer separation'
        ],
        cons: [
          'Business logic often mixed with data access',
          'Difficult to test business rules in isolation',
          'Tight coupling to database schema',
          'Framework dependencies leak into business logic'
        ],
        cost: 'low',
        complexity: 'low',
        riskLevel: 'medium'
      },
      {
        name: 'Hexagonal Architecture (Ports and Adapters)',
        description: 'Architecture that isolates core business logic from external concerns using ports and adapters',
        pros: [
          'Clear separation of business logic',
          'Highly testable',
          'Framework agnostic core',
          'Easy to swap implementations'
        ],
        cons: [
          'More complex setup',
          'Learning curve for developers',
          'More interfaces to manage'
        ],
        cost: 'medium',
        complexity: 'medium',
        riskLevel: 'low'
      },
      {
        name: 'Clean Architecture',
        description: 'Architecture with dependency rule pointing inward, keeping business rules isolated',
        pros: [
          'Business rules completely independent',
          'Highly testable',
          'Framework and database agnostic',
          'Clear dependency direction',
          'Well-documented pattern'
        ],
        cons: [
          'Initial complexity',
          'More boilerplate code',
          'Requires discipline to maintain'
        ],
        cost: 'medium',
        complexity: 'medium',
        riskLevel: 'low'
      }
    ],
    decision: `We will adopt Clean Architecture as the foundational pattern for ModernAPI template.`,
    rationale: `Clean Architecture provides the best balance of maintainability, testability, and long-term flexibility. The dependency rule ensures that business logic remains pure and testable, while the clear layer separation makes the codebase easier to understand and modify. Although it requires more initial setup, the long-term benefits outweigh the costs, especially for a template intended for enterprise use.`,
    consequences: [
      {
        type: 'positive',
        description: 'Business logic becomes completely testable in isolation',
        impact: 'high',
        area: 'maintainability'
      },
      {
        type: 'positive',
        description: 'Easy to swap implementations (e.g., database providers)',
        impact: 'high',
        area: 'flexibility'
      },
      {
        type: 'positive',
        description: 'Clear boundaries between layers reduce coupling',
        impact: 'high',
        area: 'architecture'
      },
      {
        type: 'neutral',
        description: 'More interfaces and abstractions to manage',
        impact: 'medium',
        area: 'complexity'
      },
      {
        type: 'negative',
        description: 'Initial development velocity may be slower',
        impact: 'medium',
        area: 'performance'
      }
    ],
    implementation: {
      overview: 'The implementation follows the Clean Architecture layers: Domain, Application, Infrastructure, and API.',
      codeExamples: [
        {
          id: 'domain-entity',
          title: 'Domain Entity Example',
          description: 'Rich domain entity with business logic encapsulated',
          language: 'csharp',
          filename: 'ModernAPI.Domain/Entities/User.cs',
          code: `public class User : Entity<Guid>
{
    public string DisplayName { get; private set; }
    public string Email { get; private set; }
    public bool IsActive { get; private set; }
    
    public User(string displayName, string email)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ArgumentException("Display name is required");
            
        Id = Guid.NewGuid();
        DisplayName = displayName;
        Email = email;
        IsActive = true;
        
        RaiseDomainEvent(new UserCreatedEvent(Id, displayName, email));
    }
    
    public void Deactivate()
    {
        if (!IsActive)
            throw new InvalidOperationException("User is already deactivated");
            
        IsActive = false;
        RaiseDomainEvent(new UserDeactivatedEvent(Id));
    }
}`,
          explanation: 'Domain entities contain business logic and maintain invariants through private setters and validation.'
        },
        {
          id: 'application-service',
          title: 'Application Service Example',
          description: 'Application service orchestrating use cases',
          language: 'csharp',
          filename: 'ModernAPI.Application/Services/UserService.cs',
          code: `public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    
    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var user = new User(request.DisplayName, request.Email);
        
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();
        
        return _mapper.MapToUserResponse(user);
    }
}`,
          explanation: 'Application services coordinate between domain and infrastructure layers without containing business logic.'
        }
      ],
      configurationChanges: [
        {
          file: 'ModernAPI.API/Program.cs',
          section: 'Dependency Injection',
          before: '// Traditional service registration',
          after: `builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);`,
          explanation: 'Clean separation of DI configuration by layer'
        }
      ]
    },
    relatedADRs: ['adr-002-domain-driven-design', 'adr-003-repository-pattern'],
    tags: ['architecture', 'design-patterns', 'maintainability', 'testing']
  },
  {
    id: 'adr-002-domain-driven-design',
    number: 2,
    title: 'Implement Domain-Driven Design Patterns',
    status: 'accepted',
    date: '2024-01-20',
    deciders: ['Lead Architect', 'Senior Backend Developer', 'Domain Expert'],
    context: `With Clean Architecture established, we need to define how to model the business domain effectively. The template should demonstrate proper domain modeling techniques that accurately represent business concepts and rules.`,
    problem: `Anemic domain models lead to business logic scattered throughout the application layers, making it hard to maintain consistency and understand business rules. We need a approach that:
    - Encapsulates business logic within domain objects
    - Makes business rules explicit and testable
    - Provides a ubiquitous language for the domain
    - Ensures domain invariants are maintained`,
    alternatives: [
      {
        name: 'Anemic Domain Model',
        description: 'Simple POCOs with getters/setters, business logic in services',
        pros: [
          'Simple to understand',
          'Easy ORM mapping',
          'Familiar to most developers'
        ],
        cons: [
          'Business logic scattered across services',
          'No encapsulation of business rules',
          'Difficult to maintain invariants',
          'Poor expression of domain concepts'
        ],
        cost: 'low',
        complexity: 'low',
        riskLevel: 'high'
      },
      {
        name: 'Rich Domain Model',
        description: 'Domain objects with encapsulated business logic and behavior',
        pros: [
          'Business logic co-located with data',
          'Clear expression of business rules',
          'Better encapsulation',
          'Easier to test business logic'
        ],
        cons: [
          'More complex ORM mapping',
          'Learning curve for developers',
          'Potential performance considerations'
        ],
        cost: 'medium',
        complexity: 'medium',
        riskLevel: 'low'
      }
    ],
    decision: `We will implement Domain-Driven Design patterns with rich domain models, domain events, and value objects.`,
    rationale: `Rich domain models provide better encapsulation of business logic and make the code more expressive of business concepts. Domain events enable loose coupling between aggregates, and value objects ensure type safety and validation. This approach aligns well with Clean Architecture principles.`,
    consequences: [
      {
        type: 'positive',
        description: 'Business logic is properly encapsulated within domain objects',
        impact: 'high',
        area: 'maintainability'
      },
      {
        type: 'positive',
        description: 'Domain events enable decoupled business process handling',
        impact: 'high',
        area: 'flexibility'
      },
      {
        type: 'positive',
        description: 'Value objects provide type safety and validation',
        impact: 'medium',
        area: 'security'
      },
      {
        type: 'neutral',
        description: 'Requires more sophisticated ORM configuration',
        impact: 'medium',
        area: 'complexity'
      }
    ],
    implementation: {
      overview: 'Implementation includes rich entities, domain events, value objects, and aggregates with proper encapsulation.',
      codeExamples: [
        {
          id: 'domain-event',
          title: 'Domain Event Example',
          description: 'Domain event raised when business state changes',
          language: 'csharp',
          filename: 'ModernAPI.Domain/Events/UserCreatedEvent.cs',
          code: `public record UserCreatedEvent(
    Guid UserId,
    string DisplayName,
    string Email
) : DomainEvent;`,
          explanation: 'Domain events capture important business moments and enable decoupled handling of business processes.'
        }
      ],
      configurationChanges: []
    },
    relatedADRs: ['adr-001-clean-architecture', 'adr-004-entity-framework-configuration'],
    tags: ['domain-driven-design', 'business-logic', 'encapsulation', 'events']
  },
  {
    id: 'adr-003-repository-pattern',
    number: 3,
    title: 'Use Repository Pattern with Unit of Work',
    status: 'accepted',
    date: '2024-01-25',
    deciders: ['Lead Architect', 'Senior Backend Developer'],
    context: `We need to abstract data access from business logic while maintaining transactional consistency across multiple operations. The pattern should work well with Entity Framework Core and support testing scenarios.`,
    problem: `Direct use of DbContext in application services creates tight coupling to Entity Framework and makes unit testing difficult. We need a pattern that:
    - Abstracts data access operations
    - Supports unit testing with mocks
    - Maintains transactional consistency
    - Provides a clean API for domain operations`,
    alternatives: [
      {
        name: 'Direct DbContext Usage',
        description: 'Inject DbContext directly into application services',
        pros: [
          'Simple and direct',
          'No additional abstraction layer',
          'Full EF Core feature access'
        ],
        cons: [
          'Tight coupling to EF Core',
          'Difficult to unit test',
          'No abstraction of data operations',
          'Business logic mixed with data access'
        ],
        cost: 'low',
        complexity: 'low',
        riskLevel: 'high'
      },
      {
        name: 'Repository Pattern',
        description: 'Abstract data access behind repository interfaces',
        pros: [
          'Clean abstraction of data access',
          'Easy to unit test with mocks',
          'Domain-focused operations',
          'Can be optimized per aggregate'
        ],
        cons: [
          'Additional abstraction layer',
          'May limit advanced EF features',
          'More interfaces to maintain'
        ],
        cost: 'medium',
        complexity: 'medium',
        riskLevel: 'low'
      },
      {
        name: 'Repository + Unit of Work',
        description: 'Repository pattern with Unit of Work for transaction management',
        pros: [
          'Clean data access abstraction',
          'Proper transaction management',
          'Coordinated operations across repositories',
          'Excellent testability'
        ],
        cons: [
          'More complex setup',
          'Additional patterns to understand',
          'Potential performance overhead'
        ],
        cost: 'medium',
        complexity: 'medium',
        riskLevel: 'low'
      }
    ],
    decision: `We will use the Repository Pattern combined with Unit of Work for data access abstraction and transaction management.`,
    rationale: `The Repository + Unit of Work pattern provides the best balance of abstraction, testability, and transaction management. It keeps business logic clean while enabling proper testing and maintaining data consistency across operations.`,
    consequences: [
      {
        type: 'positive',
        description: 'Clean separation between business logic and data access',
        impact: 'high',
        area: 'maintainability'
      },
      {
        type: 'positive',
        description: 'Excellent unit testing capabilities with mocked repositories',
        impact: 'high',
        area: 'testing'
      },
      {
        type: 'positive',
        description: 'Consistent transaction management across operations',
        impact: 'high',
        area: 'reliability'
      },
      {
        type: 'neutral',
        description: 'Additional abstraction layers to maintain',
        impact: 'medium',
        area: 'complexity'
      }
    ],
    tags: ['data-access', 'abstraction', 'testing', 'transactions']
  }
]

// Helper functions for working with ADR data
export function getADRById(id: string): ADR | undefined {
  return adrs.find(adr => adr.id === id)
}

export function getADRsByTag(tag: string): ADR[] {
  return adrs.filter(adr => adr.tags.includes(tag))
}

export function getADRsByStatus(status: ADR['status']): ADR[] {
  return adrs.filter(adr => adr.status === status)
}

export function getRelatedADRs(adrId: string): ADR[] {
  const adr = getADRById(adrId)
  if (!adr?.relatedADRs) return []
  
  return adr.relatedADRs
    .map(id => getADRById(id))
    .filter((adr): adr is ADR => adr !== undefined)
}