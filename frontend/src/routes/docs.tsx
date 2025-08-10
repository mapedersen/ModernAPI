import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Navigation } from '~/components/learning/Navigation'
import { ThemeToggle } from '~/components/ui/theme-toggle'
import { DocsBreadcrumbs } from '~/components/layout/Breadcrumbs'

export const Route = createFileRoute('/docs')({
  component: DocsLayout,
})

function DocsLayout() {
  return (
    <div className="bg-background">
      <Navigation />
      {/* Theme toggle positioned in top-right, accounting for header */}
      <div className="fixed top-16 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="ml-80 p-8 pt-4">
        <div className="max-w-4xl">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <DocsBreadcrumbs />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}