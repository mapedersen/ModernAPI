import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '~/lib/utils'
import { platformSections, handbookItem } from '~/data/platform'
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { SearchBox } from '~/components/docs/SearchBox'
import React, { useState } from 'react'

export function Navigation() {
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState<string[]>([]) // All sections collapsed by default
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const isItemActive = (item: any) => {
    return location.pathname === item.path
  }

  const isSectionActive = (section: any) => {
    return section.items.some((item: any) => item.path === location.pathname)
  }

  return (
    <nav className="fixed left-0 top-14 w-80 bg-card border-r border-border h-[calc(100vh-3.5rem)] overflow-y-auto flex flex-col z-10">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3 group hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-xl group-hover:text-primary transition-colors">ModernAPI</h2>
            <p className="text-sm text-muted-foreground">Technical Documentation</p>
          </div>
        </Link>
        
        {/* Search Box */}
        <SearchBox />
      </div>

      {/* Handbook - Top Level */}
      <div className="p-4 border-b border-border">
        <Link
          to={handbookItem.path}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group w-full',
            location.pathname === handbookItem.path && 'bg-accent ring-2 ring-primary/20'
          )}
        >
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg">{handbookItem.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                'font-medium text-sm',
                location.pathname === handbookItem.path && 'text-primary'
              )}>
                {handbookItem.title}
              </h4>
              <span className="text-xs text-muted-foreground">
                {handbookItem.estimatedTime}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {handbookItem.description}
            </p>
            
            <div className="mt-2">
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' // handbookItem is always intermediate
              )}>
                {handbookItem.difficulty}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Platform Sections */}
      <div className="flex-1 p-4 space-y-4">
        {platformSections
          .sort((a, b) => a.order - b.order)
          .map((section) => {
            const isExpanded = expandedSections.includes(section.id)
            const isActive = isSectionActive(section)
            const sectionItems = section.items
            
            return (
              <div key={section.id} className="space-y-2">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group text-left",
                    isActive && !isExpanded && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-lg">{section.icon}</span>
                    {isActive && !isExpanded && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-medium text-sm group-hover:text-primary transition-colors",
                      isActive && !isExpanded && "text-primary"
                    )}>
                      {section.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {section.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isActive && !isExpanded && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {sectionItems.length}
                    </div>
                  </div>
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="ml-6 space-y-1 border-l-2 border-muted pl-4">
                    {sectionItems.map((item) => {
                      const isActive = isItemActive(item)

                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group',
                            isActive && 'bg-accent ring-2 ring-primary/20'
                          )}
                        >
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                'font-medium text-sm',
                                isActive && 'text-primary'
                              )}>
                                {item.title}
                              </h4>
                              {item.estimatedTime && (
                                <span className="text-xs text-muted-foreground">
                                  {item.estimatedTime}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                              {item.description}
                            </p>
                            
                            {item.difficulty && (
                              <div className="mt-2">
                                <span className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                  item.difficulty === 'beginner' && 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                                  item.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                                  item.difficulty === 'advanced' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                )}>
                                  {item.difficulty}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
      </div>

    </nav>
  )
}