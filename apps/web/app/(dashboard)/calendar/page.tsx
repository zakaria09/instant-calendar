'use client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Calendar</h1>
      <p className="text-neutral-500 text-lg">Manage your calendar and availability</p>
      <div>
        <FullCalendar
          plugins={[ dayGridPlugin ]}
          initialView="dayGridMonth"
        />
      </div>
    </div>
  )
}
