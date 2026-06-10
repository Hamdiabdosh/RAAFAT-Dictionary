import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'

const EXPORT_FIELDS = [
  'id',
  'harari',
  'english',
  'amharic',
  'oromo',
  'category',
  'partOfSpeech',
  'exampleHarari',
  'exampleEnglish',
  'status',
  'source',
  'importRef',
  'createdAt',
  'updatedAt',
] as const

function escapeCsv(value: string | number | null | undefined) {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole('admin')
    if (!session) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const format = req.nextUrl.searchParams.get('format') ?? 'json'
    const status = req.nextUrl.searchParams.get('status') ?? 'verified'

    const where =
      status === 'all'
        ? {}
        : { status: status as 'verified' | 'pending_review' | 'rejected' }

    const entries = await prisma.entry.findMany({
      where,
      orderBy: { harari: 'asc' },
      select: {
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
        importRef: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const timestamp = new Date().toISOString().slice(0, 10)

    if (format === 'csv') {
      const header = EXPORT_FIELDS.join(',')
      const rows = entries.map((entry) =>
        EXPORT_FIELDS.map((field) => {
          const value = entry[field]
          if (value instanceof Date) return escapeCsv(value.toISOString())
          return escapeCsv(value)
        }).join(',')
      )
      const csv = [header, ...rows].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="raafat-dictionary-${timestamp}.csv"`,
        },
      })
    }

    return NextResponse.json(
      {
        exportedAt: new Date().toISOString(),
        count: entries.length,
        status,
        entries,
      },
      {
        headers: {
          'Content-Disposition': `attachment; filename="raafat-dictionary-${timestamp}.json"`,
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/v1/admin/export]', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
