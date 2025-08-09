import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { LearningModule } from '~/types/learning'

interface LearningState {
  currentModule: string | null
  
  // Actions
  setCurrentModule: (moduleId: string) => void
  getNextModule: () => LearningModule | null
  getPreviousModule: () => LearningModule | null
}

export const useLearningStore = create<LearningState>()(
  devtools(
    (set, get) => ({
      currentModule: null,

      setCurrentModule: (moduleId) =>
        set({ currentModule: moduleId }),

      getNextModule: () => {
        const state = get()
        if (!state.currentModule) return null
        
        const currentIndex = learningModules.findIndex(m => m.id === state.currentModule)
        if (currentIndex === -1 || currentIndex === learningModules.length - 1) return null
        
        return learningModules[currentIndex + 1]
      },

      getPreviousModule: () => {
        const state = get()
        if (!state.currentModule) return null
        
        const currentIndex = learningModules.findIndex(m => m.id === state.currentModule)
        if (currentIndex <= 0) return null
        
        return learningModules[currentIndex - 1]
      },
    }),
    { name: 'learning-store' }
  )
)

// Learning module definitions
export const learningModules: LearningModule[] = [
  {
    id: 'welcome',
    title: 'Welcome & Template Overview',
    description: 'Introduction to ModernAPI template and its enterprise-grade features',
    icon: '🏠',
    path: '/',
    order: 1,
    estimatedTime: '5 min',
    difficulty: 'beginner'
  },
  {
    id: 'architecture',
    title: 'Backend Architecture Deep Dive',
    description: 'Interactive exploration of Clean Architecture patterns and design decisions',
    icon: '🏗️',
    path: '/learn/architecture',
    order: 2,
    estimatedTime: '15 min',
    difficulty: 'intermediate'
  },
  {
    id: 'authentication',
    title: 'Authentication & Security Masterclass',
    description: 'Hands-on experience with JWT authentication and enterprise security',
    icon: '🔐',
    path: '/learn/authentication',
    order: 3,
    estimatedTime: '20 min',
    difficulty: 'intermediate'
  },
  {
    id: 'database',
    title: 'Database & Domain Design',
    description: 'Entity Framework Core, migrations, and domain modeling best practices',
    icon: '🗄️',
    path: '/learn/database',
    order: 4,
    estimatedTime: '25 min',
    difficulty: 'intermediate'
  },
  {
    id: 'caching',
    title: 'HTTP Caching & Performance',
    description: 'Master HTTP caching strategies for optimal API performance',
    icon: '⚡',
    path: '/learn/caching',
    order: 5,
    estimatedTime: '15 min',
    difficulty: 'intermediate'
  },
  {
    id: 'rest-api',
    title: 'REST API Best Practices',
    description: 'Modern REST API design patterns, error handling, and enterprise-grade implementation',
    icon: '🌐',
    path: '/learn/rest-api',
    order: 6,
    estimatedTime: '25 min',
    difficulty: 'intermediate'
  },
  {
    id: 'testing',
    title: 'Testing Philosophy & TDD',
    description: 'Comprehensive testing strategies from unit to integration testing',
    icon: '🧪',
    path: '/learn/testing',
    order: 7,
    estimatedTime: '30 min',
    difficulty: 'advanced'
  },
  {
    id: 'frontend',
    title: 'Frontend Architecture (TanStack + Bun)',
    description: 'Modern React frontend with BFF pattern and performance optimization',
    icon: '🚀',
    path: '/learn/frontend',
    order: 8,
    estimatedTime: '25 min',
    difficulty: 'advanced'
  }
]