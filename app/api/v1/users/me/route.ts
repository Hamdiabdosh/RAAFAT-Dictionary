import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        reputation: true,
        createdAt: true,
        _count: {
          select: {
            suggestions: true,
            entries: true,
            votes: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[GET /api/v1/users/me]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
