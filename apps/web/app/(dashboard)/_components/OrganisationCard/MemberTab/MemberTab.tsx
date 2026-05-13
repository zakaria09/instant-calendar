import LoadingSpinner from '@/components/ui/loadingSpinner';
import {API_BASE} from '@/utils/constants';
import {orgStorage} from '@/utils/org-storage';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

const fetchOrg = async (organisationId: string) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/organisation/members/${organisationId}`,
    );
    if (!res.ok) {
      throw new Error('Failed to fetch organisation');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching organisation:', error);
    return null;
  }
};

type Member = {
  memberId: string;
  role: string;
  createdAt: string;
  name: string;
  email: string;
};

export default function MemberTab() {
  const org = orgStorage.get();

  const {data, isLoading} = useQuery<Member[]>({
    queryKey: ['organisation', org?.id],
    queryFn: () => fetchOrg(org!.id),
    enabled: !!org?.id,
  });
  return isLoading ? (
    <LoadingSpinner />
  ) : data?.length ? (
    <ul>
      {data.map((member) => (
        <li key={member.memberId} className='py-2'>
          <div className='flex items-center gap-2 px-6 py-2 border-2 border-slate-200 rounded-md'>
            <div className='flex flex-col'>
              <h3 className='text-lg font-semibold capitalize'>
                {member.name}
              </h3>
              <p className='text-sm text-neutral-500'>{member.email}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className='text-neutral-500'>No members yet.</p>
  );
}
