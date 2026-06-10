import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { isAdmin } from '@/lib/auth-utils'
import { AdminShell } from '@/components/layout/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const role = (session.user as { role?: string }).role
  if (!isAdmin(role)) {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
