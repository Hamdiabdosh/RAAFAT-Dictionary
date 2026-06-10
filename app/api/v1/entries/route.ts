import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { notifyReviewers } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const lang = searchParams.get('lang') ?? 'all'
  const category = searchParams.get('category')?.trim()
  const idsParam = searchParams.get('ids')?.trim()
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = idsParam ? 100 : 20
  const offset = (page - 1) * limit

  const entrySelect = {
    id: true,
    harari: true,
    english: true,
    amharic: true,
    oromo: true,
    category: true,
    partOfSpeech: true,
    exampleHarari: true,
    exampleEnglish: true,
    status: true,
    source: true,
  } as const

  try {
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean).slice(0, 100)
      const entries = await prisma.entry.findMany({
        where: { id: { in: ids } },
        select: entrySelect,
      })
      const order = new Map(ids.map((id, i) => [id, i]))
      entries.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      return NextResponse.json({
        entries,
        pagination: { page: 1, limit: entries.length, total: entries.length, totalPages: 1, hasNext: false, hasPrev: false },
      })
    }

    const searchWhere = q
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

    const where = {
      ...searchWhere,
      ...(category ? { category } : {}),
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        select: entrySelect,
        orderBy: [{ status: 'asc' }, { harari: 'asc' }],
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
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: 'You must be signed in to contribute' }, { status: 401 })
    }

    const body = await req.json()
    const {
      harari,
      english,
      amharic,
      oromo,
      category,
      partOfSpeech,
      exampleHarari,
      exampleEnglish,
    } = body

    if (!harari?.trim() || !english?.trim()) {
      return NextResponse.json(
        { error: 'harari and english are required' },
        { status: 400 }
      )
    }

    const entry = await prisma.entry.create({
      data: {
        harari: harari.trim(),
        english: english.trim(),
        amharic: amharic?.trim() ?? '',
        oromo: oromo?.trim() ?? '',
        category: category?.trim() || null,
        partOfSpeech: partOfSpeech || null,
        exampleHarari: exampleHarari?.trim() || null,
        exampleEnglish: exampleEnglish?.trim() || null,
        status: 'pending_review',
        createdBy: session.user.id,
        source: 'Community contribution',
      },
    })

    await notifyReviewers(
      `New entry submitted: "${entry.harari}" (${entry.english})`,
      '/review'
    )

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/v1/entries]', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}
