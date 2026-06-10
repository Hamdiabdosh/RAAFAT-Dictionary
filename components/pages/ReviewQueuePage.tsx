'use client'

import React, { useState } from 'react'
import { Suggestion } from '@/lib/types'
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

interface SuggestionCardProps {
  suggestion: Suggestion
  onVote: (id: string, type: 'correct' | 'incorrect') => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function SuggestionCard({
  suggestion,
  onVote,
  onApprove,
  onReject,
}: SuggestionCardProps) {
  return (
    <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              Entry {suggestion.entryId}
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {suggestion.fieldName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Suggested by <span className="font-medium text-foreground">{suggestion.submittedBy}</span>
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          suggestion.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : suggestion.status === 'approved'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {suggestion.status}
        </span>
      </div>

      {/* Diff View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Old Value */}
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-xs text-muted-foreground mb-2">Current</p>
          <p className={`text-sm text-foreground ${suggestion.fieldName === 'harari' || suggestion.fieldName === 'amharic' || suggestion.fieldName === 'exampleHarari' ? 'font-ethiopic' : ''}`}>
            {suggestion.oldValue}
          </p>
        </div>

        {/* New Value */}
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
          <p className="text-xs text-muted-foreground mb-2">Suggested</p>
          <p className={`text-sm text-foreground ${suggestion.fieldName === 'harari' || suggestion.fieldName === 'amharic' || suggestion.fieldName === 'exampleHarari' ? 'font-ethiopic' : ''}`}>
            {suggestion.newValue}
          </p>
        </div>
      </div>

      {/* Vote Bar */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-muted">
          <ThumbsUp size={16} className="text-green-600" />
          <span className="text-sm font-medium text-foreground">{suggestion.votes.correct}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-muted">
          <ThumbsDown size={16} className="text-red-600" />
          <span className="text-sm font-medium text-foreground">{suggestion.votes.incorrect}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {suggestion.votes.needs_discussion} need discussion
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <button
          onClick={() => onApprove(suggestion.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
        >
          <CheckCircle size={18} />
          Approve
        </button>
        <button
          onClick={() => onReject(suggestion.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
        >
          <XCircle size={18} />
          Reject
        </button>
        <button
          onClick={() => onVote(suggestion.id, 'correct')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
        >
          <ThumbsUp size={18} />
        </button>
        <button
          onClick={() => onVote(suggestion.id, 'incorrect')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
        >
          <ThumbsDown size={18} />
        </button>
      </div>
    </div>
  )
}

export function ReviewQueuePage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const filteredSuggestions = suggestions.filter((s) =>
    filterStatus === 'all' ? true : s.status === filterStatus
  )

  const handleApprove = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
    )
  }

  const handleReject = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s))
    )
  }

  const handleVote = (id: string, type: 'correct' | 'incorrect') => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, votes: { ...s.votes, [type]: s.votes[type] + 1 } }
          : s
      )
    )
  }

  const totalVotes = suggestions.reduce(
    (sum, s) => sum + s.votes.correct + s.votes.incorrect + s.votes.needs_discussion,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Review Queue</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve community contributions to the dictionary
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-primary">
              {suggestions.filter((s) => s.status === 'pending').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {suggestions.filter((s) => s.status === 'approved').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {suggestions.filter((s) => s.status === 'rejected').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Votes</p>
            <p className="text-2xl font-bold text-blue-600">{totalVotes}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as typeof filterStatus)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All Suggestions' : `${status.charAt(0).toUpperCase() + status.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onVote={handleVote}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="text-center py-12 p-6 rounded-lg bg-card border border-border">
            <MessageSquare size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-lg">
              No suggestions to review at this time
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
