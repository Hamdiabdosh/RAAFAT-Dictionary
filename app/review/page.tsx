import { redirect } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { ReviewQueuePage } from '@/components/pages/ReviewQueuePage'
import { getSession } from '@/lib/auth-server'
import { isReviewer } from '@/lib/auth-utils'

export default async function ReviewPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const role = (session.user as { role?: string }).role
  if (!isReviewer(role)) {
    redirect('/')
  }

  return (
    <Shell>
      <ReviewQueuePage />
    </Shell>
  )
}
