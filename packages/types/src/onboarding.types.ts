export type PendingInvite = {
  invitationId: string
  organizationId: string
  organizationName: string
  role: string | null
}

 export type OnboardingStatus = {
  isOnboarded: boolean
  hasOrganisation: boolean
  pendingInvite: PendingInvite | null
}