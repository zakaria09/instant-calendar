'use client'

import Sidebar from '@/app/components/Sidebar/Sidebar'
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OrganisationProvider } from '../providers/organisationProvider'

type OnboardingStatus = {
  isOnboarded: boolean;
}

function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const { data, isLoading } = useQuery<OnboardingStatus>({
    queryKey: ['onboarding', session?.user.id],
    queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/status`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        );
        if (!res.ok) throw new Error('Failed to fetch onboarding status');
        return res.json(); 
      }
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [session, router, isPending]);


  useEffect(() => {
    if (data && !data.isOnboarded) {
      router.push('/onboarding')
    }
  }, [data, router]);

  if (isPending || isLoading) return <div>Loading...</div>
  if (!session) return null
  if (!data?.isOnboarded) return null


  return (
    <div className="flex h-screen bg-neutral-50 ">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
        <OrganisationProvider>
          {children}
        </OrganisationProvider>
      </main>
    </div>
  )
}

export default ProtectedLayout