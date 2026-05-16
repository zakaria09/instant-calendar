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

type PendingInvite = {
  invitationId: string
  organizationId: string
  organizationName: string
  role: string | null
}

type OnboardingStatus = {
  isOnboarded: boolean
  hasOrganisation: boolean
  pendingInvite: PendingInvite | null
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

export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
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

  return res.json()
}