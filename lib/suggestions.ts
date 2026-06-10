import type { VoteType } from '@/lib/types'

const ENTRY_FIELDS = [
  'harari',
  'english',
  'amharic',
  'oromo',
  'exampleHarari',
  'exampleEnglish',
] as const

export type SuggestionFieldName = (typeof ENTRY_FIELDS)[number]

export function isValidSuggestionField(field: string): field is SuggestionFieldName {
  return (ENTRY_FIELDS as readonly string[]).includes(field)
}

export function aggregateVotes(votes: { voteType: VoteType }[]) {
  return votes.reduce(
    (acc, v) => {
      acc[v.voteType] += 1
      return acc
    },
    { correct: 0, incorrect: 0, needs_discussion: 0 }
  )
}
