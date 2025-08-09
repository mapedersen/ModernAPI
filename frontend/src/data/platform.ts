import type { NavigationSection } from '~/types/platform'

// Top-level handbook item
export const handbookItem = {
  id: 'handbook',
  title: 'ModernAPI Handbook',
  description: 'Twelve principles of modern software development - our philosophy and methodology',
  path: '/docs/handbook',
  icon: '📕',
  category: 'handbook',
  estimatedTime: '25 min',
  difficulty: 'intermediate' as const,
  tags: ['philosophy', 'principles', 'methodology', '12-factor']
}

// Enhanced platform navigation structure
export const platformSections: NavigationSection[] = [
  {
    id: 'learn',
    title: 'Learn',
    description: 'Interactive learning modules for getting started',
    icon: '📚',
    order: 1,
    items: [
      {
        id: 'architecture',
        title: 'Clean Architecture Deep Dive',
        description: 'Explore Clean Architecture layers, dependency inversion, and domain-driven design',
        path: '/docs/learn/architecture',
        icon: '🏗️',
        category: 'learn',
        estimatedTime: '15 min',
        difficulty: 'intermediate'
      },
      {
        id: 'authentication',
        title: 'Authentication & Security',
        description: 'JWT tokens, ASP.NET Core Identity, and enterprise security patterns',
        path: '/docs/learn/authentication',
        icon: '🔐',
        category: 'learn',
        estimatedTime: '20 min',
        difficulty: 'intermediate'
      },
      {
        id: 'database',
        title: 'Database & Domain Design',
        description: 'Entity Framework Core, rich domain entities, and database patterns',
        path: '/docs/learn/database',
        icon: '🗄️',
        category: 'learn',
        estimatedTime: '25 min',
        difficulty: 'intermediate',
        prerequisites: ['architecture']
      },
      {
        id: 'testing',
        title: 'Testing & TDD Approach',
        description: 'Unit testing, integration testing, and test-driven development patterns',
        path: '/docs/learn/testing',
        icon: '🧪',
        category: 'learn',
        estimatedTime: '30 min',
        difficulty: 'advanced',
        prerequisites: ['architecture', 'database']
      },
      {
        id: 'caching',
        title: 'Redis Caching & Performance',
        description: 'Redis implementation, caching strategies, and performance optimization patterns',
        path: '/docs/learn/caching',
        icon: '⚡',
        category: 'learn',
        estimatedTime: '20 min',
        difficulty: 'intermediate',
        prerequisites: ['architecture']
      },
      {
        id: 'rest-api',
        title: 'REST API Best Practices',
        description: 'Modern REST API design, error handling, versioning, and enterprise patterns',
        path: '/docs/learn/rest-api',
        icon: '🔗',
        category: 'learn',
        estimatedTime: '22 min',
        difficulty: 'intermediate',
        prerequisites: ['architecture']
      },
      {
        id: 'frontend',
        title: 'Modern React Frontend',
        description: 'TanStack Start, Bun runtime, and Backend-for-Frontend patterns',
        path: '/docs/learn/frontend',
        icon: '🚀',
        category: 'learn',
        estimatedTime: '25 min',
        difficulty: 'advanced',
        prerequisites: ['authentication']
      }
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Interactive development tools and utilities',
    icon: '🔧',
    order: 2,
    items: [
      {
        id: 'api-playground',
        title: 'API Playground',
        description: 'Interactive API testing with real backend integration and code generation',
        path: '/docs/tools/api-playground',
        icon: '🎮',
        category: 'tools',
        estimatedTime: '10 min',
        difficulty: 'beginner'
      },
      {
        id: 'scaffolding',
        title: 'Entity Scaffolding',
        description: 'Generate Clean Architecture boilerplate for new entities with full CRUD operations',
        path: '/docs/tools/scaffolding',
        icon: '🏗️',
        category: 'tools',
        estimatedTime: '5 min',
        difficulty: 'beginner'
      },
      {
        id: 'monitoring',
        title: 'Monitoring Dashboard',
        description: 'Real-time application metrics, health checks, and performance monitoring',
        path: '/docs/tools/monitoring',
        icon: '📊',
        category: 'tools',
        estimatedTime: '15 min',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'reference',
    title: 'Reference',
    description: 'Daily documentation and decision-making resources',
    icon: '📖',
    order: 4,
    items: [
      {
        id: 'adr',
        title: 'Architecture Decision Records',
        description: 'Decision records explaining the rationale behind every architectural choice',
        path: '/docs/reference/adr',
        icon: '🎯',
        category: 'reference',
        estimatedTime: '10 min',
        difficulty: 'intermediate',
        tags: ['decision-making', 'architecture', 'rationale']
      },
      {
        id: 'api-reference',
        title: 'API Documentation',
        description: 'Complete API reference with live testing capabilities',
        path: '/docs/reference/api',
        icon: '🔌',
        category: 'reference',
        estimatedTime: '15 min',
        difficulty: 'beginner',
        tags: ['api', 'endpoints', 'testing']
      },
      {
        id: 'code-standards',
        title: 'Code Standards',
        description: 'Coding conventions, naming patterns, and style guidelines',
        path: '/docs/reference/standards',
        icon: '📏',
        category: 'reference',
        estimatedTime: '12 min',
        difficulty: 'beginner',
        tags: ['standards', 'conventions', 'style']
      },
      {
        id: 'pattern-library',
        title: 'Pattern Library',
        description: 'Design patterns used throughout the template with examples',
        path: '/docs/reference/patterns',
        icon: '🧩',
        category: 'reference',
        estimatedTime: '20 min',
        difficulty: 'intermediate',
        tags: ['patterns', 'design', 'examples']
      },
      {
        id: 'configuration',
        title: 'Configuration Reference',
        description: 'Complete configuration options and environment setup',
        path: '/docs/reference/config',
        icon: '⚙️',
        category: 'reference',
        estimatedTime: '8 min',
        difficulty: 'beginner',
        tags: ['config', 'environment', 'setup']
      }
    ]
  },
  {
    id: 'guides',
    title: 'Guides',
    description: 'Step-by-step instructions for common development tasks',
    icon: '🛠️',
    order: 3,
    items: [
      {
        id: 'add-entity',
        title: 'Adding New Entities',
        description: 'Complete workflow for adding domain entities with all layers',
        path: '/docs/guides/add-entity',
        icon: '➕',
        category: 'guides',
        estimatedTime: '15 min',
        difficulty: 'intermediate',
        tags: ['entity', 'domain', 'workflow']
      },
      {
        id: 'add-endpoint',
        title: 'Creating API Endpoints',
        description: 'End-to-end guide for adding new REST endpoints',
        path: '/docs/guides/add-endpoint',
        icon: '🔗',
        category: 'guides',
        estimatedTime: '12 min',
        difficulty: 'intermediate',
        tags: ['api', 'endpoint', 'rest']
      },
      {
        id: 'database-migrations',
        title: 'Database Migrations',
        description: 'Safe migration strategies and schema evolution',
        path: '/docs/guides/migrations',
        icon: '📊',
        category: 'guides',
        estimatedTime: '18 min',
        difficulty: 'intermediate',
        tags: ['database', 'migration', 'schema']
      },
      {
        id: 'testing-guide',
        title: 'Writing Effective Tests',
        description: 'TDD workflow and testing best practices',
        path: '/docs/guides/testing',
        icon: '✅',
        category: 'guides',
        estimatedTime: '25 min',
        difficulty: 'advanced',
        tags: ['testing', 'tdd', 'quality']
      },
      {
        id: 'customization',
        title: 'Template Customization',
        description: 'Adapting the template for different domains and use cases',
        path: '/docs/guides/customization',
        icon: '🎨',
        category: 'guides',
        estimatedTime: '30 min',
        difficulty: 'advanced',
        tags: ['customization', 'adaptation', 'domains']
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        description: 'Common issues and their solutions',
        path: '/docs/guides/troubleshooting',
        icon: '🔍',
        category: 'guides',
        estimatedTime: '10 min',
        difficulty: 'beginner',
        tags: ['debug', 'issues', 'solutions']
      },
      {
        id: 'production',
        title: 'Production Deployment',
        description: 'Complete production deployment and operations guide',
        path: '/docs/guides/deployment',
        icon: '🚀',
        category: 'guides',
        estimatedTime: '45 min',
        difficulty: 'advanced',
        tags: ['production', 'deployment', 'operations']
      },
      {
        id: 'git-workflow',
        title: 'Git Workflow & Collaboration',
        description: 'Best practices for team collaboration, branching strategies, and code review',
        path: '/docs/guides/git-workflow',
        icon: '🌿',
        category: 'guides',
        estimatedTime: '15 min',
        difficulty: 'beginner',
        tags: ['git', 'collaboration', 'workflow']
      }
    ]
  }
]

// Helper functions to work with navigation data
export function getAllNavigationItems() {
  return platformSections.flatMap(section => section.items)
}

export function getNavigationItemById(id: string) {
  return getAllNavigationItems().find(item => item.id === id)
}

export function getNavigationItemsByCategory(category: string) {
  return getAllNavigationItems().filter(item => item.category === category)
}

export function getNavigationSectionByCategory(category: string) {
  return platformSections.find(section => section.id === category)
}

export function getNavigationItemsByTag(tag: string) {
  return getAllNavigationItems().filter(item => item.tags?.includes(tag))
}

export function getPrerequisiteItems(itemId: string) {
  const item = getNavigationItemById(itemId)
  if (!item?.prerequisites) return []
  
  return item.prerequisites.map(prereqId => getNavigationItemById(prereqId)).filter(Boolean)
}

export function getDependentItems(itemId: string) {
  return getAllNavigationItems().filter(item => 
    item.prerequisites?.includes(itemId)
  )
}