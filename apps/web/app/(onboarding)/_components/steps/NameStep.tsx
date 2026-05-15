import React from 'react';
import { InputField } from '../form-inputs';
import { StepButton } from '../shared';

interface NameStepProps {
  value: string;
  error?: string;
  isPending: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function NameStep({ value, error, isPending, onChange, onSubmit }: NameStepProps) {
  return (
    <div className="space-y-4">
      <InputField
        label="Your name"
        value={value}
        onChange={onChange}
        error={error}
        placeholder="Zak Smith"
        autoFocus
      />
      <StepButton
        variant="primary"
        onClick={(e) => onSubmit(e)}
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Saving…' : 'Continue'}
      </StepButton>
    </div>
  );
}
