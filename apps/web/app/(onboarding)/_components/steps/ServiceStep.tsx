import React, {useState} from 'react';
import {X, Plus, Loader2} from 'lucide-react';

export type ServiceEntry = {
  id: string;
  name: string;
  duration: number;
  price: string;
};

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function ServiceStep({
  onComplete,
  isSubmitting,
  onBack,
}: {
  onComplete: (services: Omit<ServiceEntry, 'id'>[]) => void;
  isSubmitting: boolean;
  onBack: () => void;
}) {
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const addService = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Service name is required');
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Enter a valid price');
      return;
    }

    setServices((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        duration,
        price: Number(price).toFixed(2),
      },
    ]);
    setName('');
    setPrice('');
    setDuration(30);
    setError('');
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleComplete = () => {
    if (services.length === 0) {
      setError('Add at least one service to continue');
      return;
    }
    onComplete(
      services.map(({name, duration, price}) => ({name, duration, price})),
    );
  };

  return (
    <div className="space-y-5">
      {/* Added services list */}
      {services.length > 0 && (
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2DC]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#2C2421] truncate capitalize">
                  {service.name}
                </p>
                <p className="text-xs text-[#8C7B72]">
                  {formatDuration(service.duration)} · £{service.price}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="ml-3 p-1 text-[#8C7B72] hover:text-red-500 transition-colors shrink-0"
                aria-label={`Remove ${service.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add service form */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#2C2421] mb-1.5">
            Service name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Men's Haircut"
            className="w-full h-11 px-3 rounded-lg border border-[#D9D1CA] text-sm text-[#2C2421] placeholder:text-[#C4BAB2]
              transition-colors duration-150 outline-none
              focus:border-[#6B4C3B] focus:ring-1 focus:ring-[#6B4C3B]/20"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#2C2421] mb-1.5">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-lg border border-[#D9D1CA] text-sm text-[#2C2421] bg-white
                appearance-none cursor-pointer transition-colors duration-150 outline-none
                focus:border-[#6B4C3B] focus:ring-1 focus:ring-[#6B4C3B]/20"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {formatDuration(d)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-[#2C2421] mb-1.5">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8C7B72]">
                £
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setError('');
                }}
                placeholder="25.00"
                className="w-full h-11 pl-7 pr-3 rounded-lg border border-[#D9D1CA] text-sm text-[#2C2421] placeholder:text-[#C4BAB2]
                  transition-colors duration-150 outline-none
                  focus:border-[#6B4C3B] focus:ring-1 focus:ring-[#6B4C3B]/20"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="button"
          onClick={addService}
          className="w-full h-10 rounded-lg border border-dashed border-[#D9D1CA] text-sm font-medium text-[#6B4C3B]
            hover:bg-[#F5F1ED] hover:border-[#6B4C3B]/30 active:bg-[#EDE7E1] transition-colors duration-150
            flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add service
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-4 rounded-lg border border-[#D9D1CA] text-sm font-medium text-[#6B4C3B]
            hover:bg-[#F5F1ED] active:bg-[#EDE7E1] transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={isSubmitting}
          className="flex-1 h-11 rounded-lg bg-[#6B4C3B] text-white text-sm font-medium
            hover:bg-[#5A3E30] active:bg-[#4A3226] transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4C3B] focus-visible:ring-offset-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Finishing up…
            </span>
          ) : (
            'Complete setup'
          )}
        </button>
      </div>
    </div>
  );
}