'use client'

import React from 'react'
import Link from 'next/link'
import { DictionaryEntry } from '@/lib/types'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface EntryCardProps {
  entry: DictionaryEntry
}

export function EntryCard({ entry }: EntryCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusIcon = () => {
    switch (entry.status) {
      case 'verified':
        return <Check size={16} className="text-green-600" />
      case 'rejected':
        return <AlertCircle size={16} className="text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadgeColor = () => {
    switch (entry.status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  const translations = [
    { label: 'English', text: entry.english },
    { label: 'Amharic', text: entry.amharic, ethiopic: true },
    { label: 'Oromo', text: entry.oromo },
  ]

  return (
    <Link href={`/entry/${entry.id}`}>
      <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1 font-ethiopic">
                {entry.harari}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {entry.partOfSpeech}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
                {entry.status}
              </span>
            </div>
          </div>

          {/* Translations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {translations.slice(0, 2).map((translation, idx) => (
              <div
                key={idx}
                className="p-3 rounded-md bg-muted/30 border border-border/50"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {translation.label}
                </p>
                <p className={`text-sm font-medium text-foreground ${translation.ethiopic ? 'font-ethiopic' : ''}`}>
                  {translation.text}
                </p>
              </div>
            ))}
          </div>

          {/* Example */}
          {entry.exampleHarari && (
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Example:</p>
              <p className="text-sm text-foreground italic font-ethiopic">
                "{entry.exampleHarari}"
              </p>
              {entry.exampleEnglish && (
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.exampleEnglish}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-border/50">
            <button
              onClick={(e) => {
                e.preventDefault()
                handleCopy(entry.harari)
              }}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              title="Copy headword"
            >
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
