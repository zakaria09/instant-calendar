'use client';
import Stepper from '@/app/components/Stepper/Stepper';
import {useRouter} from 'next/navigation';
import {
  useOnboardingForm,
  OnboardingSteps,
  DAYS,
} from '../hooks/useOnboardingForm';
import {
  useOnboardingMutations,
  useSlugAvailability,
} from '../hooks/useOnboardingMutations';
import {useDebounce} from '../hooks/useDebounce';
import {NameStep} from '../components/steps/NameStep';
import {AvailabilityStep} from '../components/steps/AvailabilityStep';
import {OrganisationStep} from '../components/steps/OrganisationStep';
import ServiceStep, { ServiceEntry } from '../components/steps/ServiceStep';
import { orgStorage } from '@/utils/org-storage';

const STEPS = ['Your Name', 'Organisation', 'Availability', 'Services'];

const subtitles: Record<OnboardingSteps, string> = {
  [OnboardingSteps.Name]: "Let's start with your name",
  [OnboardingSteps.Organisation]: 'Name your organisation and pick a URL',
  [OnboardingSteps.Availability]: 'Set your typical working hours',
  [OnboardingSteps.Services]: 'Add your services',
};

export default function OnboardingPage() {
  const router = useRouter();
  const form = useOnboardingForm();
  const {
    saveProfileMutation,
    saveAvailabilityMutation,
    saveOrganisationMutation,
    saveServicesMutation,
  } = useOnboardingMutations();

  const debouncedSlug = useDebounce(form.formData.slug.trim(), 400);
  const slugQuery = useSlugAvailability(
    debouncedSlug,
    form.currentStep === OnboardingSteps.Organisation,
  );

  const activeSlug = form.formData.slug.trim();
  const isSlugSettled = debouncedSlug === activeSlug;
  const slugConflict =
    activeSlug.length > 0 && isSlugSettled && slugQuery.data?.status === false;
  const isCheckingSlug =
    activeSlug.length > 0 && (!isSlugSettled || slugQuery.isFetching);

  const handleNameNext = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!form.validateName()) return;

    try {
      await saveProfileMutation.mutateAsync(form.formData.name.trim());
      form.completeStep(OnboardingSteps.Name);
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
        (d) => form.formData.availability[d.key].enabled,
      ).map((d) => ({
        day: d.key,
        startTime: form.formData.availability[d.key].startTime,
        endTime: form.formData.availability[d.key].endTime,
      }));

      await saveAvailabilityMutation.mutateAsync(availability);
      form.completeStep(OnboardingSteps.Availability);
    } catch (err) {
      form.setError(
        'availability',
        err instanceof Error
          ? err.message
          : 'Failed to save availability. Please try again.',
      );
    }
  };

  const handleOrganisationSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!form.validateOrganisation(slugConflict)) return;

    try {
      const newOrg = await saveOrganisationMutation.mutateAsync({
        orgName: form.formData.organisationName.trim(),
        orgSlug: form.formData.slug.trim(),
      });
      orgStorage.set(newOrg.organization);
      form.completeStep(OnboardingSteps.Organisation);
    } catch (err) {
      if (err instanceof Error && 'status' in err && err.status === 409) {
        form.setError('slug', 'This URL was just taken — try another');
        return;
      }

      form.setError(
        'organisationName',
        err instanceof Error
          ? err.message
          : 'Failed to complete setup. Please try again.',
      );
    }
  };

  const handleServicesComplete = async (services: Omit<ServiceEntry, 'id'>[]) => {
    try {
      await saveServicesMutation.mutateAsync(services);
      form.completeStep(OnboardingSteps.Services);
      // TODO: Push to an onboard complete route to call endpoint complete onboarding and then redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      form.setError(
        'services',
        err instanceof Error && err.message
          ? err.message
          : 'We had trouble saving your services. Please try again.',
      );
    }
  };

  return (
    <div className='min-h-screen bg-[#FAF8F5] flex items-start justify-center pt-[10vh] px-4 pb-12'>
      <div className='w-full max-w-lg'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-[#2C2421] tracking-tight'>
            Set up your account
          </h1>
          <p className='mt-2 text-sm text-[#8C7B72]'>
            {subtitles[form.currentStep]}
          </p>
        </div>

        <Stepper
          steps={STEPS}
          currentStep={form.currentStep}
          onStepClick={form.goToStep}
          completedSteps={form.completedSteps}
        />

        <form className='bg-white rounded-xl border border-[#E8E2DC] shadow-sm p-6'>
          {form.errors.services && form.currentStep === OnboardingSteps.Services && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-700'>{form.errors.services}</p>
            </div>
          )}
          {form.currentStep === OnboardingSteps.Name && (
            <NameStep
              value={form.formData.name}
              error={form.errors.name}
              isPending={saveProfileMutation.isPending}
              onChange={(v) => form.updateField('name', v)}
              onSubmit={handleNameNext}
            />
          )}

          {form.currentStep === OnboardingSteps.Organisation && (
            <OrganisationStep
              orgName={form.formData.organisationName}
              slug={form.formData.slug}
              errors={form.errors}
              isCheckingSlug={isCheckingSlug}
              slugConflict={slugConflict}
              isSubmitting={saveOrganisationMutation.isPending}
              onOrgNameChange={(v) => form.updateField('organisationName', v)}
              onSlugChange={form.handleSlugChange}
              onBack={() => form.setCurrentStep(OnboardingSteps.Name)}
              onSubmit={handleOrganisationSubmit}
            />
          )}

          {form.currentStep === OnboardingSteps.Availability && (
            <AvailabilityStep
              availability={form.formData.availability}
              errors={form.errors}
              isPending={saveAvailabilityMutation.isPending}
              onToggleDay={form.toggleDay}
              onUpdateTime={form.updateDayTime}
              onBack={() => form.setCurrentStep(OnboardingSteps.Organisation)}
              onSubmit={handleAvailabilityNext}
            />
          )}

          {form.currentStep === OnboardingSteps.Services && (
            <ServiceStep
              onComplete={handleServicesComplete}
              onBack={() => form.setCurrentStep(OnboardingSteps.Availability)}
              isSubmitting={saveServicesMutation.isPending}
            />
          )}
        </form>

        <p className='text-center text-xs text-[#B5AAA2] mt-6'>
          You can change these later in settings
        </p>
      </div>
    </div>
  );
}
