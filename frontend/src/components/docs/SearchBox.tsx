import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Badge } from '~/components/ui/badge'
import { Link } from '@tanstack/react-router'

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  section: string
}

interface SearchBoxProps {
  className?: string
}

// Mock search data - in a real app this would come from a search API
const searchData: SearchResult[] = [
  {
    id: '1',
    title: 'Getting Started',
    description: 'Learn how to set up and configure ModernAPI',
    url: '/docs',
    section: 'Guide'
  },
  {
    id: '2',
    title: 'Authentication',
    description: 'JWT authentication and user management',
    url: '/docs/auth',
    section: 'Security'
  },
  {
    id: '3',
    title: 'Clean Architecture',
    description: 'Understanding the project structure and patterns',
    url: '/docs/architecture',
    section: 'Development'
  },
  {
    id: '4',
    title: 'API Endpoints',
    description: 'Complete API reference and examples',
    url: '/docs/api',
    section: 'Reference'
  },
  {
    id: '5',
    title: 'Database Configuration',
    description: 'PostgreSQL setup and Entity Framework migrations',
    url: '/docs/database',
    section: 'Configuration'
  },
  {
    id: '6',
    title: 'Error Handling',
    description: 'Global exception middleware and error responses',
    url: '/docs/errors',
    section: 'Development'
  },
  {
    id: '7',
    title: 'Testing Strategy',
    description: 'Unit tests, integration tests, and best practices',
    url: '/docs/testing',
    section: 'Development'
  },
  {
    id: '8',
    title: 'Deployment Guide',
    description: 'Docker, environments, and production deployment',
    url: '/docs/deployment',
    section: 'Operations'
  }
]

export function SearchBox({ className }: SearchBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])

  // Filter results based on query
  React.useEffect(() => {
    if (!query.trim()) {
      setResults(searchData.slice(0, 6)) // Show popular results when no query
      return
    }

    const filtered = searchData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.section.toLowerCase().includes(query.toLowerCase())
    )

    setResults(filtered)
  }, [query])

  // Keyboard shortcut to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery('')
    // Navigation will be handled by the Link component
  }

  return (
    <>
      {/* Search Trigger Button */}
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="w-full justify-start text-muted-foreground md:w-64"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden md:inline-flex">Search documentation...</span>
          <span className="md:hidden">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 md:inline-flex ml-auto">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <DialogHeader className="px-4 pb-0 pt-4">
            <DialogTitle className="sr-only">Search Documentation</DialogTitle>
          </DialogHeader>
          
          <Command>
            <div className="flex items-center border-b px-4">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search documentation..."
                value={query}
                onValueChange={setQuery}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0 shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            <CommandList className="max-h-96 overflow-y-auto pb-2">
              {results.length === 0 && query && (
                <CommandEmpty>No results found for "{query}"</CommandEmpty>
              )}
              
              {results.length === 0 && !query && (
                <CommandEmpty>Start typing to search documentation...</CommandEmpty>
              )}

              {results.length > 0 && (
                <CommandGroup 
                  heading={query ? `Results for "${query}"` : "Popular Documentation"}
                >
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex flex-col items-start gap-2 px-4 py-3"
                    >
                      <Link 
                        to={result.url} 
                        onClick={() => setOpen(false)}
                        className="w-full"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{result.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {result.description}
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0 ml-2">
                            {result.section}
                          </Badge>
                        </div>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
          
          <div className="border-t px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                  ↑↓
                </kbd>
                <span>to navigate</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                  ↵
                </kbd>
                <span>to select</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                  esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}