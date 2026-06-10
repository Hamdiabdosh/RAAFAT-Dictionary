import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const notification = await prisma.notification.findUnique({ where: { id } })

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({
      notification: {
        id: updated.id,
        read: updated.read,
      },
    })
  } catch (error) {
    console.error('[PATCH /api/v1/notifications/:id]', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
