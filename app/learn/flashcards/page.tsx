import { Suspense } from 'react'
import { Shell } from '@/components/layout/Shell'
import { FlashcardsPage } from '@/components/pages/FlashcardsPage'

export default function Flashcards() {
  return (
    <Shell>
      <Suspense fallback={null}>
        <FlashcardsPage />
      </Suspense>
    </Shell>
  )
}
