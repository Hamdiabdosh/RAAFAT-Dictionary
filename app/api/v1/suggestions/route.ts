import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
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

    const validFields = ['harari', 'english', 'amharic', 'oromo', 'exampleHarari', 'exampleEnglish']
    if (!validFields.includes(fieldName)) {
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
    return NextResponse.json(
      { error: 'Failed to submit suggestion' },
      { status: 500 }
    )
  }
}
