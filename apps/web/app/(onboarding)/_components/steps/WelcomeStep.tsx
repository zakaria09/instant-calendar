import React from 'react';
import { StepButton } from '../shared';

interface WelcomeStepProps {
  organizationName: string;
  onContinue: () => void;
}

export function WelcomeStep({ organizationName, onContinue }: WelcomeStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2C2421]">
          Welcome to {organizationName}!
        </h2>
      </div>

      <div className="bg-[#F5F1ED] rounded-lg p-4 text-sm text-[#8C7B72] space-y-2">
        <p>Let&lsquo;s set up your profile so the team knows your availability and how to reach you.</p>
      </div>

      <StepButton variant="primary" onClick={onContinue}>
        Get Started
      </StepButton>
    </div>
  );
}
