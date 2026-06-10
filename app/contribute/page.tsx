'use client'

import { Shell } from '@/components/layout/Shell'
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { createEntry } from '@/lib/api'

const DRAFT_KEY = 'raafat-contribute-draft'

const emptyForm = {
  harari: '',
  english: '',
  amharic: '',
  oromo: '',
  partOfSpeech: 'noun',
  category: '',
  exampleHarari: '',
  exampleEnglish: '',
}

export default function ContributePage() {
  const { data: session } = authClient.useSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        setFormData({ ...emptyForm, ...JSON.parse(saved) })
        setDraftRestored(true)
      }
    } catch {
      // ignore corrupt draft
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return
    const hasContent =
      formData.harari ||
      formData.english ||
      formData.amharic ||
      formData.oromo ||
      formData.category ||
      formData.exampleHarari ||
      formData.exampleEnglish
    if (!hasContent) {
      localStorage.removeItem(DRAFT_KEY)
      return
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
  }, [formData, session?.user])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await createEntry(formData)
      setSuccess(true)
      setFormData(emptyForm)
      localStorage.removeItem(DRAFT_KEY)
      setDraftRestored(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.user) {
    return (
      <Shell>
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <h1 className="text-2xl font-bold">Sign in to contribute</h1>
          <p className="text-muted-foreground">
            You need an account to add new words to the dictionary.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            Sign In
          </Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Contribute to RAAFAT</h1>
          <p className="text-muted-foreground">
            Add a new word to the dictionary — it will be reviewed before publication
          </p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex gap-3">
          <AlertCircle className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            New entries are saved with status <strong>pending review</strong> and reviewed by moderators.
          </p>
        </div>

        {draftRestored && !success && (
          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground text-center">
            Restored your saved draft
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex gap-3">
            <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            <p className="text-sm text-green-800 dark:text-green-200">
              Thank you! Your entry has been submitted for review.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Harari word *</label>
            <input
              type="text"
              name="harari"
              value={formData.harari}
              onChange={handleInputChange}
              placeholder="ጀዶ"
              required
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-ethiopic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Part of speech</label>
            <select
              name="partOfSpeech"
              value={formData.partOfSpeech}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">English *</label>
              <input
                type="text"
                name="english"
                value={formData.english}
                onChange={handleInputChange}
                placeholder="hand"
                required
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amharic</label>
              <input
                type="text"
                name="amharic"
                value={formData.amharic}
                onChange={handleInputChange}
                placeholder="እጅ"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-ethiopic"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Oromo</label>
              <input
                type="text"
                name="oromo"
                value={formData.oromo}
                onChange={handleInputChange}
                placeholder="harka"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="body"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Example (Harari)</label>
            <textarea
              name="exampleHarari"
              value={formData.exampleHarari}
              onChange={handleInputChange}
              placeholder="ጀዶ ሪ ማዕመር"
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-ethiopic resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Example (English)</label>
            <input
              type="text"
              name="exampleEnglish"
              value={formData.exampleEnglish}
              onChange={handleInputChange}
              placeholder="The hand is beautiful"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium disabled:opacity-50"
          >
            <Plus size={18} />
            {submitting ? 'Submitting...' : 'Submit Entry'}
          </button>
        </form>
      </div>
    </Shell>
  )
}
