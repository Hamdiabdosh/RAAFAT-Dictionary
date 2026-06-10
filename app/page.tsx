import { Suspense } from 'react'
import { Shell } from '@/components/layout/Shell'
import { SearchPage } from '@/components/pages/SearchPage'

export default function Home() {
  return (
    <Shell>
      <Suspense fallback={null}>
        <SearchPage />
      </Suspense>
    </Shell>
  )
}
