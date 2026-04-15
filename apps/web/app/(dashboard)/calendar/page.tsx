'use client'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Calendar</h1>
      <p className="text-neutral-500 text-lg">Manage your calendar and availability.</p>
      <div className='[&_.fc-timegrid-col]:cursor-pointer [&_.fc-day-past]:opacity-40 [&_.fc-day-past]:bg-neutral-200 [&_.fc-day-past]:cursor-not-allowed'>
        <FullCalendar
          plugins={[ timeGridPlugin, interactionPlugin ]}
          initialView="timeGridWeek"
          allDaySlot={false}
          nowIndicator={true}
          businessHours={true}
          dayHeaderFormat={{
            day: 'numeric', 
            weekday: 'short', 
            omitCommas: true,
          }}
          selectable={true}
          selectAllow={(selectInfo) => selectInfo.start >= new Date()}
          select={(info) => {
            console.log(info.start) // start date/time
            console.log(info.end)   // end date/time
          }}
        />
      </div>
    </div>
  )
}
