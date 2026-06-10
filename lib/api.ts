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
