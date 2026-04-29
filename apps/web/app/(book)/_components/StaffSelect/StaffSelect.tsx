import React from 'react'
import { PEOPLE } from '../../types/booking.types';

export const STAFF: PEOPLE[] = [
  { id: "1", name: "James", avatar: "J", specialty: "Fades & Skin Fades" },
  { id: "2", name: "Marco", avatar: "M", specialty: "Classic Cuts & Shaves" },
  { id: "3", name: "Aiden", avatar: "A", specialty: "Beard Sculpting" },
];

export default function StaffSelect({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onSelect("no-preference")}
        className={`
           cursor-pointer w-full text-left p-5 rounded-xl border transition-all duration-150 flex items-center gap-4
          ${selected === "no-preference"
            ? "border-[#6B4C3B] bg-[#6B4C3B]/5 shadow-sm"
            : "border-gray-200 bg-white hover:border-[#6B4C3B]/30 hover:shadow-sm"
          }
        `}
      >
        <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-semibold text-sm">
          ?
        </div>
        <div>
          <p className="font-medium text-gray-900">No preference</p>
          <p className="text-sm text-gray-500">Any available staff member</p>
        </div>
      </button>
      {STAFF.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => onSelect(person.id)}
          className={`
             cursor-pointer w-full text-left p-5 rounded-xl border transition-all duration-150 flex items-center gap-4
            ${selected === person.id
              ? "border-[#6B4C3B] bg-[#6B4C3B]/5 shadow-sm"
              : "border-gray-200 bg-white hover:border-[#6B4C3B]/30 hover:shadow-sm"
            }
          `}
        >
          <div className="w-11 h-11 rounded-full bg-[#6B4C3B]/10 text-[#6B4C3B] flex items-center justify-center font-semibold text-sm">
            {person.avatar}
          </div>
          <div>
            <p className="font-medium text-gray-900">{person.name}</p>
            <p className="text-sm text-gray-500">{person.specialty}</p>
          </div>
        </button>
      ))}
    </div>
  );
}