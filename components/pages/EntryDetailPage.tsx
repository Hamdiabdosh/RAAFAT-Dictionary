'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, Clock, Copy, Check, ChevronDown
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'

interface Suggestion {
  id: string
  fieldName: string
  oldValue: string
  newValue: string
  status: string
  createdAt: string
  submitter: { name: string }
  votes: { voteType: string }[]
}

interface Entry {
  id: string
  harari: string
  english: string
  amharic: string
  oromo: string
  category: string | null
  partOfSpeech: string | null
  exampleHarari: string | null
  exampleEnglish: string | null
  status: string
  source: string | null
  suggestions: Suggestion[]
}

interface Props {
  entry: Entry
}

const FIELD_OPTIONS = [
  { value: 'harari', label: 'Harari word' },
  { value: 'english', label: 'English translation' },
  { value: 'amharic', label: 'Amharic translation' },
  { value: 'oromo', label: 'Oromo translation' },
  { value: 'exampleHarari', label: 'Harari example' },
  { value: 'exampleEnglish', label: 'English example' },
]

const ETHIOPIC_FIELDS = ['harari', 'amharic', 'exampleHarari']

export function EntryDetailPage({ entry }: Props) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [copied, setCopied] = useState<string | null>(null)
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [selectedField, setSelectedField] = useState('english')
  const [newValue, setNewValue] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const currentValue = entry[selectedField as keyof Entry] as string ?? ''

  const handleSubmitCorrection = async () => {
    if (!newValue.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/v1/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          fieldName: selectedField,
          oldValue: currentValue,
          newValue,
          note,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Submission failed')
      }
      setSubmitted(true)
      setNewValue('')
      setNote('')
      setTimeout(() => {
        setCorrectionOpen(false)
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const translations = [
    { lang: 'English', value: entry.english, key: 'english', ethiopic: false },
    { lang: 'አማርኛ', value: entry.amharic, key: 'amharic', ethiopic: true },
    { lang: 'Oromoo', value: entry.oromo, key: 'oromo', ethiopic: false },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to search
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-ethiopic text-4xl font-bold text-primary leading-tight">
            {entry.harari || '—'}
          </h1>
          {entry.status === 'verified' ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 shrink-0">
              <CheckCircle2 size={12} /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
              <Clock size={12} /> Pending Review
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {entry.category && (
            <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
              {entry.category}
            </span>
          )}
          {entry.partOfSpeech && (
            <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground italic">
              {entry.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      {/* Translations */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Translations
          </h2>
        </div>
        <div className="divide-y divide-border">
          {translations.map(({ lang, value, key, ethiopic }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3 gap-4">
              <span className="text-sm text-muted-foreground w-20 shrink-0">{lang}</span>
              <span className={`flex-1 text-foreground ${ethiopic ? 'font-ethiopic' : ''} ${!value ? 'text-muted-foreground italic' : ''}`}>
                {value || 'Not available'}
              </span>
              {value && (
                <button
                  onClick={() => handleCopy(value, key)}
                  className="p-1.5 rounded hover:bg-muted transition-colors shrink-0"
                  title="Copy"
                >
                  {copied === key ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Example */}
      {(entry.exampleHarari || entry.exampleEnglish) && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Example Usage
          </h2>
          {entry.exampleHarari && (
            <p className="font-ethiopic text-foreground italic">{entry.exampleHarari}</p>
          )}
          {entry.exampleEnglish && (
            <p className="text-sm text-muted-foreground">{entry.exampleEnglish}</p>
          )}
        </div>
      )}

      {/* Source */}
      {entry.source && (
        <p className="text-xs text-muted-foreground">
          Source: {entry.source}
        </p>
      )}

      {/* Suggest Correction */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => { setCorrectionOpen(!correctionOpen); setSubmitted(false) }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span>Suggest a correction</span>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${correctionOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {correctionOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            {!session?.user ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-sm text-muted-foreground">Sign in to suggest a correction</p>
                <Link href="/login" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  Sign In
                </Link>
              </div>
            ) : submitted ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Correction submitted — thank you!</span>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">
                    Which field needs correction?
                  </label>
                  <select
                    value={selectedField}
                    onChange={(e) => { setSelectedField(e.target.value); setNewValue('') }}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {FIELD_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Current value</label>
                  <div className={`px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground ${ETHIOPIC_FIELDS.includes(selectedField) ? 'font-ethiopic' : ''}`}>
                    {currentValue || 'Empty'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Corrected value</label>
                  <textarea
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    rows={2}
                    placeholder="Enter the correct value..."
                    className={`w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${ETHIOPIC_FIELDS.includes(selectedField) ? 'font-ethiopic' : ''}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">
                    Reason <span className="font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Why is this correction needed?"
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-xs text-destructive">{submitError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitCorrection}
                    disabled={submitting || !newValue.trim()}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit correction'}
                  </button>
                  <button
                    onClick={() => setCorrectionOpen(false)}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
