import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { 
  GitBranch, 
  GitCommit,
  GitMerge,
  GitPullRequest,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  Target,
  Shield,
  Zap,
  ArrowRight,
  ArrowDown,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Settings,
  Code,
  FileText,
  Lock,
  Unlock,
  Tag,
  Upload,
  Download,
  RefreshCw,
  Workflow,
  BookOpen,
  Lightbulb,
  Activity,
  TrendingUp,
  GitFork,
  Hash,
  Calendar
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/docs/guides/git-workflow')({
  component: GitWorkflowPage,
})

interface GitBranch {
  id: string
  name: string
  type: 'main' | 'develop' | 'feature' | 'release' | 'hotfix'
  status: 'active' | 'merged' | 'stale' | 'protected'
  commits: GitCommit[]
  createdFrom: string
  pullRequest?: PullRequest
  protection?: BranchProtection
  color: string
}

interface GitCommit {
  id: string
  hash: string
  message: string
  author: string
  timestamp: Date
  type: CommitType
  breaking: boolean
  scope?: string
  description: string
  verified: boolean
}

interface CommitType {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  example: string
}

interface PullRequest {
  id: string
  number: number
  title: string
  description: string
  author: string
  status: 'draft' | 'open' | 'merged' | 'closed'
  checks: PullRequestCheck[]
  reviews: Review[]
  labels: string[]
  milestone?: string
  assignees: string[]
}

interface PullRequestCheck {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'failure'
  description: string
  duration?: number
  url?: string
}

interface Review {
  id: string
  author: string
  status: 'pending' | 'approved' | 'changes_requested' | 'commented'
  timestamp: Date
  comments?: ReviewComment[]
}

interface ReviewComment {
  id: string
  line: number
  file: string
  comment: string
  resolved: boolean
}

interface BranchProtection {
  requirePullRequest: boolean
  requireReviews: number
  requireStatusChecks: boolean
  requiredChecks: string[]
  enforceAdmins: boolean
  allowForcePush: boolean
  allowDeletion: boolean
}

interface Release {
  id: string
  version: string
  name: string
  description: string
  timestamp: Date
  prerelease: boolean
  draft: boolean
  assets: string[]
  commitCount: number
}

interface CommitMessageBuilder {
  type: string
  scope: string
  breaking: boolean
  description: string
  body: string
  footer: string
}

interface WorkflowStage {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'active' | 'completed' | 'error'
  duration: number
  steps: WorkflowStep[]
  automated: boolean
}

interface WorkflowStep {
  id: string
  name: string
  description: string
  command?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: string
  duration: number
}

