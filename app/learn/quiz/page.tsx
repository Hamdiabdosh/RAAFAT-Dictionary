import { Suspense } from 'react'
import { Shell } from '@/components/layout/Shell'
import { QuizPage } from '@/components/pages/QuizPage'

export default function Quiz() {
  return (
    <Shell>
      <Suspense fallback={null}>
        <QuizPage />
      </Suspense>
    </Shell>
  )
}
