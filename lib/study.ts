export interface StudyEntry {
  id: string
  harari: string
  english: string
  amharic?: string
  oromo?: string
  category?: string
}

const STORAGE_KEY = 'raafat-study-list'

export function getStudyList(): StudyEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStudyList(list: StudyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('study-list-updated'))
}

export function isInStudyList(id: string): boolean {
  return getStudyList().some((e) => e.id === id)
}

export function addToStudyList(entry: StudyEntry) {
  const list = getStudyList()
  if (list.some((e) => e.id === entry.id)) return list
  const next = [...list, entry]
  saveStudyList(next)
  return next
}

export function removeFromStudyList(id: string) {
  const next = getStudyList().filter((e) => e.id !== id)
  saveStudyList(next)
  return next
}

export function toggleStudyList(entry: StudyEntry): boolean {
  if (isInStudyList(entry.id)) {
    removeFromStudyList(entry.id)
    return false
  }
  addToStudyList(entry)
  return true
}

export function getStudyListShareUrl(): string {
  const ids = getStudyList().map((e) => e.id).join(',')
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/learn/flashcards?ids=${encodeURIComponent(ids)}`
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
