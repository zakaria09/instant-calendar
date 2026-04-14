'use client'

import { authClient } from '@/lib/auth-client'

export default function DashboardPage() {
  const { data: session } = authClient.useSession()

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Dashboard</h1>
      <p className="text-neutral-500 text-sm">Welcome back, {session?.user?.email}</p>
    </div>
  )
}