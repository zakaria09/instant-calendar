import OrganisationOnboard from '@/app/(invite)/_components/OrganisationOnboard/OrganisationOnboard';
import React from 'react'

export default async function OrganisationOnboarding({
  params,
}: {
  params: Promise<{inviteId: string}>;
}) {
  const {inviteId} = await params;
  return <OrganisationOnboard inviteId={inviteId} />;
}
