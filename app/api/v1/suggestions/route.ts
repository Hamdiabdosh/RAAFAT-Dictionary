import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { aggregateVotes, isValidSuggestionField } from '@/lib/suggestions'

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole('reviewer', 'admin')
    if (!session) {
      return NextResponse.json({ error: 'Reviewer access required' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') ?? 'pending'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = 20
    const offset = (page - 1) * limit

    const where =
      status === 'all' ? {} : { status: status as 'pending' | 'approved' | 'rejected' }

    const [rows, total] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        include: {
          submitter: { select: { name: true } },
          entry: { select: { harari: true } },
          votes: { select: { voteType: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.suggestion.count({ where }),
    ])

    const suggestions = rows.map((s) => ({
      id: s.id,
      entryId: s.entryId,
      entryHarari: s.entry.harari,
      fieldName: s.fieldName,
      oldValue: s.oldValue,
      newValue: s.newValue,
      submittedBy: s.submitter.name,
      status: s.status,
      votes: aggregateVotes(s.votes),
      createdAt: s.createdAt.toISOString(),
    }))

    return NextResponse.json({
      suggestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('[GET /api/v1/suggestions]', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a correction' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { entryId, fieldName, oldValue, newValue } = body

    if (!entryId || !fieldName || !newValue?.trim()) {
      return NextResponse.json(
        { error: 'entryId, fieldName, and newValue are required' },
        { status: 400 }
      )
    }

    if (!isValidSuggestionField(fieldName)) {
      return NextResponse.json({ error: 'Invalid fieldName' }, { status: 400 })
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        entryId,
        fieldName,
        oldValue: oldValue ?? '',
        newValue: newValue.trim(),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ suggestion }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/v1/suggestions]', error)
    return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 })
  }
}
