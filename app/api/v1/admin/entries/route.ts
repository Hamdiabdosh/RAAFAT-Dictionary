import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole('admin')
    if (!session) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const q = searchParams.get('q')?.trim() ?? ''
    const status = searchParams.get('status') ?? 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = 20
    const offset = (page - 1) * limit

    const where = {
      ...(q
        ? {
            OR: [
              { harari: { contains: q, mode: 'insensitive' as const } },
              { english: { contains: q, mode: 'insensitive' as const } },
              { amharic: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(status !== 'all'
        ? { status: status as 'verified' | 'pending_review' | 'rejected' }
        : {}),
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        select: {
          id: true,
          harari: true,
          english: true,
          amharic: true,
          status: true,
          category: true,
          source: true,
          createdAt: true,
          creator: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.entry.count({ where }),
    ])

    return NextResponse.json({
      entries: entries.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        createdBy: e.creator?.name ?? null,
        creator: undefined,
      })),
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
    console.error('[GET /api/v1/admin/entries]', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}
