'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { fetchCategories } from '@/lib/api'

export function TopicsPage() {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to Learn
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse by letter</h1>
        <p className="text-muted-foreground">
          Words are grouped by their first Harari letter — use these as lesson topics.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/learn/topics/${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span className="text-3xl font-bold font-ethiopic text-primary">{cat.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{cat.count} words</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
