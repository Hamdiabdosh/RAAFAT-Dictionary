import { DictionaryEntry } from '@/lib/types'

/**
 * Perform a fuzzy search on dictionary entries
 */
export function fuzzySearch(
  entries: DictionaryEntry[],
  query: string,
  options: {
    searchFields?: ('harari' | 'translations' | 'examples')[]
    caseSensitive?: boolean
    maxResults?: number
  } = {}
): DictionaryEntry[] {
  const {
    searchFields = ['harari', 'translations', 'examples'],
    caseSensitive = false,
    maxResults = 50,
  } = options

  if (!query.trim()) {
    return entries.slice(0, maxResults)
  }

  const searchQuery = caseSensitive ? query : query.toLowerCase()

  const scored = entries
    .map((entry) => {
      let score = 0

      // Search harari headword
      if (searchFields.includes('harari')) {
        const harari = caseSensitive ? entry.harari : entry.harari.toLowerCase()
        if (harari === searchQuery) score += 100
        if (harari.includes(searchQuery)) score += 50
        if (levenshteinDistance(harari, searchQuery) <= 2) score += 25
      }

      // Search translations
      if (searchFields.includes('translations')) {
        for (const text of [entry.english, entry.amharic, entry.oromo]) {
          const normalized = caseSensitive ? text : text.toLowerCase()
          if (normalized === searchQuery) score += 80
          if (normalized.includes(searchQuery)) score += 40
        }
      }

      // Search examples
      if (searchFields.includes('examples')) {
        if (entry.exampleHarari) {
          const text = caseSensitive ? entry.exampleHarari : entry.exampleHarari.toLowerCase()
          if (text.includes(searchQuery)) score += 20
        }
        if (entry.exampleEnglish) {
          const text = caseSensitive ? entry.exampleEnglish : entry.exampleEnglish.toLowerCase()
          if (text.includes(searchQuery)) score += 20
        }
      }

      return { entry, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  return scored.map((item) => item.entry)
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[len2][len1]
}

/**
 * Filter entries by multiple criteria
 */
export function filterEntries(
  entries: DictionaryEntry[],
  filters: {
    language?: 'en' | 'am' | 'om' | 'gk'
    partOfSpeech?: string
    status?: 'verified' | 'pending_review' | 'rejected'
  }
): DictionaryEntry[] {
  return entries.filter((entry) => {
    if (filters.language) {
      const hasLanguage =
        (filters.language === 'en' && entry.english) ||
        (filters.language === 'am' && entry.amharic) ||
        (filters.language === 'om' && entry.oromo) ||
        (filters.language === 'gk' && entry.harari)
      if (!hasLanguage) return false
    }

    if (filters.partOfSpeech && entry.partOfSpeech !== filters.partOfSpeech) {
      return false
    }

    if (filters.status && entry.status !== filters.status) {
      return false
    }

    return true
  })
}

/**
 * Sort entries by various criteria
 */
export function sortEntries(
  entries: DictionaryEntry[],
  sortBy: 'relevance' | 'recent' | 'alphabetical' = 'relevance',
  order: 'asc' | 'desc' = 'desc'
): DictionaryEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'recent':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'alphabetical':
        comparison = a.harari.localeCompare(b.harari)
        break
      case 'relevance':
      default:
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}
