'use client';

import LoadingSpinner from '@/components/ui/loadingSpinner';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

type Invitation = {
  id?: string;
  email?: string;
  role?: string;
  status?: string;
};

const fetchInvitations = async (organisationId: string) => {
  try {
    const { data, error } = await authClient.organization.listInvitations({
      query: {
        organizationId: organisationId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to fetch invitations');
    }

    return (data ?? []) as Invitation[];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return null;
  }
};

export default function InvitationsTab({ organisationId }: { organisationId?: string }) {
  const { data, isLoading } = useQuery<Invitation[] | null>({
    queryKey: ['organisation-invitations', organisationId],
    queryFn: () => fetchInvitations(organisationId!),
    enabled: !!organisationId,
  });

  return isLoading ? (
    <LoadingSpinner />
  ) : data?.length ? (
    <ul>
      {data.map((invitation, index) => (
        <li key={invitation.id ?? `${invitation.email}-${index}`} className='py-2'>
          <div className='flex items-center gap-2 px-6 py-2 border-2 border-slate-200 rounded-md'>
            <div className='flex flex-col'>
              <h3 className='text-lg font-semibold'>
                {invitation.email ?? 'Unknown email'}
              </h3>
              <p className='text-sm text-neutral-500 capitalize'>
                {invitation.role ?? 'member'}
                {invitation.status ? ` • ${invitation.status}` : ''}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className='text-neutral-500'>No pending invites.</p>
  );
}
