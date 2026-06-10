'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Users, BookOpen, ClipboardList, UserPlus } from 'lucide-react'
import { fetchAdminStats } from '@/lib/api'

interface Stats {
  entries: { total: number; verified: number; pending: number; rejected: number }
  users: { total: number; contributors: number; reviewers: number; admins: number }
  suggestions: { total: number; pending: number }
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[]
}

export function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-destructive">Failed to load dashboard</p>
  }

  const cards = [
    { label: 'Total entries', value: stats.entries.total, href: '/admin/entries', icon: BookOpen },
    { label: 'Pending entries', value: stats.entries.pending, href: '/admin/entries?status=pending_review', icon: BookOpen, highlight: stats.entries.pending > 0 },
    { label: 'Pending suggestions', value: stats.suggestions.pending, href: '/admin/review', icon: ClipboardList, highlight: stats.suggestions.pending > 0 },
    { label: 'Total users', value: stats.users.total, href: '/admin/users', icon: Users },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">System status at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors ${
              card.highlight ? 'border-amber-500/50 bg-amber-500/5' : ''
            }`}
          >
            <card.icon size={20} className="text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-medium">Entries by status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified</span>
              <span className="font-medium text-green-600">{stats.entries.verified.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending review</span>
              <span className="font-medium text-amber-600">{stats.entries.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rejected</span>
              <span className="font-medium">{stats.entries.rejected.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-medium">Users by role</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contributors</span>
              <span>{stats.users.contributors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reviewers</span>
              <span>{stats.users.reviewers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admins</span>
              <span>{stats.users.admins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-medium flex items-center gap-2">
            <UserPlus size={18} />
            Recent sign-ups
          </h2>
          <Link href="/admin/users" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left px-5 py-2 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-5 py-2 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-5 py-2 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-5 py-2 font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-5 py-3">{u.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
