import { NextRequest, NextResponse } from 'next/server'
import { getRedirectPath } from '@/utils/get-redirect-path'

const publicRoutes = ['/', '/signin', '/invite', '/book']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Check session
  const sessionRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
    {
      headers: { cookie: req.headers.get('cookie') ?? '' },
    }
  )

  if (!sessionRes.ok) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Single call for all routing decisions
  const statusRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/status`,
    {
      headers: { cookie: req.headers.get('cookie') ?? '' },
    }
  )

  if (!statusRes.ok) {
    return NextResponse.next()
  }

  const status = await statusRes.json()
  const redirectPath = getRedirectPath(status)

  // Prevent redirect loops — only redirect if we're not already there
  if (redirectPath && pathname !== redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}