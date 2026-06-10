import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const ENTRY_SELECT = {
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
} as const

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const count = Math.min(50, Math.max(1, parseInt(searchParams.get('count') ?? '10')))
  const category = searchParams.get('category')?.trim()

  try {
    const where = {
      status: 'verified' as const,
      ...(category ? { category } : {}),
    }

    const total = await prisma.entry.count({ where })
    if (total === 0) {
      return NextResponse.json({ entries: [] })
    }

    const take = Math.min(count, total)
    const skip = total > take ? Math.floor(Math.random() * (total - take)) : 0

    const entries = await prisma.entry.findMany({
      where,
      select: ENTRY_SELECT,
      skip,
      take,
      orderBy: { harari: 'asc' },
    })

    // Shuffle so consecutive DB order doesn't leak into quiz options
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[entries[i], entries[j]] = [entries[j], entries[i]]
    }

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('[GET /api/v1/entries/random]', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}
