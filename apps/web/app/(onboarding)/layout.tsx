import { redirect } from 'next/navigation'
import { getOnboardingStatus, getSession } from '@/lib/auth-server'

async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/signin')
  }

  const onboardingStatus = await getOnboardingStatus()

  if (onboardingStatus?.isOnboarded) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950">
      {children}
    </div>
  )
}

export default OnboardingLayout