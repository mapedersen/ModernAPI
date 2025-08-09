import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Target, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Code,
  Settings,
  Link as LinkIcon
} from 'lucide-react'
import { adrs, getADRsByTag, getRelatedADRs } from '~/data/adrs'
import { useState } from 'react'
import type { ADR } from '~/types/platform'

export const Route = createFileRoute('/reference/adr')({
  component: ADRPage,
})

function ADRPage() {
  const [selectedADR, setSelectedADR] = useState<ADR | null>(adrs[0] || null)
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(adrs.flatMap(adr => adr.tags))).sort()
  const filteredADRs = filterTag 
    ? getADRsByTag(filterTag)
    : adrs

  const getStatusIcon = (status: ADR['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'proposed':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'deprecated':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'superseded':
        return <Minus className="w-4 h-4 text-gray-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ADR['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'proposed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'deprecated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'superseded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getConsequenceIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'neutral':
        return <Minus className="w-4 h-4 text-yellow-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar - ADR List */}
        <div className="w-80 border-r border-border bg-card h-screen overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Architecture Decisions</h1>
                <p className="text-sm text-muted-foreground">Decision Records (ADRs)</p>
              </div>
            </div>
            
            {/* Tag Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Filter by tag:</div>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={!filterTag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTag(null)}
                >
                  All ({adrs.length})
                </Button>
                {allTags.slice(0, 4).map(tag => (
                  <Button
                    key={tag}
                    variant={filterTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  >
                    {tag} ({getADRsByTag(tag).length})
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {filteredADRs.map((adr) => (
              <Card 
                key={adr.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedADR?.id === adr.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedADR(adr)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(adr.status)}
                      <span className="text-sm font-mono text-muted-foreground">
                        ADR-{String(adr.number).padStart(3, '0')}
                      </span>
                    </div>
                    <Badge className={getStatusColor(adr.status)}>
                      {adr.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm line-clamp-2">
                    {adr.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(adr.date).toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {adr.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {adr.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{adr.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content - ADR Detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedADR ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(selectedADR.status)}
                      <span className="text-lg font-mono text-muted-foreground">
                        ADR-{String(selectedADR.number).padStart(3, '0')}
                      </span>
                      <Badge className={getStatusColor(selectedADR.status)}>
                        {selectedADR.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{selectedADR.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedADR.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedADR.deciders.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedADR.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setFilterTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                  <TabsTrigger value="implementation">Implementation</TabsTrigger>
                  <TabsTrigger value="consequences">Impact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Context & Problem
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Context</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedADR.context}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Problem Statement</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedADR.problem}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Decision & Rationale
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Decision:</strong> {selectedADR.decision}
                        </AlertDescription>
                      </Alert>
                      <div>
                        <h4 className="font-semibold mb-2">Rationale</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedADR.rationale}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Related ADRs */}
                  {selectedADR.relatedADRs && selectedADR.relatedADRs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LinkIcon className="w-5 h-5" />
                          Related Decisions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {getRelatedADRs(selectedADR.id).map(relatedADR => (
                            <Button
                              key={relatedADR.id}
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedADR(relatedADR)}
                            >
                              ADR-{String(relatedADR.number).padStart(3, '0')}: {relatedADR.title}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="alternatives" className="space-y-4">
                  {selectedADR.alternatives.map((alternative, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{alternative.name}</CardTitle>
                        <CardDescription>{alternative.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <h5 className="font-semibold text-green-700 dark:text-green-400">Pros</h5>
                            <ul className="text-sm space-y-1">
                              {alternative.pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <TrendingUp className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-semibold text-red-700 dark:text-red-400">Cons</h5>
                            <ul className="text-sm space-y-1">
                              {alternative.cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <TrendingDown className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-semibold">Assessment</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Cost:</span>
                                <Badge variant={alternative.cost === 'low' ? 'default' : alternative.cost === 'medium' ? 'secondary' : 'destructive'}>
                                  {alternative.cost}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Complexity:</span>
                                <Badge variant={alternative.complexity === 'low' ? 'default' : alternative.complexity === 'medium' ? 'secondary' : 'destructive'}>
                                  {alternative.complexity}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Risk:</span>
                                <Badge variant={alternative.riskLevel === 'low' ? 'default' : alternative.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                                  {alternative.riskLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="implementation" className="space-y-6">
                  {selectedADR.implementation && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Implementation Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedADR.implementation.overview}
                          </p>
                        </CardContent>
                      </Card>

                      {selectedADR.implementation.codeExamples.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Code className="w-5 h-5" />
                              Code Examples
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {selectedADR.implementation.codeExamples.map((example) => (
                              <div key={example.id} className="space-y-3">
                                <div>
                                  <h4 className="font-semibold">{example.title}</h4>
                                  <p className="text-sm text-muted-foreground">{example.description}</p>
                                  {example.filename && (
                                    <p className="text-xs font-mono text-primary bg-primary/10 inline-block px-2 py-1 rounded mt-1">
                                      {example.filename}
                                    </p>
                                  )}
                                </div>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                  <code>{example.code}</code>
                                </pre>
                                {example.explanation && (
                                  <p className="text-sm text-muted-foreground italic">
                                    💡 {example.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {selectedADR.implementation.configurationChanges.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="w-5 h-5" />
                              Configuration Changes
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedADR.implementation.configurationChanges.map((change, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{change.file}</h4>
                                  <Badge variant="outline">{change.section}</Badge>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-red-700 dark:text-red-400">Before</h5>
                                    <pre className="bg-red-50 dark:bg-red-950/20 p-3 rounded text-xs overflow-x-auto">
                                      <code>{change.before}</code>
                                    </pre>
                                  </div>
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-green-700 dark:text-green-400">After</h5>
                                    <pre className="bg-green-50 dark:bg-green-950/20 p-3 rounded text-xs overflow-x-auto">
                                      <code>{change.after}</code>
                                    </pre>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{change.explanation}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="consequences" className="space-y-4">
                  {selectedADR.consequences.map((consequence, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          {getConsequenceIcon(consequence.type)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                consequence.type === 'positive' ? 'default' : 
                                consequence.type === 'negative' ? 'destructive' : 'secondary'
                              }>
                                {consequence.type}
                              </Badge>
                              <Badge variant="outline">
                                {consequence.area}
                              </Badge>
                              <Badge variant={
                                consequence.impact === 'high' ? 'destructive' :
                                consequence.impact === 'medium' ? 'secondary' : 'default'
                              }>
                                {consequence.impact} impact
                              </Badge>
                            </div>
                            <p className="text-sm">{consequence.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select an ADR</h2>
                <p className="text-muted-foreground">
                  Choose an Architecture Decision Record from the sidebar to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}