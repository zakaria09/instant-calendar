import AcceptInvite from '../../_components/AcceptInvite/AcceptInvite';

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  return <AcceptInvite invitationId={id} />;
}