import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const rows = await prisma.entry.groupBy({
      by: ['category'],
      where: { category: { not: null } },
      _count: { id: true },
      orderBy: { category: 'asc' },
    })

    const categories = rows
      .filter((r) => r.category)
      .map((r) => ({
        name: r.category as string,
        count: r._count.id,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('[GET /api/v1/categories]', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
