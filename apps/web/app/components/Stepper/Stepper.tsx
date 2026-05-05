'use client'
import React from 'react'

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
  completedSteps,
}: {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: Set<number>;
}) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = completedSteps.has(stepNum);
        const isClickable = stepNum < currentStep || isCompleted;
 
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(stepNum)}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-[#6B4C3B] text-white shadow-md"
                    : isCompleted
                      ? "bg-[#6B4C3B]/20 text-[#6B4C3B] hover:bg-[#6B4C3B]/30 cursor-pointer"
                      : "bg-gray-200 text-gray-400"
                  }
                `}
              >
                {isCompleted && !isActive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </button>
              <span
                className={`mt-2 text-xs font-medium tracking-wide ${
                  isActive ? "text-[#6B4C3B]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-px mx-2 mb-6 transition-colors duration-200 ${
                  completedSteps.has(stepNum) ? "bg-[#6B4C3B]/30" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}