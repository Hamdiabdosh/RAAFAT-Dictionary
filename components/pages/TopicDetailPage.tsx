'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Layers, Brain } from 'lucide-react'
import { searchEntries } from '@/lib/api'
import { EntryCard } from '@/components/dictionary/EntryCard'
import type { DictionaryEntry } from '@/lib/types'

export function TopicDetailPage() {
  const params = useParams()
  const category = decodeURIComponent(params.letter as string)
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    searchEntries({ category, page })
      .then((res) => {
        setEntries(res.entries)
        setTotal(res.pagination.total)
      })
      .finally(() => setLoading(false))
  }, [category, page])

  const topicParam = encodeURIComponent(category)

  return (
    <div className="space-y-6">
      <Link href="/learn/topics" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> All letters
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Topic</p>
          <h1 className="text-5xl font-bold font-ethiopic text-primary">{category}</h1>
          <p className="text-muted-foreground mt-1">{total.toLocaleString()} words</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/learn/flashcards?category=${topicParam}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Layers size={16} /> Flashcards
          </Link>
          <Link
            href={`/learn/quiz?category=${topicParam}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
          >
            <Brain size={16} /> Quiz
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          {total > 20 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={entries.length < 20}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-40 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
