import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'
import { isValidSuggestionField } from '@/lib/suggestions'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('reviewer', 'admin')
    if (!session) {
      return NextResponse.json({ error: 'Reviewer access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const action = body.action as 'approve' | 'reject'

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
    }

    const suggestion = await prisma.suggestion.findUnique({ where: { id } })
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }
    if (suggestion.status !== 'pending') {
      return NextResponse.json({ error: 'Suggestion already resolved' }, { status: 409 })
    }

    if (action === 'reject') {
      const updated = await prisma.suggestion.update({
        where: { id },
        data: {
          status: 'rejected',
          resolvedAt: new Date(),
          resolvedBy: session.user.id,
        },
      })
      return NextResponse.json({ suggestion: updated })
    }

    if (!isValidSuggestionField(suggestion.fieldName)) {
      return NextResponse.json({ error: 'Invalid field on suggestion' }, { status: 400 })
    }

    const [updatedEntry, updatedSuggestion] = await prisma.$transaction([
      prisma.entry.update({
        where: { id: suggestion.entryId },
        data: { [suggestion.fieldName]: suggestion.newValue },
      }),
      prisma.suggestion.update({
        where: { id },
        data: {
          status: 'approved',
          resolvedAt: new Date(),
          resolvedBy: session.user.id,
        },
      }),
      prisma.user.update({
        where: { id: suggestion.userId },
        data: { reputation: { increment: 5 } },
      }),
    ])

    return NextResponse.json({ suggestion: updatedSuggestion, entry: updatedEntry })
  } catch (error) {
    console.error('[PATCH /api/v1/suggestions/:id]', error)
    return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 })
  }
}
