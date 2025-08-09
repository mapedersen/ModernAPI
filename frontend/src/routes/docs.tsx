import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Navigation } from '~/components/learning/Navigation'
import { ThemeToggle } from '~/components/ui/theme-toggle'

export const Route = createFileRoute('/docs')({
  component: DocsLayout,
})

function DocsLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Theme toggle positioned in top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="ml-80 p-8">
        <Outlet />
      </main>
    </div>
  )
}