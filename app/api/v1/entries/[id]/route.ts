import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        suggestions: {
          where: { status: 'pending' },
          select: {
            id: true,
            fieldName: true,
            oldValue: true,
            newValue: true,
            status: true,
            createdAt: true,
            submitter: { select: { name: true } },
            votes: { select: { voteType: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('[GET /api/v1/entries/:id]', error)
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    )
  }
}
