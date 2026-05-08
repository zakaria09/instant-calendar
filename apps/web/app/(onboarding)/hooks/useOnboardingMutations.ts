import { useMutation, useQuery } from '@tanstack/react-query';
import { DayKey } from './useOnboardingForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

type SlugAvailabilityResponse = {
  status: boolean;
};

export function useOnboardingMutations() {
  const saveProfileMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/api/onboarding/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save profile');
      }

      return res.json();
    },
  });

  const saveAvailabilityMutation = useMutation({
    mutationFn: async (availability: Array<{ day: DayKey; startTime: string; endTime: string }>) => {
      const res = await fetch(`${API_BASE}/api/onboarding/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ availability }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save availability');
      }

      return res.json();
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async ({ orgName, orgSlug }: { orgName: string; orgSlug: string }) => {
      const res = await fetch(`${API_BASE}/api/onboarding/organisation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orgName, orgSlug }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const error = new Error(data?.error || 'Something went wrong') as Error & { status?: number };
        error.status = res.status;
        throw error;
      }

      return res.json();
    },
  });

  return {
    saveProfileMutation,
    saveAvailabilityMutation,
    completeOnboardingMutation,
  };
}

export function useSlugAvailability(slug: string, enabled: boolean) {
  return useQuery<SlugAvailabilityResponse>({
    queryKey: ['onboarding', 'slug', slug],
    enabled: enabled && slug.length > 0,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/onboarding/check-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        throw new Error('Failed to check slug availability');
      }

      return res.json();
    },
  });
}
