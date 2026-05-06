'use client'
import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { AvailabilityState, EditAvailabilityDialog } from "@/components/EditAvailabilityDialog"

type ApiAvailabilityDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface ApiAvailabilityItem {
  day: ApiAvailabilityDay
  startTime: string
  endTime: string
}

interface ApiAvailabilityResponse {
  availability: ApiAvailabilityItem[]
}

const DAY_SHORT_TO_FULL: Record<ApiAvailabilityDay, keyof AvailabilityState['customDays']> = {
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
  sun: 'sunday',
}

const DAY_SHORT_TO_FC_NUMBER: Record<ApiAvailabilityDay, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
}

const fetchAvailability = async (): Promise<ApiAvailabilityResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/availability`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return response.json()
}

const mapApiAvailabilityToState = (items: ApiAvailabilityItem[]): AvailabilityState | null => {
  if (!items.length) return null

  const customDays: AvailabilityState['customDays'] = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  }

  items.forEach((item) => {
    customDays[DAY_SHORT_TO_FULL[item.day]] = true
  })

  const first = items[0]

  return {
    dayPreset: 'custom',
    customDays,
    startTime: first.startTime,
    endTime: first.endTime,
  }
}

const mapStateToApiAvailability = (state: AvailabilityState): ApiAvailabilityItem[] => {
  return Object.entries(state.customDays)
    .filter(([, selected]) => selected)
    .map(([day]) => ({
      day: (
        Object.entries(DAY_SHORT_TO_FULL).find(([, fullDay]) => fullDay === day)?.[0] ?? 'mon'
      ) as ApiAvailabilityDay,
      startTime: state.startTime,
      endTime: state.endTime,
    }))
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
  const [availabilityByDay, setAvailabilityByDay] = useState<ApiAvailabilityItem[]>([])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAvailability()
        setAvailabilityByDay(data.availability)

        const mappedState = mapApiAvailabilityToState(data.availability)
        if (mappedState) {
          setAvailability(mappedState)
        }
      } catch (error) {
        console.error('Failed to fetch availability', error)
      }
    }

    fetchData();
  }, [])

  const handleSaveAvailability = (state: AvailabilityState) => {
    setAvailability(state)
    setAvailabilityByDay(mapStateToApiAvailability(state))
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
          businessHours={availabilityByDay.map((item) => ({
            daysOfWeek: [DAY_SHORT_TO_FC_NUMBER[item.day]],
            startTime: item.startTime,
            endTime: item.endTime,
          }))}
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
