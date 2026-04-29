import React from 'react'
import { Service } from '../../types/booking.types';

export const SERVICES: Service[] = [
  { id: "1", name: "Classic Cut", description: "Scissor or clipper cut, styled to finish", price: 28, duration: 30 },
  { id: "2", name: "Beard Trim", description: "Shape, line-up and hot towel finish", price: 18, duration: 20 },
  { id: "3", name: "Cut & Beard", description: "Full haircut plus beard grooming", price: 42, duration: 50 },
  { id: "4", name: "Hot Towel Shave", description: "Traditional straight-razor shave", price: 35, duration: 40 },
];

export default function ServiceSelect({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {SERVICES.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => onSelect(service.id)}
          className={`
            cursor-pointer w-full text-left p-5 rounded-xl border transition-all duration-150
            ${selected === service.id
              ? "border-[#6B4C3B] bg-[#6B4C3B]/5 shadow-sm"
              : "border-gray-200 bg-white hover:border-[#6B4C3B]/30 hover:shadow-sm"
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-gray-900">£{service.price}</p>
              <p className="text-sm text-gray-500">{service.duration} min</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}