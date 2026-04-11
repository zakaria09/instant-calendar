'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  if (isPending) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-medium mb-2">Welcome back!</h1>
        <p className="text-gray-500">{session.user.email}</p>
        <button
          onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/sign-in') } })}
          className="mt-6 border rounded px-4 py-2 text-sm hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}