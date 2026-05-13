import {API_BASE} from '@/utils/constants';
import {useQuery} from '@tanstack/react-query';

const fetchUserOrganisation = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/organisation/me`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organisation');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching organisation:', error);
    return null;
  }
};

export default function useUserOrganisation() {
  const {data: organisation, isLoading: isLoadingOrganisation} = useQuery({
    queryKey: ['userOrganisation'],
    queryFn: fetchUserOrganisation,
  });

  return {organisation, isLoadingOrganisation};
}