import { headers } from 'next/headers'

interface Session {
  session: {
    id: string
    token: string
    userId: string
    activeOrganizationId: string | null
    expiresAt: string
    createdAt: string
    updatedAt: string
    ipAddress: string
    userAgent: string
  }
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: string
    updatedAt: string
  }
}

export async function getSession(): Promise<Session | null>  {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/get-session`,
    {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        cookie: (await headers()).get('cookie') ?? '',
      },
    }
  )

  if (!res.ok) return null
  return res.json()
}

export async function getOnboardingStatus() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/status`,
    {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        cookie: (await headers()).get('cookie') ?? '',
      },
    }
  )

  if (!res.ok) return null

  const data = (await res.json()) as { isOnboarded?: boolean }
  return { isOnboarded: Boolean(data?.isOnboarded) }
}