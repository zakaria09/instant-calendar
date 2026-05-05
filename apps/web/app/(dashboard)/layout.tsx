'use client'

import Sidebar from '@/app/components/Sidebar/Sidebar'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [onboarding, setOnboarding] = useState<{ userId: string; isOnboarded: boolean } | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [session, router, isPending])

  useEffect(() => {
    if (isPending || !session) return

    let isCancelled = false

    const checkOnboarding = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/status`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        )

        if (!res.ok) {
          if (!isCancelled) {
            setOnboarding({ userId: session.user.id, isOnboarded: false })
            router.push('/onboarding')
          }
          return
        }

        const data = (await res.json()) as { isOnboarded?: boolean }
        const onboarded = Boolean(data?.isOnboarded)

        if (!isCancelled) {
          setOnboarding({ userId: session.user.id, isOnboarded: onboarded })

          if (!onboarded) {
            router.push('/onboarding')
          }
        }
      } catch {
        if (!isCancelled) {
          setOnboarding({ userId: session.user.id, isOnboarded: false })
          router.push('/onboarding')
        }
      }
    }

    checkOnboarding()

    return () => {
      isCancelled = true
    }
  }, [session, isPending, router])

  const sessionUserId = session?.user?.id ?? null
  const isOnboardingPending = Boolean(sessionUserId) && onboarding?.userId !== sessionUserId
  const isOnboarded = Boolean(sessionUserId && onboarding?.userId === sessionUserId && onboarding?.isOnboarded)

  if (isPending || isOnboardingPending) return <div>Loading...</div>
  if (!session) return null
  if (!isOnboarded) return null

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