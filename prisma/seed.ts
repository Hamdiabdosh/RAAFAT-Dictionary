import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface MeshiaEntry {
  id: number
  harari: string
  english: string
  amharic: string
  oromo: string
  section: string
  page: number
  verified: boolean
}

async function main() {
  console.log('Reading Meshia dictionary data...')

  const raw = readFileSync(
    join(process.cwd(), 'meshia_dictionary.json'),
    'utf-8'
  )
  const entries: MeshiaEntry[] = JSON.parse(raw)

  console.log(`Seeding ${entries.length} entries...`)

  // Enable pg_trgm extension for full-text search
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)

  // Create trigram indexes for fast partial-match search
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_entries_harari_trgm
    ON entries USING gin (harari gin_trgm_ops);
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_entries_english_trgm
    ON entries USING gin (english gin_trgm_ops);
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_entries_amharic_trgm
    ON entries USING gin (amharic gin_trgm_ops);
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_entries_oromo_trgm
    ON entries USING gin (oromo gin_trgm_ops);
  `)

  // Batch insert in chunks of 500
  const CHUNK_SIZE = 500
  let inserted = 0

  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE)

    await prisma.entry.createMany({
      data: chunk.map((e) => ({
        harari: e.harari ?? '',
        english: e.english ?? '',
        amharic: e.amharic ?? '',
        oromo: e.oromo ?? '',
        category: e.section || null,
        source: `Meshia Dictionary, p. ${e.page}`,
        importRef: e.id,
        status: e.verified ? 'verified' : 'pending_review',
      })),
      skipDuplicates: true,
    })

    inserted += chunk.length
    console.log(`  ${inserted}/${entries.length} entries inserted...`)
  }

  console.log(`Done. ${entries.length} entries seeded.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
