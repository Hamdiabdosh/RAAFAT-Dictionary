import { Suspense } from 'react'
import { AdminEntriesPage } from '@/components/pages/admin/AdminEntriesPage'

export default function AdminEntries() {
  return (
    <Suspense fallback={null}>
      <AdminEntriesPage />
    </Suspense>
  )
}
