import React from 'react';
import { DAYS, DayKey, type DayAvailability } from '../../hooks/useOnboardingForm';
import { TimeSelect } from '../form-inputs';
import { StepButton, ErrorMessage } from '../shared';

interface AvailabilityStepProps {
  availability: Record<DayKey, DayAvailability>;
  errors: Partial<Record<string, string>>;
  isPending: boolean;
  onToggleDay: (day: DayKey) => void;
  onUpdateTime: (day: DayKey, field: 'startTime' | 'endTime', value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function AvailabilityStep({
  availability,
  errors,
  isPending,
  onToggleDay,
  onUpdateTime,
  onBack,
  onSubmit,
}: AvailabilityStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[#8C7B72]">
        Toggle the days you work and set your hours. You can fine-tune this later.
      </p>

      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const day = availability[key];
          const dayError = errors[`availability_${key}`];
          return (
            <div key={key}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleDay(key)}
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

                <span className={`text-sm font-medium w-10 ${day.enabled ? 'text-[#2C2421]' : 'text-gray-400'}`}>
                  {label}
                </span>

                {day.enabled ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TimeSelect
                      value={day.startTime}
                      onChange={v => onUpdateTime(key, 'startTime', v)}
                      hasError={!!dayError}
                    />
                    <span className="text-xs text-[#8C7B72]">to</span>
                    <TimeSelect
                      value={day.endTime}
                      onChange={v => onUpdateTime(key, 'endTime', v)}
                      hasError={!!dayError}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Unavailable</span>
                )}
              </div>
              {dayError && <ErrorMessage message={dayError} />}
            </div>
          );
        })}
      </div>

      {errors.availability && <ErrorMessage message={errors.availability as string} />}

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
          disabled={isPending}
          loading={isPending}
        >
          {isPending ? 'Saving…' : 'Continue'}
        </StepButton>
      </div>
    </div>
  );
}
