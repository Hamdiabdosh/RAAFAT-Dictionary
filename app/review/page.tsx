'use client'

import { Shell } from '@/components/layout/Shell'
import { ReviewQueuePage } from '@/components/pages/ReviewQueuePage'

export default function ReviewPage() {
  return (
    <Shell showSearch={true}>
      <ReviewQueuePage />
    </Shell>
  )
}
