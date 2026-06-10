import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'

const VALID_STATUSES = ['verified', 'pending_review', 'rejected'] as const

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
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'status must be verified, pending_review, or rejected' },
        { status: 400 }
      )
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        harari: true,
        english: true,
        status: true,
      },
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('[PATCH /api/v1/admin/entries/:id]', error)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('admin')
    if (!session) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    await prisma.entry.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/v1/admin/entries/:id]', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
