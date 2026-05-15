import React from 'react';
import { ErrorMessage } from './shared';

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

export function TimeSelect({
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

export function InputField({
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
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
