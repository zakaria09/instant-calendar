import { Calendar } from '@/components/ui/calendar'
import React from 'react'

function generateTimeSlots(date: Date, intervalMinutes: number = 60) {
  const slots: Date[] = []
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      const slot = new Date(date)
      slot.setHours(hour, min, 0, 0)
      slots.push(slot)
    }
  }
  return slots
}

export default function DateSelect({
  onSelect,
}: {
  onSelect?: (isoString: string) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = React.useState<Date | null>(null)

  const slots = date ? generateTimeSlots(date) : []

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => {
          setDate(d)
          setSelectedSlot(null)
        }}
        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
        className="w-full"
      />

      {slots.length > 0 && (
        <div className="grid grid-cols-4 gap-2 p-4">
          {slots.map((slot) => (
            <button
              key={slot.toISOString()}
              type="button"
              onClick={() => {
                setSelectedSlot(slot);
                onSelect?.(slot.toISOString());
              }}
              className={`cursor-pointer py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                ${selectedSlot?.getTime() === slot.getTime()
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/30'
                }
              `}
            >
              {slot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}