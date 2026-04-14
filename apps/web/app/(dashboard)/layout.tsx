'use client'

import Sidebar from '@/app/components/Sidebar/Sidebar'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  console.log('Session in ProtectedLayout:', session, isPending) // Debugging line to check session data

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [session, isPending, router])

  if (isPending) return <div>Loading...</div>
  if (!session) return null

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}

export default ProtectedLayout