import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { Separator } from '~/components/ui/separator'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { 
  Play, 
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Container,
  Cloud,
  Settings,
  Shield,
  GitBranch,
  Zap,
  Server,
  Database,
  Monitor,
  Package,
  Workflow,
  Key,
  Eye,
  Target,
  Activity,
  Globe,
  Lock,
  ArrowRight,
  Terminal,
  FileText,
  Layers,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/docs/guides/deployment')({
  component: DeploymentPage,
})

interface DeploymentStage {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'running' | 'completed' | 'error'
  duration: number
  steps: DeploymentStep[]
  color: string
  dockerfile?: string
  k8sManifest?: string
  cicdConfig?: string
}

interface DeploymentStep {
  id: string
  name: string
  description: string
  command?: string
  output?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  duration: number
}

interface Environment {
  id: string
  name: string
  description: string
  color: string
  icon: React.ElementType
  status: 'healthy' | 'warning' | 'error' | 'deploying'
  version: string
  replicas: number
  cpu: string
  memory: string
  config: EnvironmentConfig
}

interface EnvironmentConfig {
  database: string
  secrets: string[]
  features: string[]
  scaling: {
    min: number
    max: number
    cpu: number
    memory: number
  }
}

interface KubernetesResource {
  kind: string
  name: string
  namespace: string
  status: 'Ready' | 'Pending' | 'Failed' | 'Unknown'
  age: string
  replicas?: string
  cpu?: string
  memory?: string
}

interface SecurityScan {
  id: string
  name: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'passed' | 'failed' | 'running'
  findings: number
  description: string
}

interface Metric {
  name: string
  value: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

function DeploymentPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('development')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Handle module completion and progression
  useModuleCompletion('deployment')

