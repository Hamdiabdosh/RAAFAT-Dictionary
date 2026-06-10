import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Shell } from '@/components/layout/Shell'
import { EntryDetailPage } from '@/components/pages/EntryDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const entry = await prisma.entry.findUnique({
    where: { id },
    select: { harari: true, english: true },
  })
  if (!entry) return { title: 'Not Found' }
  return {
    title: `${entry.harari} — RAAFAT Dictionary`,
    description: `Harari word: ${entry.harari}. English: ${entry.english}`,
  }
}

export default async function EntryPage({ params }: Props) {
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

  if (!entry) notFound()

  const serializedEntry = {
    id: entry.id,
    harari: entry.harari,
    english: entry.english,
    amharic: entry.amharic,
    oromo: entry.oromo,
    category: entry.category,
    partOfSpeech: entry.partOfSpeech,
    exampleHarari: entry.exampleHarari,
    exampleEnglish: entry.exampleEnglish,
    status: entry.status,
    source: entry.source,
    suggestions: entry.suggestions.map((s) => ({
      id: s.id,
      fieldName: s.fieldName,
      oldValue: s.oldValue,
      newValue: s.newValue,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      submitter: s.submitter,
      votes: s.votes.map((v) => ({ voteType: v.voteType })),
    })),
  }

  return (
    <Shell showSearch={false}>
      <Suspense fallback={null}>
        <EntryDetailPage entry={serializedEntry} />
      </Suspense>
    </Shell>
  )
}
