export type UserRole = 'contributor' | 'reviewer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  reputation: number
  createdAt: Date
  avatar?: string
}

export type EntryStatus = 'verified' | 'pending_review' | 'rejected'

export interface DictionaryEntry {
  id: string
  harari: string
  english: string
  amharic: string
  oromo: string
  category?: string
  partOfSpeech?: string
  exampleHarari?: string
  exampleEnglish?: string
  status: EntryStatus
  source?: string
  importRef?: number
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected'
export type VoteType = 'correct' | 'incorrect' | 'needs_discussion'

export interface Suggestion {
  id: string
  entryId: string
  fieldName: keyof Pick<DictionaryEntry, 'harari' | 'english' | 'amharic' | 'oromo' | 'exampleHarari' | 'exampleEnglish'>
  oldValue: string
  newValue: string
  submittedBy: string
  status: SuggestionStatus
  votes: { correct: number; incorrect: number; needs_discussion: number }
  createdAt: Date
}
