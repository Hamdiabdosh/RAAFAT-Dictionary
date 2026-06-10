import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-utils'

export async function GET() {
  try {
    const session = await requireRole('admin')
    if (!session) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const [
      totalEntries,
      verifiedEntries,
      pendingEntries,
      rejectedEntries,
      totalUsers,
      contributors,
      reviewers,
      admins,
      pendingSuggestions,
      totalSuggestions,
    ] = await Promise.all([
      prisma.entry.count(),
      prisma.entry.count({ where: { status: 'verified' } }),
      prisma.entry.count({ where: { status: 'pending_review' } }),
      prisma.entry.count({ where: { status: 'rejected' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'contributor' } }),
      prisma.user.count({ where: { role: 'reviewer' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.suggestion.count({ where: { status: 'pending' } }),
      prisma.suggestion.count(),
    ])

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      entries: {
        total: totalEntries,
        verified: verifiedEntries,
        pending: pendingEntries,
        rejected: rejectedEntries,
      },
      users: {
        total: totalUsers,
        contributors,
        reviewers,
        admins,
      },
      suggestions: {
        total: totalSuggestions,
        pending: pendingSuggestions,
      },
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[GET /api/v1/admin/stats]', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
