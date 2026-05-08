import { useState } from 'react';

enum OnboardingSteps {
  Name = 1,
  Organisation = 2,
  Availability = 3,
  Services = 4,
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
};

type OnboardingState = {
  name: string;
  availability: Record<DayKey, DayAvailability>;
  organisationName: string;
  slug: string;
  services: Array<{ name: string; description?: string }>;
};

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
  services: [],
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function useOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(OnboardingSteps.Name);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<OnboardingState>(EMPTY_STATE);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

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

  const handleSlugChange = (value: string) => {
    const sanitised = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: sanitised }));
    setErrors(prev => ({ ...prev, slug: undefined }));
  };

  const goToStep = (step: number) => {
    if (step < currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const completeStep = (step: OnboardingSteps) => {
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

  const validateOrganisation = (slugConflict: boolean): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.organisationName.trim()) {
      newErrors.organisationName = 'Organisation name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    }
    if (slugConflict) {
      newErrors.slug = 'This URL is already taken';
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
    slugManuallyEdited,
    updateField,
    toggleDay,
    updateDayTime,
    handleSlugChange,
    goToStep,
    completeStep,
    setError,
    validateName,
    validateAvailability,
    validateOrganisation,
  };
}

export { OnboardingSteps, DAYS, EMPTY_STATE };
export type { DayKey, DayAvailability, OnboardingState };
