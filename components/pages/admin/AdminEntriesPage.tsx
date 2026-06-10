'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Search, Trash2, ExternalLink } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/layout/AdminShell'
import { fetchAdminEntries, updateAdminEntry, deleteAdminEntry } from '@/lib/api'

interface AdminEntry {
  id: string
  harari: string
  english: string
  amharic: string
  status: string
  category: string | null
  source: string | null
  createdAt: string
  createdBy: string | null
}

export function AdminEntriesPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') ?? 'all'

  const [entries, setEntries] = useState<AdminEntry[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasPrev: false, hasNext: false })
  const [q, setQ] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const data = await fetchAdminEntries({ q, status, page })
      setEntries(data.entries)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [q, status])

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [q, status, load])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setBusy(id)
    try {
      await updateAdminEntry(id, { status: newStatus })
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)))
    } catch {
      alert('Failed to update entry')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (id: string, harari: string) => {
    if (!confirm(`Delete entry "${harari}"? This cannot be undone.`)) return
    setBusy(id)
    try {
      await deleteAdminEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      alert('Failed to delete entry')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entries</h1>
        <p className="text-muted-foreground text-sm mt-1">Verify, reject, or remove dictionary entries</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search harari, english, amharic..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-input text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-input text-sm"
        >
          <option value="all">All statuses</option>
          <option value="verified">Verified</option>
          <option value="pending_review">Pending review</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Harari</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">English</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-3 font-ethiopic font-medium">{e.harari}</td>
                    <td className="px-4 py-3">{e.english}</td>
                    <td className="px-4 py-3">
                      <select
                        value={e.status}
                        disabled={busy === e.id}
                        onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                        className="px-2 py-1 rounded border border-border bg-input text-xs"
                      >
                        <option value="verified">Verified</option>
                        <option value="pending_review">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/entry/${e.id}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                          title="View entry"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(e.id, e.harari)}
                          disabled={busy === e.id}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-50"
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