  // Deployment stages configuration
  const deploymentStages: DeploymentStage[] = [
    {
      id: 'build',
      name: 'Container Build',
      description: 'Multi-stage Docker build process',
      icon: Container,
      status: 'pending',
      duration: 120,
      color: 'bg-blue-500',
      dockerfile: `# Multi-stage Dockerfile for ModernAPI
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj files and restore dependencies
COPY ["ModernAPI.API/ModernAPI.API.csproj", "ModernAPI.API/"]
COPY ["ModernAPI.Application/ModernAPI.Application.csproj", "ModernAPI.Application/"]
COPY ["ModernAPI.Infrastructure/ModernAPI.Infrastructure.csproj", "ModernAPI.Infrastructure/"]
COPY ["ModernAPI.Domain/ModernAPI.Domain.csproj", "ModernAPI.Domain/"]

RUN dotnet restore "ModernAPI.API/ModernAPI.API.csproj"

# Copy source code and build
COPY . .
RUN dotnet build "ModernAPI.API/ModernAPI.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "ModernAPI.API/ModernAPI.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

EXPOSE 80
ENTRYPOINT ["dotnet", "ModernAPI.API.dll"]`,
      steps: [
        {
          id: 'restore',
          name: 'Restore Dependencies',
          description: 'Download NuGet packages and dependencies',
          command: 'dotnet restore',
          status: 'pending',
          duration: 30
        },
        {
          id: 'build',
          name: 'Build Application',
          description: 'Compile C# code and create assemblies',
          command: 'dotnet build -c Release',
          status: 'pending',
          duration: 45
        },
        {
          id: 'publish',
          name: 'Publish Artifacts',
          description: 'Create deployment-ready artifacts',
          command: 'dotnet publish -c Release',
          status: 'pending',
          duration: 25
        },
        {
          id: 'package',
          name: 'Package Container',
          description: 'Build Docker image with runtime optimizations',
          command: 'docker build -t modernapi:latest .',
          status: 'pending',
          duration: 20
        }
      ]
    },
    {
      id: 'test',
      name: 'Quality Gates',
      description: 'Automated testing and security scanning',
      icon: Shield,
      status: 'pending',
      duration: 90,
      color: 'bg-green-500',
      steps: [
        {
          id: 'unit-tests',
          name: 'Unit Tests',
          description: 'Run comprehensive unit test suite',
          command: 'dotnet test --configuration Release',
          status: 'pending',
          duration: 30
        },
        {
          id: 'integration-tests',
          name: 'Integration Tests',
          description: 'Test API endpoints with real database',
          command: 'dotnet test IntegrationTests/',
          status: 'pending',
          duration: 25
        },
        {
          id: 'security-scan',
          name: 'Security Scanning',
          description: 'Vulnerability assessment and compliance check',
          command: 'trivy image modernapi:latest',
          status: 'pending',
          duration: 20
        },
        {
          id: 'code-quality',
          name: 'Code Quality',
          description: 'Static analysis and code coverage validation',
          command: 'sonar-scanner',
          status: 'pending',
          duration: 15
        }
      ]
    },
    {
      id: 'deploy',
      name: 'Kubernetes Deploy',
      description: 'Rolling deployment to Kubernetes cluster',
      icon: Cloud,
      status: 'pending',
      duration: 180,
      color: 'bg-purple-500',
      k8sManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: modernapi
  namespace: production
  labels:
    app: modernapi
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: modernapi
  template:
    metadata:
      labels:
        app: modernapi
        version: v1.0.0
    spec:
      containers:
      - name: api
        image: modernapi:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10`,
      steps: [
        {
          id: 'push-image',
          name: 'Push Container',
          description: 'Upload image to container registry',
          command: 'docker push registry.io/modernapi:latest',
          status: 'pending',
          duration: 60
        },
        {
          id: 'apply-manifests',
          name: 'Apply K8s Manifests',
          description: 'Deploy application manifests to cluster',
          command: 'kubectl apply -f k8s/',
          status: 'pending',
          duration: 45
        },
        {
          id: 'rolling-update',
          name: 'Rolling Update',
          description: 'Gradually replace old pods with new ones',
          command: 'kubectl rollout status deployment/modernapi',
          status: 'pending',
          duration: 75
        }
      ]
    },
    {
      id: 'verify',
      name: 'Health Verification',
      description: 'Post-deployment validation and monitoring',
      icon: Activity,
      status: 'pending',
      duration: 60,
      color: 'bg-orange-500',
      steps: [
        {
          id: 'health-check',
          name: 'Health Endpoints',
          description: 'Verify application health endpoints respond',
          command: 'curl https://api.modernapi.com/health',
          status: 'pending',
          duration: 15
        },
        {
          id: 'smoke-tests',
          name: 'Smoke Tests',
          description: 'Run critical path validation tests',
          command: 'npm run test:smoke',
          status: 'pending',
          duration: 20
        },
        {
          id: 'monitoring-setup',
          name: 'Enable Monitoring',
          description: 'Activate alerts and metric collection',
          command: 'kubectl apply -f monitoring/',
          status: 'pending',
          duration: 25
        }
      ]
    }
  ]

  // Environment configurations
  const environments: Environment[] = [
    {
      id: 'development',
      name: 'Development',
      description: 'Local development and testing environment',
      color: 'bg-blue-500',
      icon: Terminal,
      status: 'healthy',
      version: 'v1.2.3-dev',
      replicas: 1,
      cpu: '100m',
      memory: '256Mi',
      config: {
        database: 'PostgreSQL (Local)',
        secrets: ['dev-jwt-secret', 'local-db-connection'],
        features: ['Debug Logging', 'Hot Reload', 'Swagger UI'],
        scaling: { min: 1, max: 1, cpu: 50, memory: 30 }
      }
    },
    {
      id: 'staging',
      name: 'Staging',
      description: 'Pre-production environment for final testing',
      color: 'bg-yellow-500',
      icon: Eye,
      status: 'warning',
      version: 'v1.2.3-rc1',
      replicas: 2,
      cpu: '200m',
      memory: '512Mi',
      config: {
        database: 'PostgreSQL (Managed)',
        secrets: ['staging-jwt-secret', 'staging-db-connection', 'external-api-keys'],
        features: ['Performance Monitoring', 'Load Testing', 'Feature Flags'],
        scaling: { min: 2, max: 5, cpu: 70, memory: 60 }
      }
    },
    {
      id: 'production',
      name: 'Production',
      description: 'Live production environment serving users',
      color: 'bg-green-500',
      icon: Globe,
      status: 'healthy',
      version: 'v1.2.2',
      replicas: 5,
      cpu: '500m',
      memory: '1Gi',
      config: {
        database: 'PostgreSQL (HA Cluster)',
        secrets: ['prod-jwt-secret', 'prod-db-connection', 'payment-gateway', 'ssl-certificates'],
        features: ['Auto-scaling', 'Circuit Breakers', 'Distributed Tracing'],
        scaling: { min: 3, max: 20, cpu: 80, memory: 70 }
      }
    }
  ]

  // Kubernetes resources
  const kubernetesResources: KubernetesResource[] = [
    { kind: 'Deployment', name: 'modernapi', namespace: 'production', status: 'Ready', age: '2d', replicas: '5/5' },
    { kind: 'Service', name: 'modernapi-service', namespace: 'production', status: 'Ready', age: '2d' },
    { kind: 'Ingress', name: 'modernapi-ingress', namespace: 'production', status: 'Ready', age: '2d' },
    { kind: 'ConfigMap', name: 'modernapi-config', namespace: 'production', status: 'Ready', age: '2d' },
    { kind: 'Secret', name: 'modernapi-secrets', namespace: 'production', status: 'Ready', age: '2d' },
    { kind: 'HPA', name: 'modernapi-hpa', namespace: 'production', status: 'Ready', age: '1d', cpu: '45%', memory: '60%' },
    { kind: 'Pod', name: 'modernapi-7d4b8c9f-abc12', namespace: 'production', status: 'Ready', age: '4h' },
    { kind: 'Pod', name: 'modernapi-7d4b8c9f-def34', namespace: 'production', status: 'Ready', age: '4h' },
    { kind: 'Pod', name: 'modernapi-7d4b8c9f-ghi56', namespace: 'production', status: 'Ready', age: '4h' }
  ]

  // Security scans
  const securityScans: SecurityScan[] = [
    { id: 'container', name: 'Container Vulnerability Scan', severity: 'Low', status: 'passed', findings: 2, description: 'Trivy container image scan' },
    { id: 'dependencies', name: 'Dependency Check', severity: 'Medium', status: 'passed', findings: 1, description: 'NuGet package vulnerabilities' },
    { id: 'secrets', name: 'Secrets Detection', severity: 'Low', status: 'passed', findings: 0, description: 'GitLeaks secret scanning' },
    { id: 'compliance', name: 'Security Compliance', severity: 'Low', status: 'passed', findings: 3, description: 'CIS Kubernetes benchmark' }
  ]

  // Production metrics
  const productionMetrics: Metric[] = [
    { name: 'Response Time', value: '142ms', trend: 'down', status: 'good' },
    { name: 'Throughput', value: '2.4k RPS', trend: 'up', status: 'good' },
    { name: 'Error Rate', value: '0.02%', trend: 'stable', status: 'good' },
    { name: 'CPU Usage', value: '45%', trend: 'stable', status: 'good' },
    { name: 'Memory Usage', value: '60%', trend: 'up', status: 'warning' },
    { name: 'Disk I/O', value: '12 MB/s', trend: 'stable', status: 'good' }
  ]

  // Simulation logic
  const startSimulation = async () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    
    // Reset all stages
    deploymentStages.forEach(stage => {
      stage.status = 'pending'
      stage.steps.forEach(step => {
        step.status = 'pending'
        step.output = undefined
      })
    })

    let totalProgress = 0
    const totalSteps = deploymentStages.reduce((acc, stage) => acc + stage.steps.length, 0)

    for (const stage of deploymentStages) {
      stage.status = 'running'
      
      for (const step of stage.steps) {
        step.status = 'running'
        
        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        step.status = 'completed'
        step.output = generateMockOutput(step.command || '')
        totalProgress++
        setSimulationProgress((totalProgress / totalSteps) * 100)
      }
      
      stage.status = 'completed'
    }

    setIsSimulating(false)
  }

  const generateMockOutput = (command: string): string => {
    if (command.includes('restore')) {
      return '✓ Restored 47 packages in 12.3s'
    } else if (command.includes('build')) {
      return '✓ Build succeeded. 0 Warning(s), 0 Error(s)'
    } else if (command.includes('test')) {
      return '✓ Passed! - Failed: 0, Passed: 156, Skipped: 0'
    } else if (command.includes('docker')) {
      return '✓ Successfully built and tagged modernapi:latest'
    } else if (command.includes('kubectl')) {
      return '✓ deployment.apps/modernapi configured'
    }
    return '✓ Command completed successfully'
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setSimulationProgress(0)
    deploymentStages.forEach(stage => {
      stage.status = 'pending'
      stage.steps.forEach(step => {
        step.status = 'pending'
        step.output = undefined
      })
    })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Container className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Deployment & DevOps Journey</h1>
            <p className="text-muted-foreground">
              Complete deployment pipeline from Docker containers to Kubernetes production
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary">
            <Container className="w-3 h-3 mr-1" />
            Docker
          </Badge>
          <Badge variant="secondary">
            <Cloud className="w-3 h-3 mr-1" />
            Kubernetes
          </Badge>
          <Badge variant="secondary">
            <GitBranch className="w-3 h-3 mr-1" />
            GitHub Actions
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Security
          </Badge>
          <Badge variant="secondary">
            <Monitor className="w-3 h-3 mr-1" />
            Monitoring
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">CI/CD Pipeline</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Deployment Pipeline Simulation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    Interactive Deployment Pipeline
                  </CardTitle>
                  <CardDescription>
                    Simulate a complete production deployment from build to verification
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className="flex items-center gap-2"
                  >
                    {isSimulating ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Deploy
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
                    <span className="text-sm font-medium">Deployment Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(simulationProgress)}%</span>
                  </div>
                  <Progress value={simulationProgress} className="h-2" />
                </div>
              )}

              {/* Deployment Stages */}
              <div className="space-y-4">
                {deploymentStages.map((stage, index) => (
                  <div key={stage.id} className="border rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          stage.status === 'completed' && 'bg-green-500 text-white',
                          stage.status === 'running' && 'bg-blue-500 text-white animate-pulse',
                          stage.status === 'pending' && 'bg-muted text-muted-foreground',
                          stage.status === 'error' && 'bg-red-500 text-white'
                        )}>
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : stage.status === 'running' ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : stage.status === 'error' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{stage.name}</h3>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {stage.duration}s
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stage Details */}
                    {selectedStage === stage.id && (
                      <div className="mt-4 space-y-3">
                        <Separator />
                        
                        {/* Steps */}
                        <div className="space-y-2">
                          {stage.steps.map((step) => (
                            <div key={step.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center',
                                  step.status === 'completed' && 'bg-green-500 text-white',
                                  step.status === 'running' && 'bg-blue-500 text-white animate-pulse',
                                  step.status === 'pending' && 'bg-muted text-muted-foreground',
                                  step.status === 'error' && 'bg-red-500 text-white'
                                )}>
                                  {step.status === 'completed' ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : step.status === 'running' ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-current" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{step.name}</p>
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                  {step.command && (
                                    <code className="text-xs bg-muted px-1 rounded">{step.command}</code>
                                  )}
                                  {step.output && (
                                    <p className="text-xs text-green-600 mt-1">{step.output}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">{step.duration}s</span>
                            </div>
                          ))}
                        </div>

                        {/* Code Examples */}
                        {(stage.dockerfile || stage.k8sManifest) && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Configuration
                            </h4>
                            <div className="bg-muted/40 rounded-lg p-3">
                              <pre className="text-xs overflow-x-auto">
                                <code>{stage.dockerfile || stage.k8sManifest}</code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Container className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Build Time</p>
                    <p className="text-2xl font-bold">2m 30s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Deploy Time</p>
                    <p className="text-2xl font-bold">3m 45s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Server className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Uptime</p>
                    <p className="text-2xl font-bold">99.9%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Security Score</p>
                    <p className="text-2xl font-bold">A+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                GitHub Actions Workflow
              </CardTitle>
              <CardDescription>
                Automated CI/CD pipeline with quality gates and security scanning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 rounded-lg p-4">
                <pre className="text-xs overflow-x-auto">
                  <code>{`name: Deploy ModernAPI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
          
      - name: Restore dependencies
        run: dotnet restore
        
      - name: Build
        run: dotnet build --no-restore -c Release
        
      - name: Run tests
        run: dotnet test --no-build -c Release --verbosity normal

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: csharp

  build-and-deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t modernapi:\${{ github.sha }} .
        
      - name: Push to registry
        run: |
          echo \${{ secrets.DOCKER_TOKEN }} | docker login -u \${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push modernapi:\${{ github.sha }}
          
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
            k8s/ingress.yaml
          images: modernapi:\${{ github.sha }}
          
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/modernapi -n production
          kubectl get pods -n production -l app=modernapi`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Stages Visualization */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Build', icon: Package, color: 'blue', status: 'success' },
              { name: 'Test', icon: Shield, color: 'green', status: 'success' },
              { name: 'Security', icon: Lock, color: 'purple', status: 'success' },
              { name: 'Deploy', icon: Cloud, color: 'orange', status: 'running' }
            ].map((stage, index) => (
              <Card key={stage.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        stage.color === 'blue' && 'bg-blue-500/10',
                        stage.color === 'green' && 'bg-green-500/10',
                        stage.color === 'purple' && 'bg-purple-500/10',
                        stage.color === 'orange' && 'bg-orange-500/10'
                      )}>
                        <stage.icon className={cn(
                          'w-4 h-4',
                          stage.color === 'blue' && 'text-blue-500',
                          stage.color === 'green' && 'text-green-500',
                          stage.color === 'purple' && 'text-purple-500',
                          stage.color === 'orange' && 'text-orange-500'
                        )} />
                      </div>
                      <span className="font-medium">{stage.name}</span>
                    </div>
                    <Badge variant={stage.status === 'success' ? 'default' : 'secondary'}>
                      {stage.status === 'success' ? '✓' : stage.status === 'running' ? '⟳' : '•'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          {/* Environment Selector */}
          <div className="flex gap-2 flex-wrap">
            {environments.map((env) => (
              <Button
                key={env.id}
                variant={selectedEnvironment === env.id ? "default" : "outline"}
                onClick={() => setSelectedEnvironment(env.id)}
                className="flex items-center gap-2"
              >
                <env.icon className="w-4 h-4" />
                {env.name}
              </Button>
            ))}
          </div>

          {/* Selected Environment Details */}
          {environments
            .filter(env => env.id === selectedEnvironment)
            .map(env => (
              <div key={env.id} className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', env.color + '/10')}>
                          <env.icon className={cn('w-5 h-5', env.color.replace('bg-', 'text-'))} />
                        </div>
                        <div>
                          <CardTitle>{env.name} Environment</CardTitle>
                          <CardDescription>{env.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          env.status === 'healthy' ? 'default' : 
                          env.status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {env.status}
                        </Badge>
                        <Badge variant="outline">{env.version}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Resource Allocation */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          Resources
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Replicas:</span>
                            <span className="font-mono">{env.replicas}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>CPU Request:</span>
                            <span className="font-mono">{env.cpu}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory Request:</span>
                            <span className="font-mono">{env.memory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Database:</span>
                            <span className="text-muted-foreground">{env.config.database}</span>
                          </div>
                        </div>
                      </div>

                      {/* Security & Secrets */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Secrets
                        </h4>
                        <div className="space-y-1">
                          {env.config.secrets.map((secret, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Lock className="w-3 h-3 text-muted-foreground" />
                              <code className="bg-muted px-1 rounded text-xs">{secret}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Features
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {env.config.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Auto-scaling Configuration */}
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Auto-scaling Configuration
                      </h4>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{env.config.scaling.min}</p>
                          <p className="text-xs text-muted-foreground">Min Replicas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{env.config.scaling.max}</p>
                          <p className="text-xs text-muted-foreground">Max Replicas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{env.config.scaling.cpu}%</p>
                          <p className="text-xs text-muted-foreground">CPU Target</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{env.config.scaling.memory}%</p>
                          <p className="text-xs text-muted-foreground">Memory Target</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="kubernetes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Kubernetes Cluster Explorer
              </CardTitle>
              <CardDescription>
                Live view of your Kubernetes resources and their current state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Namespace Info */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">Namespace: production</h4>
                    <p className="text-sm text-muted-foreground">Main production workloads</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                {/* Resources Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/20 px-4 py-2 border-b">
                    <h4 className="font-medium">Resources</h4>
                  </div>
                  <div className="divide-y">
                    {kubernetesResources.map((resource, index) => (
                      <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-muted/10">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {resource.kind}
                            </Badge>
                            <code className="text-sm">{resource.name}</code>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {resource.replicas && (
                            <span className="text-muted-foreground">{resource.replicas}</span>
                          )}
                          {resource.cpu && (
                            <span className="text-muted-foreground">CPU: {resource.cpu}</span>
                          )}
                          {resource.memory && (
                            <span className="text-muted-foreground">Memory: {resource.memory}</span>
                          )}
                          <span className="text-muted-foreground">{resource.age}</span>
                          <Badge variant={
                            resource.status === 'Ready' ? 'default' :
                            resource.status === 'Pending' ? 'secondary' :
                            resource.status === 'Failed' ? 'destructive' : 'secondary'
                          }>
                            {resource.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pod Status */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Running Pods</p>
                          <p className="text-2xl font-bold">5</p>
                        </div>
                        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Pending Pods</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Failed Pods</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Scanning Results
              </CardTitle>
              <CardDescription>
                Comprehensive security analysis across all deployment stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {securityScans.map((scan) => (
                  <div key={scan.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{scan.name}</h4>
                      <Badge variant={scan.status === 'passed' ? 'default' : scan.status === 'failed' ? 'destructive' : 'secondary'}>
                        {scan.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{scan.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        scan.severity === 'Critical' ? 'destructive' :
                        scan.severity === 'High' ? 'destructive' :
                        scan.severity === 'Medium' ? 'secondary' : 'outline'
                      }>
                        {scan.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {scan.findings} {scan.findings === 1 ? 'finding' : 'findings'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Security Checklist */}
              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Production Security Checklist
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { item: 'Non-root container execution', status: 'completed' },
                    { item: 'Secret management with Kubernetes Secrets', status: 'completed' },
                    { item: 'Network policies configured', status: 'completed' },
                    { item: 'Resource limits enforced', status: 'completed' },
                    { item: 'HTTPS/TLS termination', status: 'completed' },
                    { item: 'Image vulnerability scanning', status: 'completed' },
                    { item: 'RBAC permissions configured', status: 'completed' },
                    { item: 'Security context constraints', status: 'pending' }
                  ].map((check, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        check.status === 'completed' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        {check.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-sm">{check.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <Upload className="w-3 h-3 text-red-500" />
                      ) : metric.trend === 'down' ? (
                        <Download className="w-3 h-3 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <Badge variant={
                      metric.status === 'good' ? 'default' :
                      metric.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {metric.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alerting Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Active Monitoring & Alerts
              </CardTitle>
              <CardDescription>
                Production monitoring configuration and alert thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'High Error Rate', threshold: 'Error rate > 1%', status: 'active', severity: 'critical' },
                  { name: 'Response Time Alert', threshold: 'P95 > 500ms', status: 'active', severity: 'warning' },
                  { name: 'Pod Crash Loop', threshold: 'Restart count > 5', status: 'active', severity: 'critical' },
                  { name: 'Memory Usage', threshold: 'Memory > 80%', status: 'triggered', severity: 'warning' },
                  { name: 'Disk Space', threshold: 'Disk usage > 90%', status: 'active', severity: 'critical' },
                  { name: 'Database Connections', threshold: 'Active connections > 80%', status: 'active', severity: 'warning' }
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.threshold}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' : 'secondary'
                      }>
                        {alert.severity}
                      </Badge>
                      <Badge variant={alert.status === 'triggered' ? 'destructive' : 'outline'}>
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observability Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Observability Stack
              </CardTitle>
              <CardDescription>
                Comprehensive monitoring, logging, and tracing infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Prometheus', purpose: 'Metrics Collection', status: 'healthy', version: 'v2.45.0' },
                  { name: 'Grafana', purpose: 'Visualization', status: 'healthy', version: 'v10.2.0' },
                  { name: 'Loki', purpose: 'Log Aggregation', status: 'healthy', version: 'v2.9.0' },
                  { name: 'Jaeger', purpose: 'Distributed Tracing', status: 'healthy', version: 'v1.50.0' },
                  { name: 'AlertManager', purpose: 'Alert Routing', status: 'healthy', version: 'v0.26.0' },
                  { name: 'Node Exporter', purpose: 'System Metrics', status: 'healthy', version: 'v1.6.1' }
                ].map((tool) => (
                  <div key={tool.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{tool.name}</h4>
                      <Badge variant="default">
                        {tool.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{tool.purpose}</p>
                    <code className="text-xs bg-muted px-1 rounded">{tool.version}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Production Readiness Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Production Ready!</strong> Your ModernAPI deployment includes enterprise-grade features: 
          multi-stage builds, Kubernetes orchestration, comprehensive monitoring, security scanning, 
          and automated CI/CD pipelines. Ready for production workloads at scale.
        </AlertDescription>
      </Alert>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="deployment" />
    </div>
  )
}