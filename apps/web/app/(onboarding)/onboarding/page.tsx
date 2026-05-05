'use client'
import Stepper from '@/app/components/Stepper/Stepper';
import { useRouter } from 'next/navigation';
import React from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const STEPS = ["Your Name", "Organisation"];

enum OnboardingSteps {
  Name = 1,
  Organisation = 2,
}

type OnboardingState = {
  name: string;
  organisationName: string;
  slug: string;
}

const EMPTY_STATE: OnboardingState = {
  name: '',
  organisationName: '',
  slug: '',
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
  const [slugConflict, setSlugConflict] = React.useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof OnboardingState, string>>>({});

  const slugDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateField = (field: keyof OnboardingState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));

    // Auto-generate slug from organisation name
    if (field === 'organisationName' && !slugManuallyEdited) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
      if (newSlug) {
        debouncedSlugCheck(newSlug);
      } else {
        setSlugConflict(false);
      }
    }
  };

  const handleSlugChange = (value: string) => {
    const sanitised = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: sanitised }));
    setErrors(prev => ({ ...prev, slug: undefined }));
    if (sanitised) {
      debouncedSlugCheck(sanitised);
    } else {
      setSlugConflict(false);
    }
  };

  const debouncedSlugCheck = (slug: string) => {
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    setIsCheckingSlug(true);
    slugDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/onboarding/check-slug`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        // Your Better Auth checkOrganizationSlug returns { status: true } if available
        setSlugConflict(data.status === false);
      } catch {
        setSlugConflict(false);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 400);
  };

  const validateStep = (step: OnboardingSteps): boolean => {
    const newErrors: Partial<Record<keyof OnboardingState, string>> = {};

    if (step === OnboardingSteps.Name) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
    }

    if (step === OnboardingSteps.Organisation) {
      if (!formData.organisationName.trim()) newErrors.organisationName = 'Organisation name is required';
      if (!formData.slug.trim()) newErrors.slug = 'URL slug is required';
      if (slugConflict) newErrors.slug = 'This URL is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(OnboardingSteps.Name)) return;

    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: formData.name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save profile');
      }

      setCompletedSteps(prev => new Set(prev).add(OnboardingSteps.Name));
      setCurrentStep(OnboardingSteps.Organisation);
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : 'Failed to save profile. Please try again.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(OnboardingSteps.Organisation)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/organisation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orgName: formData.organisationName.trim(),
          orgSlug: formData.slug.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 409) {
          setSlugConflict(true);
          setErrors({ slug: 'This URL was just taken — try another' });
          return;
        }
        throw new Error(data?.error || 'Something went wrong');
      }

      console.log('Onboarding complete, redirecting to dashboard', await res.json());

      router.push('/dashboard');
    } catch (err) {
      setErrors({ organisationName: err instanceof Error ? err.message : 'Failed to complete setup. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-start justify-center pt-[12vh] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2C2421] tracking-tight">
            Set up your account
          </h1>
          <p className="mt-2 text-sm text-[#8C7B72]">
            {currentStep === OnboardingSteps.Name
              ? "Let's start with your name"
              : 'Name your organisation and pick a URL'}
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
        <div className="bg-white rounded-xl border border-[#E8E2DC] shadow-sm p-6">
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
                type="button"
                onClick={handleNext}
                disabled={isSavingProfile}
                className="w-full mt-2 h-11 rounded-lg bg-[#6B4C3B] text-white text-sm font-medium
                  hover:bg-[#5A3E30] active:bg-[#4A3226] transition-colors duration-150
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
                {/* Slug status feedback */}
                <div className="mt-1.5 min-h-[20px]">
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
                  onClick={() => setCurrentStep(OnboardingSteps.Name)}
                  className="h-11 px-4 rounded-lg border border-[#D9D1CA] text-sm font-medium text-[#6B4C3B]
                    hover:bg-[#F5F1ED] active:bg-[#EDE7E1] transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
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
        </div>

        <p className="text-center text-xs text-[#B5AAA2] mt-6">
          You can change these later in settings
        </p>
      </div>
    </div>
  );
}


/* ─── Sub-components ─── */

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