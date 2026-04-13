import { headers } from 'next/headers'

export async function getSession() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
    {
      headers: {
        cookie: (await headers()).get('cookie') ?? '',
      },
    }
  )

  if (!res.ok) return null
  return res.json()
}