import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'

async function InviteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 ">
      {children}
    </div>
  )
}

export default InviteLayout