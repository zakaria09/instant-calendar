import { headers } from 'next/headers'

export async function getSession() {
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