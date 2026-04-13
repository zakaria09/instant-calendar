'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [session, isPending, router])

  if (isPending) return <div>Loading...</div>
  if (!session) return null

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Dashboard</h1>
      <p className="text-neutral-500 text-sm">Welcome back, {session.user.email}</p>
    </div>
  )
}