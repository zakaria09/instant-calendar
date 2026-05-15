import React from 'react';
import { InputField } from '../form-inputs';
import { StepButton, ErrorMessage, LoadingDots } from '../shared';

interface OrganisationStepProps {
  orgName: string;
  slug: string;
  errors: Partial<Record<string, string>>;
  isCheckingSlug: boolean;
  slugConflict: boolean;
  isSubmitting: boolean;
  onOrgNameChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onBack: () => void;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function OrganisationStep({
  orgName,
  slug,
  errors,
  isCheckingSlug,
  slugConflict,
  isSubmitting,
  onOrgNameChange,
  onSlugChange,
  onBack,
  onSubmit,
}: OrganisationStepProps) {
  const slugIsValid = !isCheckingSlug && !slugConflict && slug && !errors.slug;

  return (
    <div className="space-y-4">
      <InputField
        label="Organisation name"
        value={orgName}
        onChange={onOrgNameChange}
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
            value={slug}
            onChange={e => onSlugChange(e.target.value)}
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
          {!isCheckingSlug && slugConflict && slug && (
            <p className="text-xs text-red-500">
              This URL is already taken — try a different name
            </p>
          )}
          {slugIsValid && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Available
            </p>
          )}
          {errors.slug && !slugConflict && <ErrorMessage message={errors.slug} />}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <StepButton
          variant="secondary"
          type="button"
          onClick={onBack}
        >
          Back
        </StepButton>
        <StepButton
          variant="primary"
          onClick={(e) => onSubmit(e)}
          disabled={isSubmitting || isCheckingSlug}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Setting up…' : 'Next Step'}
        </StepButton>
      </div>
    </div>
  );
}