function GitWorkflowPage() {
  // Handle module completion and progression
  useModuleCompletion('git-workflow')
  const [selectedBranch, setSelectedBranch] = React.useState<string>('main')
  const [selectedCommit, setSelectedCommit] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('overview')
  const [isSimulating, setIsSimulating] = React.useState(false)
  const [simulationProgress, setSimulationProgress] = React.useState(0)
  const [commitBuilder, setCommitBuilder] = React.useState<CommitMessageBuilder>({
    type: '',
    scope: '',
    breaking: false,
    description: '',
    body: '',
    footer: ''
  })
  const [showCommitBuilder, setShowCommitBuilder] = React.useState(false)
  const [interactiveMode, setInteractiveMode] = React.useState(true)
  const [currentWorkflow, setCurrentWorkflow] = React.useState<string>('github-flow')
  const [selectedPR, setSelectedPR] = React.useState<string | null>(null)

  // Commit types for semantic commits
  const commitTypes: CommitType[] = [
    {
      id: 'feat',
      name: 'feat',
      description: 'A new feature',
      emoji: '✨',
      color: 'bg-green-500',
      example: 'feat(auth): add OAuth2 login support'
    },
    {
      id: 'fix',
      name: 'fix',
      description: 'A bug fix',
      emoji: '🐛',
      color: 'bg-red-500',
      example: 'fix(api): resolve null reference in user service'
    },
    {
      id: 'docs',
      name: 'docs',
      description: 'Documentation only changes',
      emoji: '📝',
      color: 'bg-blue-500',
      example: 'docs: update API documentation for v2.0'
    },
    {
      id: 'style',
      name: 'style',
      description: 'Changes that do not affect the meaning of the code',
      emoji: '🎨',
      color: 'bg-purple-500',
      example: 'style: format code with prettier'
    },
    {
      id: 'refactor',
      name: 'refactor',
      description: 'A code change that neither fixes a bug nor adds a feature',
      emoji: '♻️',
      color: 'bg-orange-500',
      example: 'refactor(user): extract validation logic to separate class'
    },
    {
      id: 'test',
      name: 'test',
      description: 'Adding missing tests or correcting existing tests',
      emoji: '🧪',
      color: 'bg-yellow-500',
      example: 'test: add unit tests for payment service'
    },
    {
      id: 'chore',
      name: 'chore',
      description: 'Changes to the build process or auxiliary tools',
      emoji: '🔧',
      color: 'bg-gray-500',
      example: 'chore: update dependencies to latest versions'
    },
    {
      id: 'perf',
      name: 'perf',
      description: 'A code change that improves performance',
      emoji: '⚡',
      color: 'bg-indigo-500',
      example: 'perf(db): optimize user query with proper indexing'
    },
    {
      id: 'ci',
      name: 'ci',
      description: 'Changes to our CI configuration files and scripts',
      emoji: '👷',
      color: 'bg-teal-500',
      example: 'ci: add automated security scanning to pipeline'
    }
  ]

  // Git branches
  const gitBranches: GitBranch[] = [
    {
      id: 'main',
      name: 'main',
      type: 'main',
      status: 'protected',
      createdFrom: '',
      color: 'bg-green-500',
      protection: {
        requirePullRequest: true,
        requireReviews: 2,
        requireStatusChecks: true,
        requiredChecks: ['build', 'test', 'security-scan'],
        enforceAdmins: false,
        allowForcePush: false,
        allowDeletion: false
      },
      commits: [
        {
          id: '1',
          hash: 'a1b2c3d',
          message: 'feat(auth): implement JWT authentication system',
          author: 'Alice Johnson',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          type: commitTypes[0]!,
          breaking: false,
          description: 'Add complete JWT authentication with refresh tokens',
          verified: true
        },
        {
          id: '2',
          hash: 'e4f5g6h',
          message: 'fix(api): resolve CORS configuration issues',
          author: 'Bob Smith',
          timestamp: new Date('2024-01-14T15:45:00Z'),
          type: commitTypes[1]!,
          breaking: false,
          description: 'Fix CORS middleware configuration for production',
          verified: true
        }
      ]
    },
    {
      id: 'develop',
      name: 'develop',
      type: 'develop',
      status: 'active',
      createdFrom: 'main',
      color: 'bg-blue-500',
      commits: [
        {
          id: '3',
          hash: 'i7j8k9l',
          message: 'feat(user): add user profile management',
          author: 'Carol Davis',
          timestamp: new Date('2024-01-16T09:15:00Z'),
          type: commitTypes[0]!,
          breaking: false,
          description: 'Implement complete user profile CRUD operations',
          verified: true
        }
      ]
    },
    {
      id: 'feature/payment-integration',
      name: 'feature/payment-integration',
      type: 'feature',
      status: 'active',
      createdFrom: 'develop',
      color: 'bg-purple-500',
      pullRequest: {
        id: 'pr-1',
        number: 42,
        title: 'feat: integrate Stripe payment processing',
        description: 'This PR adds comprehensive payment processing capabilities using Stripe API.\n\n## Changes\n- Payment service implementation\n- Webhook handling for payment events\n- Unit tests with 95% coverage\n- Documentation updates\n\n## Testing\n- [x] Unit tests pass\n- [x] Integration tests pass\n- [x] Manual testing completed\n- [x] Security review completed',
        author: 'David Wilson',
        status: 'open',
        labels: ['enhancement', 'payment', 'high-priority'],
        assignees: ['David Wilson', 'Alice Johnson'],
        checks: [
          { id: 'build', name: 'Build', status: 'success', description: 'All builds completed successfully', duration: 120 },
          { id: 'test', name: 'Tests', status: 'success', description: '156 tests passed, 0 failed', duration: 45 },
          { id: 'security', name: 'Security Scan', status: 'success', description: 'No security vulnerabilities found', duration: 30 },
          { id: 'code-quality', name: 'Code Quality', status: 'pending', description: 'SonarCloud analysis in progress' }
        ],
        reviews: [
          {
            id: 'review-1',
            author: 'Alice Johnson',
            status: 'approved',
            timestamp: new Date('2024-01-16T14:30:00Z')
          },
          {
            id: 'review-2',
            author: 'Tech Lead',
            status: 'changes_requested',
            timestamp: new Date('2024-01-16T16:45:00Z'),
            comments: [
              {
                id: 'comment-1',
                line: 45,
                file: 'PaymentService.cs',
                comment: 'Please add error handling for network timeouts',
                resolved: false
              }
            ]
          }
        ]
      },
      commits: [
        {
          id: '4',
          hash: 'm0n1o2p',
          message: 'feat(payment): implement Stripe payment service',
          author: 'David Wilson',
          timestamp: new Date('2024-01-16T11:00:00Z'),
          type: commitTypes[0]!,
          breaking: false,
          description: 'Add Stripe payment processing with webhook support',
          verified: true
        }
      ]
    },
    {
      id: 'hotfix/security-patch',
      name: 'hotfix/security-patch',
      type: 'hotfix',
      status: 'active',
      createdFrom: 'main',
      color: 'bg-red-500',
      commits: [
        {
          id: '5',
          hash: 'q3r4s5t',
          message: 'fix(security): patch SQL injection vulnerability',
          author: 'Security Team',
          timestamp: new Date('2024-01-16T13:20:00Z'),
          type: commitTypes[1]!,
          breaking: false,
          description: 'Fix SQL injection in user search endpoint',
          verified: true
        }
      ]
    }
  ]

  // Workflow stages
  const workflowStages: WorkflowStage[] = [
    {
      id: 'development',
      name: 'Development',
      description: 'Feature development and local testing',
      icon: Code,
      status: 'completed',
      duration: 1440, // 1 day
      automated: false,
      steps: [
        { id: 'branch', name: 'Create Feature Branch', description: 'git checkout -b feature/new-feature', status: 'completed', duration: 5 },
        { id: 'code', name: 'Write Code', description: 'Implement feature with tests', status: 'completed', duration: 480 },
        { id: 'test', name: 'Local Testing', description: 'Run tests and verify functionality', status: 'completed', duration: 30 }
      ]
    },
    {
      id: 'pull-request',
      name: 'Pull Request',
      description: 'Code review and collaboration',
      icon: GitPullRequest,
      status: 'active',
      duration: 120,
      automated: false,
      steps: [
        { id: 'create-pr', name: 'Create PR', description: 'Submit pull request with detailed description', status: 'completed', duration: 15 },
        { id: 'peer-review', name: 'Peer Review', description: 'Team members review code changes', status: 'running', duration: 60 },
        { id: 'address-feedback', name: 'Address Feedback', description: 'Make requested changes', status: 'pending', duration: 45 }
      ]
    },
    {
      id: 'ci-pipeline',
      name: 'CI Pipeline',
      description: 'Automated testing and quality checks',
      icon: Workflow,
      status: 'pending',
      duration: 180,
      automated: true,
      steps: [
        { id: 'build', name: 'Build', description: 'Compile application and dependencies', status: 'pending', duration: 60 },
        { id: 'unit-tests', name: 'Unit Tests', description: 'Run comprehensive unit test suite', status: 'pending', duration: 45 },
        { id: 'integration-tests', name: 'Integration Tests', description: 'Test API endpoints and database', status: 'pending', duration: 30 },
        { id: 'security-scan', name: 'Security Scan', description: 'Scan for vulnerabilities', status: 'pending', duration: 25 },
        { id: 'code-quality', name: 'Code Quality', description: 'Static analysis and coverage check', status: 'pending', duration: 20 }
      ]
    },
    {
      id: 'deployment',
      name: 'Deployment',
      description: 'Deploy to staging and production',
      icon: Upload,
      status: 'pending',
      duration: 300,
      automated: true,
      steps: [
        { id: 'merge', name: 'Merge to Main', description: 'Merge approved PR to main branch', status: 'pending', duration: 5 },
        { id: 'deploy-staging', name: 'Deploy to Staging', description: 'Automated deployment to staging environment', status: 'pending', duration: 120 },
        { id: 'smoke-tests', name: 'Smoke Tests', description: 'Run critical path tests', status: 'pending', duration: 30 },
        { id: 'deploy-prod', name: 'Deploy to Production', description: 'Deploy to production with rollback capability', status: 'pending', duration: 145 }
      ]
    }
  ]

  // Release management
  const releases: Release[] = [
    {
      id: 'v2.1.0',
      version: '2.1.0',
      name: 'Enhanced Authentication',
      description: '## What\'s New\n\n- JWT authentication with refresh tokens\n- OAuth2 integration (Google, GitHub)\n- Enhanced security middleware\n- Improved error handling\n\n## Bug Fixes\n\n- Fixed CORS configuration issues\n- Resolved memory leaks in background services\n- Updated dependencies to latest stable versions',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      prerelease: false,
      draft: false,
      assets: ['modernapi-v2.1.0.zip', 'modernapi-v2.1.0.tar.gz'],
      commitCount: 47
    },
    {
      id: 'v2.2.0-rc1',
      version: '2.2.0-rc1',
      name: 'Payment Integration RC',
      description: '## Release Candidate Features\n\n- Stripe payment integration\n- Webhook handling\n- Payment history tracking\n- Subscription management\n\n⚠️ **This is a release candidate - not recommended for production use**',
      timestamp: new Date('2024-01-16T16:00:00Z'),
      prerelease: true,
      draft: false,
      assets: ['modernapi-v2.2.0-rc1.zip'],
      commitCount: 23
    }
  ]

  // Generate semantic commit message
  const generateCommitMessage = (builder: CommitMessageBuilder): string => {
    let message = builder.type
    
    if (builder.scope) {
      message += `(${builder.scope})`
    }
    
    if (builder.breaking) {
      message += '!'
    }
    
    message += `: ${builder.description}`
    
    if (builder.body) {
      message += `\n\n${builder.body}`
    }
    
    if (builder.footer) {
      message += `\n\n${builder.footer}`
    }
    
    return message
  }

  // Validate commit message
  const validateCommitMessage = (builder: CommitMessageBuilder): string[] => {
    const errors = []
    
    if (!builder.type) {
      errors.push('Commit type is required')
    }
    
    if (!builder.description) {
      errors.push('Description is required')
    } else if (builder.description.length > 72) {
      errors.push('Description should be 72 characters or less')
    } else if (builder.description.charAt(0) === builder.description.charAt(0).toUpperCase()) {
      errors.push('Description should start with lowercase letter')
    } else if (builder.description.endsWith('.')) {
      errors.push('Description should not end with a period')
    }
    
    if (builder.body && builder.body.length > 0) {
      const lines = builder.body.split('\n')
      if (lines.some(line => line.length > 72)) {
        errors.push('Body lines should be 72 characters or less')
      }
    }
    
    return errors
  }

  // Simulate workflow execution
  const simulateWorkflow = async () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    
    let totalSteps = workflowStages.reduce((acc, stage) => acc + stage.steps.length, 0)
    let completedSteps = 0
    
    for (const stage of workflowStages) {
      stage.status = 'active'
      
      for (const step of stage.steps) {
        step.status = 'running'
        
        // Simulate step duration
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Randomly fail some steps for demonstration
        if (Math.random() > 0.9 && step.id !== 'merge') {
          step.status = 'error'
          step.output = 'Step failed - please check configuration'
          stage.status = 'error'
          break
        } else {
          step.status = 'completed'
          step.output = generateStepOutput(step.id)
        }
        
        completedSteps++
        setSimulationProgress((completedSteps / totalSteps) * 100)
      }
      
      if (stage.status !== 'error') {
        stage.status = 'completed'
      }
    }
    
    setIsSimulating(false)
  }

  const generateStepOutput = (stepId: string): string => {
    const outputs: Record<string, string> = {
      'branch': '✓ Switched to new branch \'feature/new-feature\'',
      'code': '✓ Feature implementation completed with tests',
      'test': '✓ All 23 tests passed',
      'create-pr': '✓ Pull request #43 created successfully',
      'peer-review': '✓ Code review completed - 2 approvals received',
      'build': '✓ Build completed successfully in 1m 45s',
      'unit-tests': '✓ 156 tests passed, 0 failed',
      'integration-tests': '✓ All integration tests passed',
      'security-scan': '✓ No security vulnerabilities found',
      'code-quality': '✓ Code quality gate passed - 95% coverage',
      'merge': '✓ Merged PR #43 into main branch',
      'deploy-staging': '✓ Deployed v2.2.0 to staging environment',
      'smoke-tests': '✓ All smoke tests passed',
      'deploy-prod': '✓ Successfully deployed to production'
    }
    
    return outputs[stepId] || '✓ Step completed successfully'
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setSimulationProgress(0)
    workflowStages.forEach(stage => {
      stage.status = stage.id === 'development' ? 'completed' : stage.id === 'pull-request' ? 'active' : 'pending'
      stage.steps.forEach(step => {
        if (stage.id === 'development') {
          step.status = 'completed'
        } else if (stage.id === 'pull-request') {
          step.status = step.id === 'create-pr' ? 'completed' : step.id === 'peer-review' ? 'running' : 'pending'
        } else {
          step.status = 'pending'
        }
        step.output = undefined
      })
    })
  }

  const getSelectedBranch = () => gitBranches.find(b => b.id === selectedBranch)
  const getSelectedPR = () => {
    for (const branch of gitBranches) {
      if (branch.pullRequest?.id === selectedPR) {
        return branch.pullRequest
      }
    }
    return null
  }

  const commitValidationErrors = validateCommitMessage(commitBuilder)
  const isCommitValid = commitValidationErrors.length === 0
  const generatedCommit = generateCommitMessage(commitBuilder)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Git Workflow Mastery</h1>
            <p className="text-muted-foreground">
              Master professional Git workflows, semantic commits, and collaborative development practices
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary">
            <GitBranch className="w-3 h-3 mr-1" />
            Git Flow + GitHub Flow
          </Badge>
          <Badge variant="secondary">
            <GitCommit className="w-3 h-3 mr-1" />
            Semantic Commits
          </Badge>
          <Badge variant="secondary">
            <GitPullRequest className="w-3 h-3 mr-1" />
            Pull Request Process
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Branch Protection
          </Badge>
          <Badge variant="secondary">
            <Tag className="w-3 h-3 mr-1" />
            Release Management
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
          
          <Select value={currentWorkflow} onValueChange={setCurrentWorkflow}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="github-flow">GitHub Flow</SelectItem>
              <SelectItem value="git-flow">Git Flow</SelectItem>
              <SelectItem value="gitlab-flow">GitLab Flow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="branching">Branching Strategy</TabsTrigger>
          <TabsTrigger value="commits">Semantic Commits</TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
          <TabsTrigger value="protection">Branch Protection</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Workflow Simulation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Interactive Git Workflow Simulation
                  </CardTitle>
                  <CardDescription>
                    Experience the complete development workflow from feature creation to production deployment
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={simulateWorkflow}
                    disabled={isSimulating}
                    className="flex items-center gap-2"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Workflow
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetSimulation}
                    disabled={isSimulating}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              {isSimulating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Workflow Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(simulationProgress)}%</span>
                  </div>
                  <Progress value={simulationProgress} className="h-2" />
                </div>
              )}

              {/* Workflow Stages */}
              <div className="space-y-4">
                {workflowStages.map((stage, index) => (
                  <div key={stage.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          stage.status === 'completed' && 'bg-green-500 text-white',
                          stage.status === 'active' && 'bg-blue-500 text-white animate-pulse',
                          stage.status === 'pending' && 'bg-muted text-muted-foreground',
                          stage.status === 'error' && 'bg-red-500 text-white'
                        )}>
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : stage.status === 'active' ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : stage.status === 'error' ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <stage.icon className="w-4 h-4" />
                            {stage.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {stage.automated && (
                          <Badge variant="outline" className="gap-1">
                            <Zap className="w-3 h-3" />
                            Automated
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {Math.floor(stage.duration / 60)}m {stage.duration % 60}s
                        </Badge>
                      </div>
                    </div>

                    {/* Stage Steps */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stage.steps.map((step) => (
                        <div 
                          key={step.id} 
                          className={cn(
                            'p-3 border rounded-lg transition-colors',
                            step.status === 'completed' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10',
                            step.status === 'running' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 animate-pulse',
                            step.status === 'error' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center',
                                step.status === 'completed' && 'bg-green-500 text-white',
                                step.status === 'running' && 'bg-blue-500 text-white',
                                step.status === 'pending' && 'bg-muted text-muted-foreground',
                                step.status === 'error' && 'bg-red-500 text-white'
                              )}>
                                {step.status === 'completed' ? (
                                  <CheckCircle className="w-2 h-2" />
                                ) : step.status === 'running' ? (
                                  <RefreshCw className="w-2 h-2 animate-spin" />
                                ) : step.status === 'error' ? (
                                  <XCircle className="w-2 h-2" />
                                ) : (
                                  <div className="w-1 h-1 rounded-full bg-current" />
                                )}
                              </div>
                              <h4 className="font-medium text-sm">{step.name}</h4>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{step.description}</p>
                          {step.command && (
                            <code className="text-xs bg-muted px-1 rounded">{step.command}</code>
                          )}
                          {step.output && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{step.output}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Branches</p>
                    <p className="text-2xl font-bold">{gitBranches.filter(b => b.status === 'active').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <GitPullRequest className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Open PRs</p>
                    <p className="text-2xl font-bold">
                      {gitBranches.filter(b => b.pullRequest?.status === 'open').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <GitCommit className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Commits</p>
                    <p className="text-2xl font-bold">
                      {gitBranches.reduce((acc, b) => acc + b.commits.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Releases</p>
                    <p className="text-2xl font-bold">{releases.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branching" className="space-y-6">
          {/* Git Branching Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitFork className="w-5 h-5" />
                Interactive Git Branch Visualization
              </CardTitle>
              <CardDescription>
                Explore different branching strategies and their relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Branch Strategy Selection */}
                <div className="flex gap-4 flex-wrap">
                  {['GitHub Flow', 'Git Flow', 'GitLab Flow'].map((strategy) => (
                    <Badge 
                      key={strategy}
                      variant={currentWorkflow.includes(strategy.toLowerCase().replace(' ', '-')) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setCurrentWorkflow(strategy.toLowerCase().replace(' ', '-'))}
                    >
                      {strategy}
                    </Badge>
                  ))}
                </div>

                {/* Branch List */}
                <div className="space-y-3">
                  {gitBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className={cn(
                        'p-4 border rounded-lg cursor-pointer transition-all',
                        selectedBranch === branch.id && 'ring-2 ring-primary border-primary bg-primary/5'
                      )}
                      onClick={() => setSelectedBranch(branch.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', branch.color)}>
                            <GitBranch className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{branch.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {branch.createdFrom ? `Created from ${branch.createdFrom}` : 'Main branch'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            branch.status === 'protected' ? 'default' :
                            branch.status === 'active' ? 'secondary' :
                            branch.status === 'merged' ? 'outline' : 'destructive'
                          }>
                            {branch.status === 'protected' && <Shield className="w-3 h-3 mr-1" />}
                            {branch.status}
                          </Badge>
                          <Badge variant="outline">
                            {branch.commits.length} commits
                          </Badge>
                        </div>
                      </div>

                      {branch.pullRequest && (
                        <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GitPullRequest className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                PR #{branch.pullRequest.number}: {branch.pullRequest.title}
                              </span>
                            </div>
                            <Badge variant={
                              branch.pullRequest.status === 'open' ? 'secondary' :
                              branch.pullRequest.status === 'merged' ? 'default' : 'outline'
                            }>
                              {branch.pullRequest.status}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Branch Protection Rules */}
                      {branch.protection && selectedBranch === branch.id && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Branch Protection Rules
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Require PR:</span>
                              <Badge variant={branch.protection.requirePullRequest ? 'default' : 'outline'}>
                                {branch.protection.requirePullRequest ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Required Reviews:</span>
                              <Badge variant="secondary">{branch.protection.requireReviews}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Status Checks:</span>
                              <Badge variant={branch.protection.requireStatusChecks ? 'default' : 'outline'}>
                                {branch.protection.requireStatusChecks ? 'Required' : 'Optional'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Force Push:</span>
                              <Badge variant={branch.protection.allowForcePush ? 'destructive' : 'default'}>
                                {branch.protection.allowForcePush ? 'Allowed' : 'Blocked'}
                              </Badge>
                            </div>
                          </div>
                          
                          {branch.protection.requiredChecks.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium">Required Status Checks:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {branch.protection.requiredChecks.map((check) => (
                                  <Badge key={check} variant="outline" className="text-xs">
                                    {check}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recent Commits */}
                      {selectedBranch === branch.id && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <GitCommit className="w-4 h-4" />
                            Recent Commits
                          </h4>
                          <div className="space-y-2">
                            {branch.commits.slice(0, 3).map((commit) => (
                              <div key={commit.id} className="flex items-center gap-3 p-2 bg-muted/10 rounded">
                                <div className={cn('w-6 h-6 rounded flex items-center justify-center text-xs text-white', commit.type.color)}>
                                  {commit.type.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{commit.message}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {commit.author} • {commit.hash} • {commit.timestamp.toLocaleDateString()}
                                    {commit.verified && <CheckCircle className="w-3 h-3 inline ml-1 text-green-500" />}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Branching Strategy Comparison
              </CardTitle>
              <CardDescription>
                Compare different Git workflow approaches for your project needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'GitHub Flow',
                    description: 'Simple, lightweight workflow perfect for continuous deployment',
                    branches: ['main', 'feature branches'],
                    pros: ['Simple to understand', 'Fast deployment', 'Continuous integration'],
                    cons: ['Less control over releases', 'Not ideal for scheduled releases'],
                    bestFor: 'Web applications, SaaS, mobile apps'
                  },
                  {
                    name: 'Git Flow',
                    description: 'Robust workflow with dedicated branches for different purposes',
                    branches: ['main', 'develop', 'feature', 'release', 'hotfix'],
                    pros: ['Organized release management', 'Clear branch purposes', 'Stable main branch'],
                    cons: ['More complex', 'Slower iteration', 'Higher merge overhead'],
                    bestFor: 'Desktop software, scheduled releases, large teams'
                  },
                  {
                    name: 'GitLab Flow',
                    description: 'Combines GitHub Flow simplicity with environment branches',
                    branches: ['main', 'feature', 'environment branches'],
                    pros: ['Environment-specific deployments', 'Clear promotion path', 'Issue integration'],
                    cons: ['Environment branch management', 'Requires discipline'],
                    bestFor: 'Enterprise applications, multi-environment deployments'
                  }
                ].map((workflow) => (
                  <Card key={workflow.name}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Pros</h4>
                          <ul className="text-xs space-y-1 mt-1">
                            {workflow.pros.map((pro, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Cons</h4>
                          <ul className="text-xs space-y-1 mt-1">
                            {workflow.cons.map((con, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium">Best For</h4>
                          <p className="text-xs text-muted-foreground mt-1">{workflow.bestFor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commits" className="space-y-6">
          {/* Semantic Commit Builder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitCommit className="w-5 h-5" />
                    Interactive Semantic Commit Builder
                  </CardTitle>
                  <CardDescription>
                    Build well-structured commit messages following conventional commit standards
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowCommitBuilder(!showCommitBuilder)}
                >
                  {showCommitBuilder ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCommitBuilder && (
                <div className="space-y-6">
                  {/* Commit Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Type *</label>
                        <Select value={commitBuilder.type} onValueChange={(value) => 
                          setCommitBuilder(prev => ({ ...prev, type: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select commit type" />
                          </SelectTrigger>
                          <SelectContent>
                            {commitTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  <span>{type.emoji}</span>
                                  <span className="font-medium">{type.name}</span>
                                  <span className="text-muted-foreground">- {type.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Scope (optional)</label>
                        <Input
                          placeholder="auth, api, user, etc."
                          value={commitBuilder.scope}
                          onChange={(e) => setCommitBuilder(prev => ({ ...prev, scope: e.target.value }))}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="breaking-change"
                          checked={commitBuilder.breaking}
                          onCheckedChange={(checked) => 
                            setCommitBuilder(prev => ({ ...prev, breaking: checked }))
                          }
                        />
                        <label htmlFor="breaking-change" className="text-sm">
                          Breaking Change
                        </label>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description *</label>
                        <Input
                          placeholder="add user authentication system"
                          value={commitBuilder.description}
                          onChange={(e) => setCommitBuilder(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Body (optional)</label>
                        <Textarea
                          placeholder="Detailed explanation of changes..."
                          value={commitBuilder.body}
                          onChange={(e) => setCommitBuilder(prev => ({ ...prev, body: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Footer (optional)</label>
                        <Textarea
                          placeholder="BREAKING CHANGE: authentication now required for all endpoints"
                          value={commitBuilder.footer}
                          onChange={(e) => setCommitBuilder(prev => ({ ...prev, footer: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Generated Commit Message */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Generated Commit Message</label>
                        <div className="mt-2 p-4 bg-muted/20 rounded-lg border">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {generatedCommit || 'Complete the form to generate commit message...'}
                          </pre>
                        </div>
                        {generatedCommit && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => navigator.clipboard.writeText(generatedCommit)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Message
                          </Button>
                        )}
                      </div>

                      {/* Validation Errors */}
                      {commitValidationErrors.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Validation Errors</AlertTitle>
                          <AlertDescription>
                            <ul className="space-y-1 mt-2">
                              {commitValidationErrors.map((error, index) => (
                                <li key={index} className="text-sm">• {error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Success Message */}
                      {isCommitValid && generatedCommit && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Valid Commit Message</AlertTitle>
                          <AlertDescription>
                            Your commit message follows conventional commit standards!
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Commit Types Reference */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Semantic Commit Types Reference</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {commitTypes.map((type) => (
                    <div
                      key={type.id}
                      className={cn(
                        'p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/10',
                        commitBuilder.type === type.id && 'ring-2 ring-primary border-primary'
                      )}
                      onClick={() => setCommitBuilder(prev => ({ ...prev, type: type.id }))}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{type.emoji}</span>
                        <code className="font-semibold">{type.name}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                      <code className="text-xs bg-muted px-1 rounded">{type.example}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commit Best Practices */}
              <div className="mt-6 p-4 bg-muted/10 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Commit Message Best Practices
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-green-600 dark:text-green-400 mb-1">✓ Do</h5>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use imperative mood ("add" not "added")</li>
                      <li>• Keep first line under 72 characters</li>
                      <li>• Start description with lowercase</li>
                      <li>• Don't end description with period</li>
                      <li>• Use body to explain "what" and "why"</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-600 dark:text-red-400 mb-1">✗ Don't</h5>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use vague messages like "fix bug"</li>
                      <li>• Include multiple unrelated changes</li>
                      <li>• Use past tense ("fixed", "added")</li>
                      <li>• Forget to specify breaking changes</li>
                      <li>• Skip the commit type/scope</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pull-requests" className="space-y-6">
          {/* Pull Request Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" />
                Pull Request Workflow
              </CardTitle>
              <CardDescription>
                Complete pull request process from creation to merge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* PR List */}
              <div className="space-y-4">
                {gitBranches
                  .filter(branch => branch.pullRequest)
                  .map((branch) => {
                    const pr = branch.pullRequest!
                    return (
                      <div
                        key={pr.id}
                        className={cn(
                          'p-4 border rounded-lg cursor-pointer transition-all',
                          selectedPR === pr.id && 'ring-2 ring-primary border-primary'
                        )}
                        onClick={() => setSelectedPR(selectedPR === pr.id ? null : pr.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <GitPullRequest className="w-5 h-5 mt-0.5 text-blue-500" />
                            <div>
                              <h3 className="font-semibold">
                                #{pr.number}: {pr.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {pr.author} wants to merge {branch.name} into main
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              pr.status === 'open' ? 'secondary' :
                              pr.status === 'merged' ? 'default' :
                              pr.status === 'draft' ? 'outline' : 'destructive'
                            }>
                              {pr.status}
                            </Badge>
                            {pr.assignees.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <Users className="w-3 h-3" />
                                {pr.assignees.length}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* PR Labels */}
                        {pr.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {pr.labels.map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Status Checks */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                          {pr.checks.map((check) => (
                            <div
                              key={check.id}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded text-xs',
                                check.status === 'success' && 'bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400',
                                check.status === 'failure' && 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400',
                                check.status === 'running' && 'bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400',
                                check.status === 'pending' && 'bg-gray-50 text-gray-700 dark:bg-gray-900/10 dark:text-gray-400'
                              )}
                            >
                              {check.status === 'success' && <CheckCircle className="w-3 h-3" />}
                              {check.status === 'failure' && <XCircle className="w-3 h-3" />}
                              {check.status === 'running' && <RefreshCw className="w-3 h-3 animate-spin" />}
                              {check.status === 'pending' && <Clock className="w-3 h-3" />}
                              <span className="font-medium">{check.name}</span>
                            </div>
                          ))}
                        </div>

                        {/* Reviews */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Reviews:</span>
                            {pr.reviews.map((review) => (
                              <Badge 
                                key={review.id}
                                variant={
                                  review.status === 'approved' ? 'default' :
                                  review.status === 'changes_requested' ? 'destructive' : 'outline'
                                }
                                className="text-xs"
                              >
                                {review.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {review.status === 'changes_requested' && <XCircle className="w-3 h-3 mr-1" />}
                                {review.author}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* PR Details */}
                        {selectedPR === pr.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <div className="bg-muted/20 p-3 rounded text-sm whitespace-pre-line">
                                {pr.description}
                              </div>
                            </div>

                            {/* Review Comments */}
                            {pr.reviews.some(r => r.comments && r.comments.length > 0) && (
                              <div>
                                <h4 className="font-medium mb-2">Review Comments</h4>
                                <div className="space-y-2">
                                  {pr.reviews
                                    .filter(r => r.comments && r.comments.length > 0)
                                    .map((review) => 
                                      review.comments?.map((comment) => (
                                        <div key={comment.id} className="p-3 border rounded">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{review.author}</span>
                                            <div className="flex items-center gap-2">
                                              <code className="text-xs bg-muted px-1 rounded">
                                                {comment.file}:{comment.line}
                                              </code>
                                              {comment.resolved && (
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-sm">{comment.comment}</p>
                                        </div>
                                      ))
                                    )}
                                </div>
                              </div>
                            )}

                            {/* Merge Actions */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="text-sm text-muted-foreground">
                                All checks passed • 2 approvals • No conflicts
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" disabled>
                                  <GitMerge className="w-4 h-4 mr-1" />
                                  Merge PR
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* PR Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Pull Request Best Practices
              </CardTitle>
              <CardDescription>
                Guidelines for creating effective pull requests that get merged faster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">✓ Best Practices</h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Clear, Descriptive Title",
                        description: "Use conventional commit format in PR title"
                      },
                      {
                        title: "Detailed Description",
                        description: "Explain what, why, and how. Include testing steps"
                      },
                      {
                        title: "Small, Focused Changes",
                        description: "Keep PRs under 400 lines of code when possible"
                      },
                      {
                        title: "Self-Review First",
                        description: "Review your own code before requesting others"
                      },
                      {
                        title: "Update Documentation",
                        description: "Include docs changes for new features"
                      },
                      {
                        title: "Add Appropriate Labels",
                        description: "Help reviewers understand the PR context"
                      }
                    ].map((practice) => (
                      <div key={practice.title} className="flex gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{practice.title}</p>
                          <p className="text-xs text-muted-foreground">{practice.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">✗ Common Mistakes</h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Vague Titles",
                        description: "Avoid titles like \"Fix bug\" or \"Update code\""
                      },
                      {
                        title: "No Description",
                        description: "Empty or minimal PR descriptions"
                      },
                      {
                        title: "Too Large",
                        description: "PRs with hundreds of files or thousands of lines"
                      },
                      {
                        title: "Mixed Concerns",
                        description: "Combining unrelated changes in one PR"
                      },
                      {
                        title: "No Tests",
                        description: "Missing test coverage for new features"
                      },
                      {
                        title: "Force Pushing",
                        description: "Force pushing after reviews have started"
                      }
                    ].map((mistake) => (
                      <div key={mistake.title} className="flex gap-3">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{mistake.title}</p>
                          <p className="text-xs text-muted-foreground">{mistake.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* PR Template */}
              <div>
                <h3 className="font-semibold mb-3">Recommended PR Template</h3>
                <div className="bg-muted/20 p-4 rounded-lg text-sm font-mono">
                  <pre>{`## Summary
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)  
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List specific changes
- Include file/component names
- Mention any config changes

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

## Screenshots/Videos
Include if UI changes are involved.

## Additional Notes
Any additional context, considerations, or follow-up tasks.`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection" className="space-y-6">
          {/* Branch Protection Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Branch Protection Configuration
              </CardTitle>
              <CardDescription>
                Configure branch protection rules for enterprise-grade security and quality control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Main Branch Protection */}
                {getSelectedBranch()?.protection && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {getSelectedBranch()!.name} Branch Protection
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Require pull request reviews</p>
                            <p className="text-xs text-muted-foreground">All commits must be made via PRs</p>
                          </div>
                          <Badge variant={getSelectedBranch()!.protection!.requirePullRequest ? 'default' : 'outline'}>
                            {getSelectedBranch()!.protection!.requirePullRequest ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Required approving reviews</p>
                            <p className="text-xs text-muted-foreground">Minimum number of approvals required</p>
                          </div>
                          <Badge variant="secondary">
                            {getSelectedBranch()!.protection!.requireReviews} required
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Require status checks</p>
                            <p className="text-xs text-muted-foreground">All status checks must pass</p>
                          </div>
                          <Badge variant={getSelectedBranch()!.protection!.requireStatusChecks ? 'default' : 'outline'}>
                            {getSelectedBranch()!.protection!.requireStatusChecks ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Restrict pushes</p>
                            <p className="text-xs text-muted-foreground">Only specific users can push</p>
                          </div>
                          <Badge variant="default">
                            Enabled
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Enforce for administrators</p>
                            <p className="text-xs text-muted-foreground">Include administrators in restrictions</p>
                          </div>
                          <Badge variant={getSelectedBranch()!.protection!.enforceAdmins ? 'default' : 'outline'}>
                            {getSelectedBranch()!.protection!.enforceAdmins ? 'Enforced' : 'Exempt'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Allow force pushes</p>
                            <p className="text-xs text-muted-foreground">Permit force pushes to branch</p>
                          </div>
                          <Badge variant={getSelectedBranch()!.protection!.allowForcePush ? 'destructive' : 'default'}>
                            {getSelectedBranch()!.protection!.allowForcePush ? 'Allowed' : 'Blocked'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium text-sm">Allow deletions</p>
                            <p className="text-xs text-muted-foreground">Allow branch to be deleted</p>
                          </div>
                          <Badge variant={getSelectedBranch()!.protection!.allowDeletion ? 'destructive' : 'default'}>
                            {getSelectedBranch()!.protection!.allowDeletion ? 'Allowed' : 'Blocked'}
                          </Badge>
                        </div>

                        <div className="p-3 bg-muted/20 rounded">
                          <p className="font-medium text-sm mb-2">Required status checks</p>
                          <div className="flex flex-wrap gap-1">
                            {getSelectedBranch()!.protection!.requiredChecks.map((check) => (
                              <Badge key={check} variant="outline" className="text-xs">
                                {check}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 text-green-600 dark:text-green-400">
                        ✓ Security Best Practices
                      </h3>
                      <div className="space-y-3">
                        {[
                          'Require signed commits for verification',
                          'Enable automatic security updates',
                          'Require 2FA for all contributors',
                          'Use secret scanning and alerts',
                          'Enable dependency vulnerability scanning',
                          'Configure automated security updates'
                        ].map((practice, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{practice}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 text-blue-600 dark:text-blue-400">
                        🔧 Quality Gates
                      </h3>
                      <div className="space-y-3">
                        {[
                          'All automated tests must pass',
                          'Code coverage above 80% threshold',
                          'No high-severity security vulnerabilities',
                          'Code quality metrics meet standards',
                          'Documentation updated for new features',
                          'Performance benchmarks maintained'
                        ].map((gate, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{gate}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CI/CD Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                CI/CD Integration with Branch Protection
              </CardTitle>
              <CardDescription>
                How branch protection works with continuous integration and deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status Check Flow */}
                <div className="p-4 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-3">Status Check Flow</h4>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[
                      { name: 'PR Created', status: 'completed' },
                      { name: 'Build Triggered', status: 'completed' },
                      { name: 'Tests Running', status: 'active' },
                      { name: 'Security Scan', status: 'pending' },
                      { name: 'Code Quality', status: 'pending' },
                      { name: 'Ready to Merge', status: 'pending' }
                    ].map((step, index) => (
                      <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center gap-1 min-w-0">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs',
                            step.status === 'completed' && 'bg-green-500',
                            step.status === 'active' && 'bg-blue-500 animate-pulse',
                            step.status === 'pending' && 'bg-muted-foreground'
                          )}>
                            {index + 1}
                          </div>
                          <span className="text-xs text-center whitespace-nowrap">{step.name}</span>
                        </div>
                        {index < 5 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Example GitHub Actions Integration */}
                <div>
                  <h4 className="font-medium mb-2">Example GitHub Actions Configuration</h4>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`name: Branch Protection Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        
  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: dotnet test --collect:"XPlat Code Coverage"
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # This job will only succeed if all other jobs pass
  protection-check:
    name: Protection Check
    needs: [security, quality, test]
    runs-on: ubuntu-latest
    steps:
      - name: All checks passed
        run: echo "✅ All protection checks passed!"
        
# Branch protection settings in GitHub:
# - Require status checks to pass: ✓
# - Required checks: security, quality, test, protection-check
# - Require pull request reviews: ✓ (2 required)
# - Dismiss stale reviews: ✓
# - Require review from code owners: ✓`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="releases" className="space-y-6">
          {/* Release Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Release Management & Versioning
              </CardTitle>
              <CardDescription>
                Automated release creation with semantic versioning and changelog generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Releases List */}
                <div className="space-y-4">
                  {releases.map((release) => (
                    <div key={release.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            release.prerelease ? 'bg-yellow-500' : 'bg-green-500'
                          )}>
                            <Tag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {release.name}
                              <code className="text-sm bg-muted px-2 py-1 rounded">{release.version}</code>
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {release.timestamp.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitCommit className="w-3 h-3" />
                                {release.commitCount} commits
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {release.prerelease && (
                            <Badge variant="secondary">Pre-release</Badge>
                          )}
                          {release.draft && (
                            <Badge variant="outline">Draft</Badge>
                          )}
                          <Badge variant="default">Published</Badge>
                        </div>
                      </div>

                      {/* Release Description */}
                      <div className="bg-muted/20 p-3 rounded text-sm whitespace-pre-line mb-3">
                        {release.description}
                      </div>

                      {/* Assets */}
                      {release.assets.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Assets</h4>
                          <div className="flex flex-wrap gap-1">
                            {release.assets.map((asset) => (
                              <Badge key={asset} variant="outline" className="text-xs gap-1">
                                <Download className="w-3 h-3" />
                                {asset}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Versioning Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Semantic Versioning (SemVer)
              </CardTitle>
              <CardDescription>
                Understanding version numbers and automated version management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* SemVer Explanation */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-500 mb-2">MAJOR</div>
                    <p className="text-sm font-medium mb-1">Breaking Changes</p>
                    <p className="text-xs text-muted-foreground">
                      Incompatible API changes that require user action
                    </p>
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-xs">
                        1.0.0 → 2.0.0
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-500 mb-2">MINOR</div>
                    <p className="text-sm font-medium mb-1">New Features</p>
                    <p className="text-xs text-muted-foreground">
                      Backwards compatible functionality additions
                    </p>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        1.0.0 → 1.1.0
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-500 mb-2">PATCH</div>
                    <p className="text-sm font-medium mb-1">Bug Fixes</p>
                    <p className="text-xs text-muted-foreground">
                      Backwards compatible bug fixes and improvements
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        1.0.0 → 1.0.1
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Version Automation */}
                <div className="p-4 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-3">Automated Versioning with Conventional Commits</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">Commit Type → Version Bump</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <code>feat:</code>
                          <span className="text-orange-600">MINOR bump</span>
                        </div>
                        <div className="flex justify-between">
                          <code>fix:</code>
                          <span className="text-green-600">PATCH bump</span>
                        </div>
                        <div className="flex justify-between">
                          <code>feat!:</code>
                          <span className="text-red-600">MAJOR bump</span>
                        </div>
                        <div className="flex justify-between">
                          <code>BREAKING CHANGE:</code>
                          <span className="text-red-600">MAJOR bump</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Pre-release Versions</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <code>1.0.0-alpha.1</code>
                          <span className="text-muted-foreground">Alpha release</span>
                        </div>
                        <div className="flex justify-between">
                          <code>1.0.0-beta.1</code>
                          <span className="text-muted-foreground">Beta release</span>
                        </div>
                        <div className="flex justify-between">
                          <code>1.0.0-rc.1</code>
                          <span className="text-muted-foreground">Release candidate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Release Automation */}
                <div>
                  <h4 className="font-medium mb-2">Automated Release Process</h4>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install semantic-release
        run: |
          npm install -g semantic-release
          npm install -g @semantic-release/changelog
          npm install -g @semantic-release/git

      - name: Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          semantic-release

# .releaserc.json configuration:
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator", 
    "@semantic-release/changelog",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): \${nextRelease.version} [skip ci]\\n\\n\${nextRelease.notes}"
      }
    ]
  ]
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Release Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Release Checklist
              </CardTitle>
              <CardDescription>
                Ensure quality and consistency in every release
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Pre-Release</h4>
                  <div className="space-y-2">
                    {[
                      'All tests passing on main branch',
                      'Security vulnerabilities resolved',
                      'Documentation updated',
                      'Breaking changes documented',
                      'Migration guide prepared (if needed)',
                      'Performance benchmarks met'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Post-Release</h4>
                  <div className="space-y-2">
                    {[
                      'Deploy to production environment',
                      'Verify deployment health checks',
                      'Monitor error rates and performance',
                      'Announce release to stakeholders',
                      'Update project roadmap',
                      'Create next milestone/sprint planning'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Learning Summary */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertTitle>Git Workflow Mastery Complete!</AlertTitle>
        <AlertDescription>
          You've explored professional Git workflows including branching strategies, semantic commits, 
          pull request processes, branch protection, and release management. These practices ensure 
          code quality, team collaboration, and reliable deployments in enterprise development environments.
        </AlertDescription>
      </Alert>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="git-workflow" />
    </div>
  )
}