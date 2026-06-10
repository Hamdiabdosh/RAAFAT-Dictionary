'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchProfile } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { Loader2, Award, FileText, ThumbsUp, Shield } from 'lucide-react'

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  reputation: number
  createdAt: string
  _count: {
    suggestions: number
    entries: number
    votes: number
  }
}

export function ProfilePage() {
  const { data: session } = authClient.useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }
    fetchProfile()
      .then((data) => setProfile(data.user))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [session?.user])

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h1 className="text-2xl font-bold">Sign in to view your profile</h1>
        <Link href="/login" className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  if (error || !profile) {
    return <p className="text-center text-destructive py-16">{error ?? 'Profile not found'}</p>
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="text-muted-foreground">{profile.email}</p>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted capitalize">
          {profile.role}
        </span>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <Award className="mx-auto text-primary mb-2" size={32} />
        <p className="text-3xl font-bold text-primary">{profile.reputation}</p>
        <p className="text-sm text-muted-foreground">Reputation points</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card text-center">
          <FileText className="mx-auto text-muted-foreground mb-1" size={20} />
          <p className="text-xl font-bold">{profile._count.entries}</p>
          <p className="text-xs text-muted-foreground">Entries</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card text-center">
          <FileText className="mx-auto text-muted-foreground mb-1" size={20} />
          <p className="text-xl font-bold">{profile._count.suggestions}</p>
          <p className="text-xs text-muted-foreground">Suggestions</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card text-center">
          <ThumbsUp className="mx-auto text-muted-foreground mb-1" size={20} />
          <p className="text-xl font-bold">{profile._count.votes}</p>
          <p className="text-xs text-muted-foreground">Votes</p>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Member since {new Date(profile.createdAt).toLocaleDateString()}
      </p>

      {profile.role === 'admin' && (
        <Link
          href="/admin"
          className="flex items-center justify-center gap-2 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <Shield size={18} className="text-primary" />
          <span className="font-medium text-primary">Open admin dashboard</span>
        </Link>
      )}
    </div>
  )
}
