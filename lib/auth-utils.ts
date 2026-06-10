import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import type { UserRole } from '@/lib/types'

type AuthUser = {
  id: string
  name: string
  email: string
  role?: string
  reputation?: number
}

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function requireAuth() {
  const session = await getAuthSession()
  if (!session?.user) return null
  return session
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth()
  if (!session) return null
  const role = (session.user as AuthUser).role as UserRole | undefined
  if (!role || !roles.includes(role)) return null
  return session
}

export function isReviewer(role?: string) {
  return role === 'reviewer' || role === 'admin'
}
