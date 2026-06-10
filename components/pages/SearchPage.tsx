'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { EntryCard } from '../dictionary/EntryCard'
import { searchEntries, type SearchResponse } from '@/lib/api'
import type { DictionaryEntry } from '@/lib/types'

type Lang = 'all' | 'harari' | 'english' | 'amharic' | 'oromo'

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'harari', label: 'Harari' },
  { value: 'english', label: 'English' },
  { value: 'amharic', label: 'አማርኛ' },
  { value: 'oromo', label: 'Oromoo' },
]

export function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [lang, setLang] = useState<Lang>((searchParams.get('lang') as Lang) ?? 'all')
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [pagination, setPagination] = useState<SearchResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const doSearch = useCallback(async (q: string, l: Lang, p: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchEntries({ q, lang: l, page: p })
      setEntries(result.entries)
      setPagination(result.pagination)

      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (l !== 'all') params.set('lang', l)
      if (p > 1) params.set('page', String(p))
      router.replace(`/?${params.toString()}`, { scroll: false })
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      doSearch(query, lang, 1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, lang, doSearch])

  useEffect(() => {
    if (page > 1) doSearch(query, lang, page)
  }, [page])

  useEffect(() => {
    doSearch(query, lang, page)
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Harari Dictionary
        </h1>
        <p className="text-muted-foreground">
          Explore and preserve the Harari language
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <GraduationCap size={16} />
          Start learning →
        </Link>
      </div>

      {/* Search input */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          {loading ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" size={20} />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in Harari, English, አማርኛ, Oromoo..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-input border-2 border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Language filter pills */}
      <div className="flex gap-2 flex-wrap justify-center">
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLang(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              lang === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {pagination && (
        <p className="text-sm text-muted-foreground text-center">
          {pagination.total.toLocaleString()} result{pagination.total !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-destructive text-sm">{error}</p>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.length > 0 ? (
          entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        ) : !loading ? (
          <div className="col-span-full text-center py-16 space-y-3">
            <p className="text-muted-foreground text-lg">
              {query ? `No entries found for "${query}"` : 'Start searching above'}
            </p>
            {query && (
              <button className="text-sm text-primary underline underline-offset-4">
                Suggest this word →
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors text-sm"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
