// Enhanced platform types for the developer documentation platform

export interface NavigationSection {
  id: string
  title: string
  description: string
  icon: string
  items: NavigationItem[]
  order: number
}

export interface NavigationItem {
  id: string
  title: string
  description: string
  path: string
  icon: string
  category: string
  estimatedTime?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  prerequisites?: string[]
  status?: 'stable' | 'beta' | 'experimental'
}

// Architecture Decision Record types
export interface ADR {
  id: string
  number: number
  title: string
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded'
  date: string
  deciders: string[]
  context: string
  problem: string
  alternatives: ADRAlternative[]
  decision: string
  rationale: string
  consequences: ADRConsequence[]
  implementation?: ADRImplementation
  relatedADRs?: string[]
  tags: string[]
}

export interface ADRAlternative {
  name: string
  description: string
  pros: string[]
  cons: string[]
  cost: 'low' | 'medium' | 'high'
  complexity: 'low' | 'medium' | 'high'
  riskLevel: 'low' | 'medium' | 'high'
}

export interface ADRConsequence {
  type: 'positive' | 'negative' | 'neutral'
  description: string
  impact: 'low' | 'medium' | 'high'
  area: string // e.g., 'performance', 'maintainability', 'security'
}

export interface ADRImplementation {
  overview: string
  codeExamples: CodeExample[]
  configurationChanges: ConfigurationChange[]
  migrationSteps?: string[]
  rollbackProcedure?: string[]
}

export interface CodeExample {
  id: string
  title: string
  description: string
  language: string
  filename?: string
  code: string
  highlights?: number[]
  explanation?: string
}

export interface ConfigurationChange {
  file: string
  section: string
  before: string
  after: string
  explanation: string
}

// Developer Workflow types
export interface WorkflowGuide {
  id: string
  title: string
  description: string
  category: string
  estimatedTime: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
  steps: WorkflowStep[]
  prerequisites: string[]
  tools: string[]
  outcomes: string[]
  troubleshooting: TroubleshootingTip[]
  relatedGuides: string[]
}

export interface WorkflowStep {
  id: string
  title: string
  description: string
  type: 'action' | 'verification' | 'decision' | 'code' | 'command'
  content: string
  codeExample?: CodeExample
  command?: string
  expectedOutput?: string
  warningNote?: string
  successCriteria?: string[]
  nextSteps?: string[]
}

export interface TroubleshootingTip {
  issue: string
  symptoms: string[]
  causes: string[]
  solutions: string[]
  preventionTips?: string[]
}

// Code Standards types
export interface CodeStandard {
  id: string
  title: string
  category: 'naming' | 'structure' | 'patterns' | 'performance' | 'security'
  language: string
  description: string
  rationale: string
  examples: CodeStandardExample[]
  exceptions?: string[]
  relatedStandards: string[]
  toolingSupport?: ToolingSupport[]
}

export interface CodeStandardExample {
  title: string
  description: string
  good: CodeExample
  bad: CodeExample
  explanation: string
}

export interface ToolingSupport {
  tool: string
  configuration: string
  purpose: string
}

// Pattern Library types
export interface DesignPattern {
  id: string
  name: string
  category: string
  intent: string
  motivation: string
  applicability: string[]
  structure: PatternStructure
  participants: PatternParticipant[]
  collaborations: string[]
  consequences: string[]
  implementation: PatternImplementation
  sampleCode: CodeExample[]
  knownUses: string[]
  relatedPatterns: string[]
  usageInTemplate: TemplateUsage[]
}

export interface PatternStructure {
  description: string
  diagram?: string // SVG or image path
  components: string[]
}

export interface PatternParticipant {
  name: string
  responsibilities: string[]
  collaborates: string[]
}

export interface PatternImplementation {
  overview: string
  stepByStep: string[]
  codeWalkthrough: CodeExample[]
  commonMistakes: string[]
  bestPractices: string[]
}

export interface TemplateUsage {
  location: string
  purpose: string
  example: CodeExample
  benefits: string[]
}

// Production Operations types
export interface OperationalGuide {
  id: string
  title: string
  category: 'deployment' | 'monitoring' | 'security' | 'performance' | 'maintenance'
  description: string
  audience: 'developer' | 'devops' | 'sysadmin' | 'all'
  sections: OperationalSection[]
  checklists: OperationalChecklist[]
  runbooks: Runbook[]
  metrics: OperationalMetric[]
  alerting: AlertingRule[]
}

