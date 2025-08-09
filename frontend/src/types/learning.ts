// Learning platform specific types
export interface LearningModule {
  id: string
  title: string
  description: string
  icon: string
  path: string
  order: number
  estimatedTime: string
  prerequisites?: string[]
  learningOutcomes?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface ArchitectureLayer {
  id: string
  name: string
  description: string
  color: string
  technologies: string[]
  responsibilities: string[]
  codeExamples: CodeExample[]
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface CodeExample {
  id: string
  title: string
  description: string
  language: string
  code: string
  filePath?: string
  highlightLines?: number[]
  explanation?: string
}

export interface PerformanceBenchmark {
  id: string
  name: string
  description: string
  metrics: {
    bun: number
    nodejs: number
    unit: string
    higherIsBetter: boolean
  }
}

export interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  title: string
  description: string
  parameters?: APIParameter[]
  requestBody?: APIRequestBody
  responses: APIResponse[]
  securityFeatures: string[]
  codeExamples: {
    curl: string
    javascript: string
    csharp: string
  }
}

export interface APIParameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: any
}

export interface APIRequestBody {
  contentType: string
  schema: any
  example: any
}

export interface APIResponse {
  statusCode: number
  description: string
  schema?: any
  example?: any
}

export interface ScaffoldingDemo {
  entityName: string
  properties: EntityProperty[]
  relationships: EntityRelationship[]
  generatedFiles: GeneratedFile[]
  timeToGenerate: number
}

export interface EntityProperty {
  name: string
  type: string
  isRequired: boolean
  validations: string[]
  example?: any
}

export interface EntityRelationship {
  type: 'oneToOne' | 'oneToMany' | 'manyToMany'
  targetEntity: string
  foreignKey?: string
}

export interface GeneratedFile {
  path: string
  type: 'entity' | 'repository' | 'service' | 'controller' | 'dto' | 'validation' | 'configuration' | 'migration' | 'test'
  size: string
  linesOfCode: number
  preview: string
}

// API Playground types
export interface APIPlaygroundEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  title: string
  description: string
  category: string
  requiresAuth: boolean
  parameters?: APIParameterDefinition[]
  requestBody?: APIRequestBodyDefinition
  responses: APIResponseDefinition[]
  tags: string[]
  example: {
    curl: string
    javascript: string
    csharp: string
    python: string
  }
}

export interface APIParameterDefinition {
  name: string
  in: 'query' | 'path' | 'header'
  type: string
  required: boolean
  description: string
  example?: any
  enum?: string[]
}

export interface APIRequestBodyDefinition {
  contentType: string
  schema: any
  example: any
  description: string
}

export interface APIResponseDefinition {
  statusCode: number
  description: string
  contentType?: string
  schema?: any
  example?: any
  headers?: Record<string, string>
}

export interface APIRequestState {
  endpoint: APIPlaygroundEndpoint | null
  method: string
  url: string
  headers: Record<string, string>
  queryParams: Record<string, string>
  pathParams: Record<string, string>
  body: string
  bodyType: 'json' | 'form' | 'text'
}

export interface APIResponseState {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: string
  duration?: number
  size?: number
  timestamp?: Date
  error?: string
}

export interface AuthFlowStep {
  id: string
  title: string
  description: string
  type: 'login' | 'refresh' | 'protected-request' | 'logout'
  endpoint: string
  method: string
  requestExample: any
  responseExample: any
  explanation: string
  securityFeatures: string[]
}

export interface ErrorScenario {
  id: string
  title: string
  description: string
  statusCode: number
  errorType: string
  problemDetails: any
  resolution: string
  preventionTips: string[]
}

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, any>
  }
}