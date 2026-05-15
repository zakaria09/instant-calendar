'use client';
import { authClient } from '@/lib/auth-client';
import { API_BASE } from '@/utils/constants';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import Stepper from '@/app/components/Stepper/Stepper';
import Spinner from '@/components/ui/loadingSpinner';
import { useInviteeOnboardingForm, InviteeOnboardingSteps } from '@/app/(onboarding)/hooks/useInviteeOnboardingForm';
import { DAYS, DayKey } from '@/app/(onboarding)/hooks/useOnboardingForm'
import { NameStep } from '@/app/(onboarding)/_components/steps/NameStep';
import { AvailabilityStep } from '@/app/(onboarding)/_components/steps/AvailabilityStep';
import { WelcomeStep } from '@/app/(onboarding)/_components/steps/WelcomeStep';

type OrganisationOnboardProps = {
  inviteId: string;
};

const fetchOrganisation = async (organisationId: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/organisation/${organisationId}`, {
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

const STEPS = ['Welcome', 'Your Name', 'Availability'];

const subtitles: Record<InviteeOnboardingSteps, string> = {
  [InviteeOnboardingSteps.Welcome]: 'Welcome to your new team',
  [InviteeOnboardingSteps.Name]: "Let's start with your name",
  [InviteeOnboardingSteps.Availability]: 'Set your typical working hours',
};

export default function OrganisationOnboard({ inviteId }: OrganisationOnboardProps) {
  const router = useRouter();
  const form = useInviteeOnboardingForm();

  const { data: invitation, isLoading: isLoadingInvite } = useQuery({
    queryKey: ['organisation-onboard', inviteId],
    queryFn: async () =>
      await authClient.organization.getInvitation({
        query: {
          id: inviteId,
        },
      }),
    enabled: !!inviteId,
  });

  const { data: organisation, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['organisation', invitation?.data?.organizationId],
    queryFn: () => fetchOrganisation(invitation!.data!.organizationId),
    enabled: !!invitation?.data?.organizationId,
  });

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
    mutationFn: async (availability: Array<{ day: string; startTime: string; endTime: string }>) => {
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

  const handleNameNext = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!form.validateName()) return;

    try {
      await saveProfileMutation.mutateAsync(form.formData.name.trim());
      form.completeStep(InviteeOnboardingSteps.Name);
    } catch (err) {
      form.setError(
        'name',
        err instanceof Error
          ? err.message
          : 'Failed to save profile. Please try again.',
      );
    }
  };

  const handleAvailabilityNext = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!form.validateAvailability()) return;

    try {
      const availability = DAYS.filter(
        (d) => form.formData.availability[d.key as DayKey].enabled,
      ).map((d) => ({
        day: d.key,
        startTime: form.formData.availability[d.key as DayKey].startTime,
        endTime: form.formData.availability[d.key as DayKey].endTime,
      }));

      await saveAvailabilityMutation.mutateAsync(availability);
      form.completeStep(InviteeOnboardingSteps.Availability);
      router.push('/onboarding/check-complete');
    } catch (err) {
      form.setError(
        'availability',
        err instanceof Error
          ? err.message
          : 'Failed to save availability. Please try again.',
      );
    }
  };

  const handleWelcomeNext = () => {
    form.completeStep(InviteeOnboardingSteps.Welcome);
  };

  if (isLoadingInvite || isLoadingOrg) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-[#E8E2DC] bg-white p-6 shadow-sm">
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <Spinner size="w-10 h-10" />
            </div>
            <h1 className="text-lg font-semibold text-[#2C2421]">
              Loading your invitation
            </h1>
            <p className="text-sm text-[#8C7B72]">
              Please wait while we prepare your onboarding...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation?.data || !organisation) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-[#E8E2DC] bg-white p-6 shadow-sm">
          <div className="space-y-4 text-center">
            <h1 className="text-lg font-semibold text-[#2C2421]">
              Invitation not found
            </h1>
            <p className="text-sm text-[#8C7B72]">
              This invitation may have expired or been revoked.
            </p>
            <button
              onClick={() => router.push('/')}
              className="h-10 rounded-lg bg-[#6B4C3B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#5A3E30]"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-start justify-center pt-[10vh] px-4 pb-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2C2421] tracking-tight">
            Set up your profile
          </h1>
          <p className="mt-2 text-sm text-[#8C7B72]">
            {subtitles[form.currentStep]}
          </p>
        </div>

        <Stepper
          steps={STEPS}
          currentStep={form.currentStep}
          onStepClick={form.goToStep}
          completedSteps={form.completedSteps}
        />

        <form className="bg-white rounded-xl border border-[#E8E2DC] shadow-sm p-6">
          {form.currentStep === InviteeOnboardingSteps.Welcome && (
            <WelcomeStep
              organizationName={organisation.name}
              onContinue={handleWelcomeNext}
            />
          )}

          {form.currentStep === InviteeOnboardingSteps.Name && (
            <NameStep
              value={form.formData.name}
              error={form.errors.name}
              isPending={saveProfileMutation.isPending}
              onChange={(v) => form.updateField('name', v)}
              onSubmit={handleNameNext}
            />
          )}

          {form.currentStep === InviteeOnboardingSteps.Availability && (
            <AvailabilityStep
              availability={form.formData.availability}
              errors={form.errors}
              isPending={saveAvailabilityMutation.isPending}
              onToggleDay={form.toggleDay}
              onUpdateTime={form.updateDayTime}
              onBack={() => form.setCurrentStep(InviteeOnboardingSteps.Name)}
              onSubmit={handleAvailabilityNext}
            />
          )}
        </form>

        <p className="text-center text-xs text-[#B5AAA2] mt-6">
          You can change these later in settings
        </p>
      </div>
    </div>
  );
}
