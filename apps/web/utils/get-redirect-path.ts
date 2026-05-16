import type { OnboardingStatus } from '@packages/types/src/onboarding.types'

export function getRedirectPath(
  status: OnboardingStatus | null
): string | null {
  if (!status) return null
  if (status.isOnboarded) return '/dashboard'
  if (status.pendingInvite) return `/invite/${status.pendingInvite.invitationId}`
  if (status.hasOrganisation) return '/onboarding/invitee'
  return '/onboarding'
}