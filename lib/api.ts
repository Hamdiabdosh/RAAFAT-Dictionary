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

export async function searchEntries(params: SearchParams): Promise<SearchResponse> {
  const url = new URL('/api/v1/entries', window.location.origin)
  if (params.q) url.searchParams.set('q', params.q)
  if (params.lang && params.lang !== 'all') url.searchParams.set('lang', params.lang)
  if (params.page && params.page > 1) url.searchParams.set('page', String(params.page))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Search failed')
  return res.json()
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
