'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Download,
  ArrowLeft,
  Shield,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/entries', label: 'Entries', icon: BookOpen },
  { href: '/admin/review', label: 'Review Queue', icon: ClipboardCheck },
  { href: '/admin/export', label: 'Export', icon: Download },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="fixed inset-y-0 left-0 z-30 w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-5 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <Shield size={20} className="text-primary" />
            <span className="font-semibold">Admin</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mt-1">RAAFAT Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(href, exact)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to app
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-56 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  hasPrev,
  hasNext,
  onPage,
}: {
  page: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={!hasPrev}
        className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted"
      >
        Previous
      </button>
      <span className="text-sm text-muted-foreground px-2">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={!hasNext}
        className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted"
      >
        Next
      </button>
    </div>
  )
}

export { Pagination }
