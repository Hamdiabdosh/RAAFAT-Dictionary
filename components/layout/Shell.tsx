'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, Moon, Sun, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { NotificationBell } from '@/components/layout/NotificationBell'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const pathname = usePathname()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const role = (session?.user as { role?: string } | undefined)?.role
  const isReviewer = role === 'reviewer' || role === 'admin'
  const isAdminUser = role === 'admin'

  const navItems = [
    { href: '/', label: 'Dictionary', icon: '📚' },
    { href: '/learn', label: 'Learn', icon: '🎓' },
    ...(isReviewer ? [{ href: '/review', label: 'Review Queue', icon: '✓' }] : []),
    ...(isAdminUser ? [{ href: '/admin', label: 'Admin', icon: '⚙️' }] : []),
    { href: '/contribute', label: 'Contribute', icon: '✏️' },
    { href: '/about', label: 'About', icon: 'ℹ️' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 md:hidden border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ራፋት
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-screen">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-2 px-6 py-8 border-b border-sidebar-border">
              <span className="text-3xl font-bold bg-gradient-to-r from-sidebar-accent to-primary bg-clip-text text-transparent">
                ራፋት
              </span>
              <span className="text-sm text-sidebar-foreground/60">Dictionary</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-4 space-y-2">
              {session?.user ? (
                <>
                  <NotificationBell />
                  <Link
                    href="/profile"
                    className="block px-4 text-xs text-sidebar-foreground/60 truncate hover:text-sidebar-foreground"
                  >
                    {session.user.name}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full md:ml-64 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav (optional) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 transition-colors ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
