'use client'
import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EditAvailabilityDialog, type AvailabilityState } from "@/components/EditAvailabilityDialog"

// Map day keys to FullCalendar day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
const DAY_TO_FC_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export default function CalendarPage() {
  const [initialState] = useState<AvailabilityState>({
    dayPreset: 'weekdays',
    customDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    startTime: '09:00',
    endTime: '17:00',
  })

  const [availability, setAvailability] = useState<AvailabilityState | null>(null)

  const handleSaveAvailability = (state: AvailabilityState) => {
    setAvailability(state)
  }

  const getSelectedDaysFC = (availState: AvailabilityState) => {
    return Object.entries(availState.customDays)
      .filter(([_, selected]) => selected)
      .map(([day]) => DAY_TO_FC_NUMBER[day])
      .sort((a, b) => a - b)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium mb-1">Calendar</h1>
          <p className="text-neutral-500 text-sm hidden sm:block">Manage your calendar and availability.</p>
        </div>
        <EditAvailabilityDialog
          initialState={initialState}
          onSave={handleSaveAvailability}
          currentAvailability={availability}
        />
      </div>

      {/* Calendar with Availability Props */}
      <div className="[&_.fc-toolbar-title]:font-bold [&_.fc-toolbar-title]:sm:text-lg! [&_.fc-toolbar-title]:text-sm! [&_.fc-day-past]:opacity-40 [&_.fc-day-past]:bg-neutral-200 [&_.fc-day-past]:cursor-not-allowed [&_.fc-day-future_.fc-timegrid-col-frame]:cursor-pointer [&_.fc-day-today_.fc-timegrid-col-frame]:cursor-pointer">
        <FullCalendar
          plugins={[ timeGridPlugin, interactionPlugin ]}
          initialView="timeGridWeek"
          height={'calc(100svh - 170px)'}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          firstDay={1}
          allDaySlot={false}
          nowIndicator={true}
          businessHours={availability ? {
            daysOfWeek: getSelectedDaysFC(availability),
            startTime: availability.startTime,
            endTime: availability.endTime,
          } : {
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00',
          }}
          dayHeaderFormat={{
            day: 'numeric',
            weekday: 'short',
            omitCommas: true,
          }}
          selectable={true}
          selectAllow={(selectInfo) => selectInfo.start >= new Date()}
          select={(info) => {
            console.log(info.start)
            console.log(info.end)
          }}
        />
      </div>
    </div>
  )
}