export interface OperationalSection {
  id: string
  title: string
  content: string
  procedures: string[]
  codeExamples?: CodeExample[]
  configExamples?: ConfigurationChange[]
  warningNotes?: string[]
}

export interface OperationalChecklist {
  id: string
  title: string
  description: string
  category: string
  items: ChecklistItem[]
  automation?: string // Script or tool that can automate this
}

export interface ChecklistItem {
  id: string
  task: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  automated: boolean
  verificationMethod: string
  dependencies?: string[]
}

export interface Runbook {
  id: string
  title: string
  scenario: string
  symptoms: string[]
  diagnosis: DiagnosisStep[]
  resolution: ResolutionStep[]
  prevention: string[]
  escalation?: string[]
}

export interface DiagnosisStep {
  step: string
  command?: string
  expectedOutput?: string
  interpretation: string
}

export interface ResolutionStep {
  step: string
  action: string
  command?: string
  verification: string
  rollback?: string
}

export interface OperationalMetric {
  name: string
  description: string
  unit: string
  source: string
  thresholds: MetricThreshold[]
  alerting: boolean
  dashboardQuery: string
}

export interface MetricThreshold {
  level: 'info' | 'warning' | 'critical'
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: number
  duration: string // e.g., "5m", "1h"
}

export interface AlertingRule {
  name: string
  description: string
  condition: string
  severity: 'info' | 'warning' | 'critical'
  duration: string
  annotations: Record<string, string>
  runbook?: string
}

// Template Customization types
export interface TemplateVariant {
  id: string
  name: string
  description: string
  domain: string
  icon: string
  features: VariantFeature[]
  modifications: TemplateModification[]
  additionalDependencies: string[]
  configurationOverrides: ConfigurationChange[]
  deploymentConsiderations: string[]
  examples: ProjectExample[]
}

export interface VariantFeature {
  name: string
  description: string
  required: boolean
  category: string
  implementation: FeatureImplementation
}

export interface FeatureImplementation {
  entities: string[]
  services: string[]
  endpoints: string[]
  configurations: string[]
  migrations: string[]
  tests: string[]
}

export interface TemplateModification {
  type: 'add' | 'remove' | 'modify'
  target: string
  description: string
  impact: 'low' | 'medium' | 'high'
  reversible: boolean
  procedure: string[]
}

export interface ProjectExample {
  name: string
  description: string
  githubUrl?: string
  liveDemo?: string
  screenshots: string[]
  keyFeatures: string[]
  technicalHighlights: string[]
}

// Developer Experience Tools types
export interface DXTool {
  id: string
  name: string
  description: string
  category: 'generator' | 'analyzer' | 'validator' | 'profiler' | 'helper'
  purpose: string
  inputs: ToolInput[]
  outputs: ToolOutput[]
  configuration?: ToolConfiguration
  integration: ToolIntegration
  usage: ToolUsage[]
}

export interface ToolInput {
  name: string
  type: string
  description: string
  required: boolean
  defaultValue?: any
  validation?: string
  examples?: any[]
}

export interface ToolOutput {
  name: string
  type: string
  description: string
  format: 'json' | 'yaml' | 'code' | 'text' | 'file' | 'report'
  example?: any
}

export interface ToolConfiguration {
  configFile: string
  schema: any
  examples: ConfigExample[]
}

export interface ConfigExample {
  name: string
  description: string
  config: any
  useCase: string
}

export interface ToolIntegration {
  vscode?: VSCodeIntegration
  cli?: CLIIntegration
  web?: WebIntegration
  api?: APIIntegration
}

export interface VSCodeIntegration {
  extensionId?: string
  commands: string[]
  keybindings?: string[]
}

export interface CLIIntegration {
  command: string
  parameters: string[]
  examples: string[]
}

export interface WebIntegration {
  url: string
  authentication: boolean
  features: string[]
}

export interface APIIntegration {
  endpoint: string
  authentication: string
  documentation: string
}

export interface ToolUsage {
  scenario: string
  description: string
  steps: string[]
  example: CodeExample
  tips: string[]
}