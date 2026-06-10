'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { addToStudyList, getStudyList, removeFromStudyList, type StudyEntry } from '@/lib/study'

interface Props {
  entry: StudyEntry
  size?: number
  showLabel?: boolean
  className?: string
}

export function StudyBookmark({ entry, size = 18, showLabel = false, className = '' }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getStudyList().some((e) => e.id === entry.id))
    const sync = () => setSaved(getStudyList().some((e) => e.id === entry.id))
    window.addEventListener('study-list-updated', sync)
    return () => window.removeEventListener('study-list-updated', sync)
  }, [entry.id])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (saved) {
      removeFromStudyList(entry.id)
      setSaved(false)
    } else {
      addToStudyList(entry)
      setSaved(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={saved ? 'Remove from study list' : 'Add to study list'}
      className={`inline-flex items-center gap-1.5 p-2 rounded-md hover:bg-muted transition-colors ${className}`}
    >
      {saved ? (
        <BookmarkCheck size={size} className="text-primary" />
      ) : (
        <Bookmark size={size} className="text-muted-foreground" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">{saved ? 'Saved' : 'Save'}</span>
      )}
    </button>
  )
}
