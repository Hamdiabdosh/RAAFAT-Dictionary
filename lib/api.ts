import type { DictionaryEntry } from './types'

export interface SearchParams {
  q?: string
  lang?: 'all' | 'harari' | 'english' | 'amharic' | 'oromo'
  page?: number
}

export interface SearchResponse {
  entries: DictionaryEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function searchEntries(params: SearchParams & { category?: string; ids?: string }): Promise<SearchResponse> {
  const url = new URL('/api/v1/entries', window.location.origin)
  if (params.q) url.searchParams.set('q', params.q)
  if (params.lang && params.lang !== 'all') url.searchParams.set('lang', params.lang)
  if (params.page && params.page > 1) url.searchParams.set('page', String(params.page))
  if (params.category) url.searchParams.set('category', params.category)
  if (params.ids) url.searchParams.set('ids', params.ids)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch('/api/v1/categories')
  if (!res.ok) throw new Error('Failed to load topics')
  return res.json() as Promise<{ categories: { name: string; count: number }[] }>
}

export async function fetchRandomEntries(count = 10, category?: string) {
  const url = new URL('/api/v1/entries/random', window.location.origin)
  url.searchParams.set('count', String(count))
  if (category) url.searchParams.set('category', category)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to load entries')
  return res.json() as Promise<{ entries: DictionaryEntry[] }>
}

export async function getEntry(id: string) {
  const res = await fetch(`/api/v1/entries/${id}`)
  if (!res.ok) throw new Error('Entry not found')
  return res.json()
}

export interface SuggestionsResponse {
  suggestions: import('./types').Suggestion[]
  pagination: SearchResponse['pagination']
}

export async function fetchSuggestions(
  status: string = 'pending',
  page = 1
): Promise<SuggestionsResponse> {
  const url = new URL('/api/v1/suggestions', window.location.origin)
  url.searchParams.set('status', status)
  if (page > 1) url.searchParams.set('page', String(page))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to load suggestions')
  return res.json()
}

export async function resolveSuggestion(id: string, action: 'approve' | 'reject') {
  const res = await fetch(`/api/v1/suggestions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  if (!res.ok) throw new Error('Failed to resolve suggestion')
  return res.json()
}

export async function voteSuggestion(
  id: string,
  voteType: 'correct' | 'incorrect' | 'needs_discussion'
) {
  const res = await fetch(`/api/v1/suggestions/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voteType }),
  })
  if (!res.ok) throw new Error('Failed to vote')
  return res.json()
}

export async function createEntry(data: {
  harari: string
  english: string
  amharic?: string
  oromo?: string
  category?: string
  partOfSpeech?: string
  exampleHarari?: string
  exampleEnglish?: string
}) {
  const res = await fetch('/api/v1/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to create entry')
  }
  return res.json()
}

export async function fetchProfile() {
  const res = await fetch('/api/v1/users/me')
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

export interface NotificationItem {
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export async function fetchNotifications() {
  const res = await fetch('/api/v1/notifications')
  if (!res.ok) throw new Error('Failed to load notifications')
  return res.json() as Promise<{
    notifications: NotificationItem[]
    unreadCount: number
  }>
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`/api/v1/notifications/${id}`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to mark notification read')
  return res.json()
}

export async function markAllNotificationsRead() {
  const res = await fetch('/api/v1/notifications', { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to mark notifications read')
  return res.json()
}

export function getExportUrl(format: 'json' | 'csv', status = 'verified') {
  const url = new URL('/api/v1/admin/export', window.location.origin)
  url.searchParams.set('format', format)
  url.searchParams.set('status', status)
  return url.toString()
}

export async function fetchAdminStats() {
  const res = await fetch('/api/v1/admin/stats')
  if (!res.ok) throw new Error('Failed to load stats')
  return res.json()
}

export async function fetchAdminUsers(params: { q?: string; role?: string; page?: number }) {
  const url = new URL('/api/v1/admin/users', window.location.origin)
  if (params.q) url.searchParams.set('q', params.q)
  if (params.role && params.role !== 'all') url.searchParams.set('role', params.role)
  if (params.page && params.page > 1) url.searchParams.set('page', String(params.page))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}

export async function updateAdminUser(id: string, data: { role?: string; reputation?: number }) {
  const res = await fetch(`/api/v1/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Update failed')
  }
  return res.json()
}

export async function fetchAdminEntries(params: { q?: string; status?: string; page?: number }) {
  const url = new URL('/api/v1/admin/entries', window.location.origin)
  if (params.q) url.searchParams.set('q', params.q)
  if (params.status && params.status !== 'all') url.searchParams.set('status', params.status)
  if (params.page && params.page > 1) url.searchParams.set('page', String(params.page))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to load entries')
  return res.json()
}

export async function updateAdminEntry(id: string, data: { status: string }) {
  const res = await fetch(`/api/v1/admin/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Update failed')
  return res.json()
}

export async function deleteAdminEntry(id: string) {
  const res = await fetch(`/api/v1/admin/entries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
  return res.json()
}
