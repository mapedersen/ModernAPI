/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { ThemeProvider } from 'next-themes'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { Header } from '~/components/layout/Header'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'ModernAPI Template | Enterprise Full-Stack Development',
        description: 'Production-ready full-stack template with Clean Architecture, .NET 9, React 19, and modern development practices.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const isDocsRoute = location.pathname.startsWith('/docs')
  const isAuthRoute = location.pathname.startsWith('/auth')
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  // Always show header except for specific auth pages
  const showHeader = true
  const headerVariant = isDocsRoute ? 'minimal' : 'default'

  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="modernapi-theme"
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md m-2 transition-all"
          >
            Skip to main content
          </a>

          {/* Persistent Header - always show for navigation consistency */}
          {showHeader && <Header variant={headerVariant} showAuth={!isAuthRoute} />}

          <main id="main-content" className="focus:outline-none">
            {isDashboardRoute ? (
              // Dashboard layout with proper spacing for header
              <div className="min-h-[calc(100vh-4rem)]">
                <Outlet />
              </div>
            ) : (
              // Clean main app layout with proper spacing for header
              <div className="min-h-[calc(100vh-4rem)]">
                <Outlet />
              </div>
            )}
          </main>
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
