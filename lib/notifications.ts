import { prisma } from '@/lib/db'

export type NotificationType =
  | 'suggestion_approved'
  | 'suggestion_rejected'
  | 'review_needed'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  message: string
  link?: string
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      link: input.link ?? null,
    },
  })
}

export async function notifyReviewers(message: string, link: string) {
  const reviewers = await prisma.user.findMany({
    where: { role: { in: ['reviewer', 'admin'] } },
    select: { id: true },
  })

  if (reviewers.length === 0) return

  await prisma.notification.createMany({
    data: reviewers.map((r) => ({
      userId: r.id,
      type: 'review_needed',
      message,
      link,
    })),
  })
}
