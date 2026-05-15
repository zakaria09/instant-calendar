import { useState } from 'react';
import { DAYS, DayKey, DayAvailability } from './useOnboardingForm';

enum InviteeOnboardingSteps {
  Welcome = 0,
  Name = 1,
  Availability = 2,
}

type InviteeOnboardingState = {
  name: string;
  availability: Record<DayKey, DayAvailability>;
};

const DEFAULT_HOURS: DayAvailability = { enabled: true, startTime: '09:00', endTime: '17:00' };
const DISABLED_HOURS: DayAvailability = { enabled: false, startTime: '09:00', endTime: '17:00' };

const EMPTY_STATE: InviteeOnboardingState = {
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
};

export function useInviteeOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(InviteeOnboardingSteps.Welcome);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<InviteeOnboardingState>(EMPTY_STATE);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const updateField = (field: keyof InviteeOnboardingState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
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

  const goToStep = (step: number) => {
    if (step < currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const completeStep = (step: InviteeOnboardingSteps) => {
    setCompletedSteps(prev => new Set(prev).add(step));
    setCurrentStep(step + 1);
  };

  const setError = (key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }));
  };

  const validateName = (): boolean => {
    if (!formData.name.trim()) {
      setError('name', 'Name is required');
      return false;
    }
    return true;
  };

  const validateAvailability = (): boolean => {
    const newErrors: Record<string, string> = {};
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  return {
    currentStep,
    setCurrentStep,
    completedSteps,
    formData,
    errors,
    updateField,
    toggleDay,
    updateDayTime,
    goToStep,
    completeStep,
    setError,
    validateName,
    validateAvailability,
  };
}

export { InviteeOnboardingSteps, EMPTY_STATE };
export type { InviteeOnboardingState };
