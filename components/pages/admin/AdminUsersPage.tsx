'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Pagination } from '@/components/layout/AdminShell'
import { fetchAdminUsers, updateAdminUser } from '@/lib/api'
import type { UserRole } from '@/lib/types'

interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  reputation: number
  createdAt: string
  entryCount: number
  suggestionCount: number
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasPrev: false, hasNext: false })
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const data = await fetchAdminUsers({ q, role: roleFilter, page })
      setUsers(data.users)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [q, roleFilter])

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [q, roleFilter, load])

  const handleRoleChange = async (id: string, role: UserRole) => {
    setSaving(id)
    try {
      await updateAdminUser(id, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch {
      alert('Failed to update role')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage roles and permissions</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-input text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-input text-sm"
        >
          <option value="all">All roles</option>
          <option value="contributor">Contributor</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Activity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reputation</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {u.entryCount} entries · {u.suggestionCount} suggestions
                    </td>
                    <td className="px-4 py-3">{u.reputation}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={saving === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-2 py-1 rounded border border-border bg-input text-sm capitalize"
                      >
                        <option value="contributor">Contributor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPage={load}
          />
        </>
      )}
    </div>
  )
}
