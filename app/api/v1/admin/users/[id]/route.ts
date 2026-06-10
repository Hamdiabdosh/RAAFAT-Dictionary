import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'
import type { UserRole } from '@/lib/types'

const VALID_ROLES: UserRole[] = ['contributor', 'reviewer', 'admin']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('admin')
    if (!session) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { role, reputation } = body

    if (id === session.user.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 })
    }

    const data: { role?: UserRole; reputation?: number } = {}
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      data.role = role
    }
    if (reputation !== undefined) {
      const rep = parseInt(String(reputation))
      if (isNaN(rep) || rep < 0) {
        return NextResponse.json({ error: 'Invalid reputation' }, { status: 400 })
      }
      data.reputation = rep
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        reputation: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[PATCH /api/v1/admin/users/:id]', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
