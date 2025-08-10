import * as React from 'react'
import { useLocation, Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { Home, ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  showHome?: boolean
  maxItems?: number
}

export function Breadcrumbs({ items, showHome = true, maxItems = 4 }: BreadcrumbsProps) {
  const location = useLocation()
  
  // Auto-generate breadcrumbs from pathname if items not provided
  const generatedItems = React.useMemo(() => {
    if (items) return items
    
    const pathSegments = location.pathname.split('/').filter(Boolean)
    
    const breadcrumbs: BreadcrumbItem[] = []
    
    if (showHome && location.pathname !== '/') {
      breadcrumbs.push({
        label: 'Home',
        href: '/'
      })
    }
    
    // Build breadcrumbs from path segments
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Format segment label
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Special cases for common routes
      if (segment === 'docs') label = 'Documentation'
      if (segment === 'auth') label = 'Authentication'
      if (segment === 'login') label = 'Sign In'
      if (segment === 'register') label = 'Sign Up'
      if (segment === 'dashboard') label = 'Dashboard'
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      })
    })
    
    return breadcrumbs
  }, [location.pathname, items, showHome])
  
  // Don't render breadcrumbs for root path if showHome is false
  if (!showHome && location.pathname === '/') {
    return null
  }
  
  // Don't render if only one item and it's the current page
  if (generatedItems.length === 1 && generatedItems[0].current) {
    return null
  }
  
  // Handle overflow with ellipsis
  const displayItems = maxItems && generatedItems.length > maxItems
    ? [
        generatedItems[0],
        { label: '...', href: undefined },
        ...generatedItems.slice(-(maxItems - 2))
      ]
    : generatedItems
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayItems.map((item, index) => (
          <React.Fragment key={`${item.href || item.label}-${index}`}>
            <BreadcrumbItem>
              {item.label === '...' ? (
                <BreadcrumbEllipsis />
              ) : item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground">{item.label}</span>
              )}
            </BreadcrumbItem>
            
            {index < displayItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// Convenience component for documentation breadcrumbs
export function DocsBreadcrumbs() {
  const location = useLocation()
  
  // Custom breadcrumb items for docs
  const getDocsBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    
    if (pathSegments[0] !== 'docs') return []
    
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Documentation', href: '/docs' }
    ]
    
    // Add specific doc sections
    if (pathSegments.length > 1) {
      const docSection = pathSegments[1]
      let sectionLabel = docSection
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Map common doc sections to better labels
      const sectionMap: Record<string, string> = {
        'api': 'API Reference',
        'auth': 'Authentication',
        'quickstart': 'Quick Start',
        'examples': 'Examples',
        'guides': 'Guides',
        'reference': 'Reference',
        'tutorial': 'Tutorial'
      }
      
      sectionLabel = sectionMap[docSection] || sectionLabel
      
      const isLast = pathSegments.length === 2
      items.push({
        label: sectionLabel,
        href: isLast ? undefined : `/docs/${docSection}`,
        current: isLast
      })
      
      // Add subsections if they exist
      if (pathSegments.length > 2) {
        pathSegments.slice(2).forEach((subsection, index) => {
          const isSubLast = index === pathSegments.length - 3
          let subsectionLabel = subsection
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          items.push({
            label: subsectionLabel,
            href: isSubLast ? undefined : location.pathname,
            current: isSubLast
          })
        })
      }
    }
    
    return items
  }
  
  return <Breadcrumbs items={getDocsBreadcrumbs()} />
}