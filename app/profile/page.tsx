import { Shell } from '@/components/layout/Shell'
import { ProfilePage } from '@/components/pages/ProfilePage'

export default function Profile() {
  return (
    <Shell showSearch={false}>
      <ProfilePage />
    </Shell>
  )
}
