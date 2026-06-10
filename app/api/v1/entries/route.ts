import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const lang = searchParams.get('lang') ?? 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20
  const offset = (page - 1) * limit

  try {
    const where = q
      ? lang === 'all'
        ? {
            OR: [
              { harari: { contains: q, mode: 'insensitive' as const } },
              { english: { contains: q, mode: 'insensitive' as const } },
              { amharic: { contains: q, mode: 'insensitive' as const } },
              { oromo: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : lang === 'harari'
          ? { harari: { contains: q, mode: 'insensitive' as const } }
          : lang === 'english'
            ? { english: { contains: q, mode: 'insensitive' as const } }
            : lang === 'amharic'
              ? { amharic: { contains: q, mode: 'insensitive' as const } }
              : { oromo: { contains: q, mode: 'insensitive' as const } }
      : {}

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        select: {
          id: true,
          harari: true,
          english: true,
          amharic: true,
          oromo: true,
          category: true,
          partOfSpeech: true,
          status: true,
          source: true,
        },
        orderBy: [
          { status: 'asc' },
          { harari: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.entry.count({ where }),
    ])

    return NextResponse.json({
      entries,
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
    console.error('[GET /api/v1/entries]', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}
