import React from 'react';

export function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

export function LoadingDots() {
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

export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

interface StepButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  children: React.ReactNode;
}

export function StepButton({ variant = 'primary', loading = false, children, ...props }: StepButtonProps) {
  const baseClasses = 'h-11 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'w-full bg-[#6B4C3B] text-white hover:bg-[#5A3E30] active:bg-[#4A3226] focus-visible:ring-[#6B4C3B] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'px-4 border border-[#D9D1CA] text-[#6B4C3B] hover:bg-[#F5F1ED] active:bg-[#EDE7E1] focus-visible:ring-[#6B4C3B]',
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${props.className || ''}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
