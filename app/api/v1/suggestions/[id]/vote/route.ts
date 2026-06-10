import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'
import { aggregateVotes } from '@/lib/suggestions'
import type { VoteType } from '@/lib/types'

const VALID_VOTES: VoteType[] = ['correct', 'incorrect', 'needs_discussion']

export async function POST(
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
    const voteType = body.voteType as VoteType

    if (!VALID_VOTES.includes(voteType)) {
      return NextResponse.json({ error: 'Invalid voteType' }, { status: 400 })
    }

    const suggestion = await prisma.suggestion.findUnique({ where: { id } })
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }

    await prisma.vote.upsert({
      where: {
        suggestionId_userId: {
          suggestionId: id,
          userId: session.user.id,
        },
      },
      create: {
        suggestionId: id,
        userId: session.user.id,
        voteType,
      },
      update: { voteType },
    })

    const votes = await prisma.vote.findMany({
      where: { suggestionId: id },
      select: { voteType: true },
    })

    return NextResponse.json({ votes: aggregateVotes(votes) })
  } catch (error) {
    console.error('[POST /api/v1/suggestions/:id/vote]', error)
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }
}
