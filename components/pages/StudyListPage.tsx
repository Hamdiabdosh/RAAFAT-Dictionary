'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Trash2, Layers, Brain, Printer } from 'lucide-react'
import { getStudyList, removeFromStudyList, getStudyListShareUrl, type StudyEntry } from '@/lib/study'

export function StudyListPage() {
  const [list, setList] = useState<StudyEntry[]>([])
  const [copied, setCopied] = useState(false)

  const refresh = () => setList(getStudyList())

  useEffect(() => {
    refresh()
    window.addEventListener('study-list-updated', refresh)
    return () => window.removeEventListener('study-list-updated', refresh)
  }, [])

  const copyShareLink = () => {
    navigator.clipboard.writeText(getStudyListShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ids = list.map((e) => e.id).join(',')
  const encodedIds = encodeURIComponent(ids)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to Learn
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">My study list</h1>
        <p className="text-muted-foreground text-sm">
          Save words while browsing. Share the link with students for the same flashcard set.
        </p>
      </div>

      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/learn/flashcards?ids=${encodedIds}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Layers size={16} /> Practice flashcards
          </Link>
          <Link
            href={`/learn/quiz?ids=${encodedIds}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
          >
            <Brain size={16} /> Take quiz
          </Link>
          <button
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted print:hidden"
          >
            <Printer size={16} /> Print list
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 space-y-3 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">No saved words yet.</p>
          <p className="text-sm text-muted-foreground">
            Tap the bookmark icon on any dictionary entry to add it here.
          </p>
          <Link href="/" className="inline-block text-primary underline text-sm">
            Browse dictionary →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden print:border-0">
          <div className="hidden print:block mb-4">
            <h2 className="text-xl font-bold">RAAFAT Study List</h2>
            <p className="text-sm text-muted-foreground">{list.length} words</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 print:bg-transparent">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Harari</th>
                <th className="text-left px-4 py-3 font-medium">English</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Amharic</th>
                <th className="w-10 print:hidden" />
              </tr>
            </thead>
            <tbody>
              {list.map((entry) => (
                <tr key={entry.id} className="border-t border-border">
                  <td className="px-4 py-3 font-ethiopic font-medium">
                    <Link href={`/entry/${entry.id}`} className="hover:text-primary print:no-underline print:text-black">
                      {entry.harari}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{entry.english}</td>
                  <td className="px-4 py-3 font-ethiopic hidden sm:table-cell text-muted-foreground">
                    {entry.amharic || '—'}
                  </td>
                  <td className="px-2 print:hidden">
                    <button
                      onClick={() => removeFromStudyList(entry.id)}
                      className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hidden bookmark for re-adding after remove — not needed */}
    </div>
  )
}
