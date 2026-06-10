'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, RotateCcw, Shuffle } from 'lucide-react'
import { fetchRandomEntries, searchEntries } from '@/lib/api'
import { getStudyList, shuffle } from '@/lib/study'
import type { DictionaryEntry } from '@/lib/types'

type Direction = 'harari-en' | 'en-harari'

export function FlashcardsPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? undefined
  const ids = searchParams.get('ids') ?? undefined

  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState<Direction>('harari-en')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (ids) {
        const res = await searchEntries({ ids })
        setEntries(res.entries)
      } else if (category) {
        const res = await searchEntries({ category, page: 1 })
        setEntries(shuffle(res.entries).slice(0, 30))
      } else {
        const list = getStudyList()
        if (list.length > 0) {
          const res = await searchEntries({ ids: list.map((e) => e.id).join(',') })
          setEntries(res.entries)
        } else {
          const res = await fetchRandomEntries(20)
          setEntries(res.entries)
        }
      }
      setIndex(0)
      setFlipped(false)
    } finally {
      setLoading(false)
    }
  }, [ids, category])

  useEffect(() => {
    load()
  }, [load])

  const current = entries[index]
  const front = direction === 'harari-en' ? current?.harari : current?.english
  const backPrimary = direction === 'harari-en' ? current?.english : current?.harari
  const backSecondary = direction === 'harari-en' ? current?.amharic : undefined

  const next = () => {
    setFlipped(false)
    setIndex((i) => (i + 1) % entries.length)
  }
  const prev = () => {
    setFlipped(false)
    setIndex((i) => (i - 1 + entries.length) % entries.length)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to Learn
      </Link>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <div className="flex gap-2">
          <select
            value={direction}
            onChange={(e) => { setDirection(e.target.value as Direction); setFlipped(false) }}
            className="text-sm px-3 py-1.5 rounded-lg border border-border bg-input"
          >
            <option value="harari-en">Harari → English</option>
            <option value="en-harari">English → Harari</option>
          </select>
          <button onClick={() => { setEntries(shuffle(entries)); setIndex(0); setFlipped(false) }} className="p-2 rounded-lg border border-border hover:bg-muted" title="Shuffle">
            <Shuffle size={16} />
          </button>
          <button onClick={load} className="p-2 rounded-lg border border-border hover:bg-muted" title="Reload">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {category && (
        <p className="text-sm text-muted-foreground text-center">
          Topic: <span className="font-ethiopic font-medium text-foreground">{category}</span>
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">No words to study yet.</p>
          <Link href="/learn/list" className="text-primary underline text-sm">Build a study list</Link>
        </div>
      ) : (
        <>
          <button
            onClick={() => setFlipped(!flipped)}
            className="w-full min-h-[220px] p-8 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all text-center"
          >
            {!flipped ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Question</p>
                <p className={`text-3xl font-bold ${direction === 'harari-en' ? 'font-ethiopic' : ''}`}>
                  {front}
                </p>
                <p className="text-xs text-muted-foreground mt-6">Tap or press Space to reveal</p>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Answer</p>
                <p className={`text-2xl font-bold ${direction === 'en-harari' ? 'font-ethiopic' : ''}`}>
                  {backPrimary}
                </p>
                {backSecondary && (
                  <p className="text-lg text-muted-foreground font-ethiopic mt-2">{backSecondary}</p>
                )}
                {current?.exampleHarari && (
                  <p className="text-sm text-muted-foreground mt-4 italic font-ethiopic">
                    &ldquo;{current.exampleHarari}&rdquo;
                  </p>
                )}
              </div>
            )}
          </button>

          <div className="flex items-center justify-between">
            <button onClick={prev} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
              <ChevronLeft size={18} /> Prev
            </button>
            <span className="text-sm text-muted-foreground">
              {index + 1} / {entries.length}
            </span>
            <button onClick={next} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
              Next <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
