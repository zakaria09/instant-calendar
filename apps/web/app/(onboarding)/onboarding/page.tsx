'use client'
import Stepper from '@/app/components/Stepper/Stepper';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const STEPS = ["Your Name", "Availability", "Organisation"];

enum OnboardingSteps {
  Name = 1,
  Availability = 2,
  Organisation = 3,
}

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

type DayKey = typeof DAYS[number]['key'];

type DayAvailability = {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

type OnboardingState = {
  name: string;
  availability: Record<DayKey, DayAvailability>;
  organisationName: string;
  slug: string;
}

type SlugAvailabilityResponse = {
  status: boolean;
}

const DEFAULT_HOURS: DayAvailability = { enabled: true, startTime: '09:00', endTime: '17:00' };
const DISABLED_HOURS: DayAvailability = { enabled: false, startTime: '09:00', endTime: '17:00' };

const EMPTY_STATE: OnboardingState = {
  name: '',
  availability: {
    mon: { ...DEFAULT_HOURS },
    tue: { ...DEFAULT_HOURS },
    wed: { ...DEFAULT_HOURS },
    thu: { ...DEFAULT_HOURS },
    fri: { ...DEFAULT_HOURS },
    sat: { ...DISABLED_HOURS },
    sun: { ...DISABLED_HOURS },
  },
  organisationName: '',
  slug: '',
}

// Generate time options in 30-min increments
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(OnboardingSteps.Name);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [formData, setFormData] = React.useState<OnboardingState>(EMPTY_STATE);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);
  const [debouncedSlug, setDebouncedSlug] = React.useState('');
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    const nextSlug = formData.slug.trim();

    const timeoutId = window.setTimeout(() => {
      setDebouncedSlug(nextSlug);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [formData.slug]);

  const slugAvailabilityQuery = useQuery<SlugAvailabilityResponse>({
    queryKey: ['onboarding', 'slug', debouncedSlug],
    enabled: currentStep === OnboardingSteps.Organisation && debouncedSlug.length > 0,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/onboarding/check-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug: debouncedSlug }),
      });

      if (!res.ok) {
        throw new Error('Failed to check slug availability');
      }

      return res.json();
    },
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

  const activeSlug = formData.slug.trim();
  const isSlugSettled = debouncedSlug === activeSlug;
  const slugConflict = activeSlug.length > 0 && isSlugSettled && slugAvailabilityQuery.data?.status === false;
  const isCheckingSlug = activeSlug.length > 0 && (!isSlugSettled || slugAvailabilityQuery.isFetching);
  const isSavingProfile = saveProfileMutation.isPending;
  const isSavingAvailability = saveAvailabilityMutation.isPending;
  const isSubmitting = completeOnboardingMutation.isPending;

  // ─── Field updates ───

  const updateField = (field: keyof OnboardingState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));

    if (field === 'organisationName' && !slugManuallyEdited) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const toggleDay = (day: DayKey) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          enabled: !prev.availability[day].enabled,
        },
      },
    }));
    setErrors(prev => ({ ...prev, availability: undefined }));
  };

  const updateDayTime = (day: DayKey, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
    setErrors(prev => ({ ...prev, [`availability_${day}`]: undefined }));
  };

  // ─── Slug ───

  const handleSlugChange = (value: string) => {
    const sanitised = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: sanitised }));
    setErrors(prev => ({ ...prev, slug: undefined }));
  };

  // ─── Validation ───

  const validateStep = (step: OnboardingSteps): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === OnboardingSteps.Name) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
    }

    if (step === OnboardingSteps.Availability) {
      const enabledDays = DAYS.filter(d => formData.availability[d.key].enabled);
      if (enabledDays.length === 0) {
        newErrors.availability = 'Select at least one day';
      }
      for (const d of enabledDays) {
        const { startTime, endTime } = formData.availability[d.key];
        if (startTime >= endTime) {
          newErrors[`availability_${d.key}`] = 'End time must be after start time';
        }
      }
    }

    if (step === OnboardingSteps.Organisation) {
      if (!formData.organisationName.trim()) newErrors.organisationName = 'Organisation name is required';
      if (!formData.slug.trim()) newErrors.slug = 'URL slug is required';
      if (slugConflict) newErrors.slug = 'This URL is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Step handlers ───

  const handleNameNext = async () => {
    if (!validateStep(OnboardingSteps.Name)) return;

    try {
      await saveProfileMutation.mutateAsync(formData.name.trim());
      setCompletedSteps(prev => new Set(prev).add(OnboardingSteps.Name));
      setCurrentStep(OnboardingSteps.Availability);
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : 'Failed to save profile. Please try again.' });
    }
  };

  const handleAvailabilityNext = async () => {
    if (!validateStep(OnboardingSteps.Availability)) return;

    try {
      const availability = DAYS
        .filter(d => formData.availability[d.key].enabled)
        .map(d => ({
          day: d.key,
          startTime: formData.availability[d.key].startTime,
          endTime: formData.availability[d.key].endTime,
        }));

      await saveAvailabilityMutation.mutateAsync(availability);
      setCompletedSteps(prev => new Set(prev).add(OnboardingSteps.Availability));
      setCurrentStep(OnboardingSteps.Organisation);
    } catch (err) {
      setErrors({ availability: err instanceof Error ? err.message : 'Failed to save availability. Please try again.' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(OnboardingSteps.Organisation)) return;

    try {
      await completeOnboardingMutation.mutateAsync({
        orgName: formData.organisationName.trim(),
        orgSlug: formData.slug.trim(),
      });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error && 'status' in err && err.status === 409) {
        setErrors({ slug: 'This URL was just taken — try another' });
        return;
      }

      setErrors({ organisationName: err instanceof Error ? err.message : 'Failed to complete setup. Please try again.' });
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === OnboardingSteps.Name) {
      if (!isSavingProfile) {
        await handleNameNext();
      }
      return;
    }

    if (currentStep === OnboardingSteps.Availability) {
      if (!isSavingAvailability) {
        await handleAvailabilityNext();
      }
      return;
    }

    if (!isSubmitting && !isCheckingSlug) {
      await handleSubmit();
    }
  };

  // ─── Render ───

  const subtitles: Record<OnboardingSteps, string> = {
    [OnboardingSteps.Name]: "Let's start with your name",
    [OnboardingSteps.Availability]: 'Set your typical working hours',
    [OnboardingSteps.Organisation]: 'Name your organisation and pick a URL',
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-start justify-center pt-[10vh] px-4 pb-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2C2421] tracking-tight">
            Set up your account
          </h1>
          <p className="mt-2 text-sm text-[#8C7B72]">
            {subtitles[currentStep]}
          </p>
        </div>

        {/* Stepper */}
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {/* Form Card */}
        <form
          className="bg-white rounded-xl border border-[#E8E2DC] shadow-sm p-6"
          onSubmit={handleFormSubmit}
        >

          {/* ─── Step 1: Name ─── */}
          {currentStep === OnboardingSteps.Name && (
            <div className="space-y-4">
              <InputField
                label="Your name"
                value={formData.name}
                onChange={v => updateField('name', v)}
                error={errors.name}
                placeholder="Zak Smith"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full mt-2 h-11 rounded-lg bg-[#6B4C3B] text-white text-sm font-medium
                  cursor-pointer hover:bg-[#5A3E30] active:bg-[#4A3226] transition-colors duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
              >
                {isSavingProfile ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Saving…
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          )}

          {/* ─── Step 2: Availability ─── */}
          {currentStep === OnboardingSteps.Availability && (
            <div className="space-y-5">
              <p className="text-xs text-[#8C7B72]">
                Toggle the days you work and set your hours. You can fine-tune this later.
              </p>

              <div className="space-y-2">
                {DAYS.map(({ key, label }) => {
                  const day = formData.availability[key];
                  const dayError = errors[`availability_${key}`];
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-3">
                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleDay(key)}
                          className={`
                            relative h-5.5 w-10 shrink-0 rounded-full transition-colors duration-200
                            ${day.enabled ? 'bg-[#6B4C3B]' : 'bg-gray-200'}
                          `}
                          aria-label={`Toggle ${label}`}
                        >
                          <span
                            className={`
                              absolute left-0.5 top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm
                              transition-transform duration-200
                              ${day.enabled ? 'translate-x-4.5' : 'translate-x-0'}
                            `}
                          />
                        </button>

                        {/* Day label */}
                        <span className={`text-sm font-medium w-10 ${day.enabled ? 'text-[#2C2421]' : 'text-gray-400'}`}>
                          {label}
                        </span>

                        {/* Time selectors */}
                        {day.enabled ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <TimeSelect
                              value={day.startTime}
                              onChange={v => updateDayTime(key, 'startTime', v)}
                              hasError={!!dayError}
                            />
                            <span className="text-xs text-[#8C7B72]">to</span>
                            <TimeSelect
                              value={day.endTime}
                              onChange={v => updateDayTime(key, 'endTime', v)}
                              hasError={!!dayError}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unavailable</span>
                        )}
                      </div>
                      {dayError && (
                        <p className="mt-1 ml-21 text-xs text-red-500">{dayError}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.availability && (
                <p className="text-xs text-red-500">{errors.availability}</p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(OnboardingSteps.Name)}
                  className="h-11 px-4 rounded-lg border border-[#D9D1CA] text-sm font-medium text-[#6B4C3B]
                    hover:bg-[#F5F1ED] active:bg-[#EDE7E1] transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSavingAvailability}
                  className="flex-1 h-11 rounded-lg bg-[#6B4C3B] text-white text-sm font-medium
                    cursor-pointer hover:bg-[#5A3E30] active:bg-[#4A3226] transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
                >
                  {isSavingAvailability ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      Saving…
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Organisation ─── */}
          {currentStep === OnboardingSteps.Organisation && (
            <div className="space-y-4">
              <InputField
                label="Organisation name"
                value={formData.organisationName}
                onChange={v => updateField('organisationName', v)}
                error={errors.organisationName}
                placeholder="Zak's Barbershop"
                autoFocus
              />

              <div>
                <label className="block text-sm font-medium text-[#2C2421] mb-1.5">
                  Booking URL
                </label>
                <div className="flex items-stretch">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#D9D1CA] bg-[#F5F1ED] text-xs text-[#8C7B72] select-none">
                    instantcalendar.io/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="zaks-barbershop"
                    className={`flex-1 h-11 px-3 rounded-r-lg border text-sm text-[#2C2421] placeholder:text-[#C4BAB2]
                      transition-colors duration-150 outline-none
                      ${errors.slug
                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                        : 'border-[#D9D1CA] focus:border-[#6B4C3B] focus:ring-1 focus:ring-[#6B4C3B]/20'
                      }`}
                  />
                </div>
                <div className="mt-1.5 min-h-5">
                  {isCheckingSlug && (
                    <p className="text-xs text-[#8C7B72] flex items-center gap-1.5">
                      <LoadingDots />
                      Checking availability…
                    </p>
                  )}
                  {!isCheckingSlug && slugConflict && formData.slug && (
                    <p className="text-xs text-red-500">
                      This URL is already taken — try a different name
                    </p>
                  )}
                  {!isCheckingSlug && !slugConflict && formData.slug && !errors.slug && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Available
                    </p>
                  )}
                  {errors.slug && !slugConflict && (
                    <p className="text-xs text-red-500">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(OnboardingSteps.Availability)}
                  className="h-11 px-4 rounded-lg border border-[#D9D1CA] text-sm font-medium text-[#6B4C3B]
                    hover:bg-[#F5F1ED] active:bg-[#EDE7E1] transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingSlug}
                  className="flex-1 h-11 rounded-lg bg-[#6B4C3B] text-white text-sm font-medium
                    hover:bg-[#5A3E30] active:bg-[#4A3226] transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      Setting up…
                    </span>
                  ) : (
                    'Complete setup'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-[#B5AAA2] mt-6">
          You can change these later in settings
        </p>
      </div>
    </div>
  );
}


/* ─── Sub-components ─── */

function TimeSelect({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-9 px-2 rounded-lg border text-sm text-[#2C2421] bg-white
        appearance-none cursor-pointer transition-colors duration-150 outline-none
        ${hasError
          ? 'border-red-400 focus:border-red-500'
          : 'border-[#D9D1CA] focus:border-[#6B4C3B]'
        }`}
    >
      {TIME_OPTIONS.map(t => (
        <option key={t} value={t}>{formatTime(t)}</option>
      ))}
    </select>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2C2421] mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full h-11 px-3 rounded-lg border text-sm text-[#2C2421] placeholder:text-[#C4BAB2]
          transition-colors duration-150 outline-none
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
            : 'border-[#D9D1CA] focus:border-[#6B4C3B] focus:ring-1 focus:ring-[#6B4C3B]/20'
          }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-[#8C7B72] animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}