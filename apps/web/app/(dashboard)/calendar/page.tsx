'use client'
import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pen } from 'lucide-react'

interface AvailabilityState {
  dayPreset: 'all' | 'weekdays' | 'weekends' | 'custom'
  customDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  startTime: string
  endTime: string
}

const DAYS = [
  { key: 'monday' as const, label: 'Monday' },
  { key: 'tuesday' as const, label: 'Tuesday' },
  { key: 'wednesday' as const, label: 'Wednesday' },
  { key: 'thursday' as const, label: 'Thursday' },
  { key: 'friday' as const, label: 'Friday' },
  { key: 'saturday' as const, label: 'Saturday' },
  { key: 'sunday' as const, label: 'Sunday' },
]

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const WEEKENDS = ['saturday', 'sunday']

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
  const [state, setState] = useState<AvailabilityState>({
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

  const handlePresetChange = (preset: 'all' | 'weekdays' | 'weekends' | 'custom') => {
    const newCustomDays = { ...state.customDays }

    if (preset === 'all') {
      DAYS.forEach(day => {
        newCustomDays[day.key] = true
      })
    } else if (preset === 'weekdays') {
      DAYS.forEach(day => {
        newCustomDays[day.key] = WEEKDAYS.includes(day.key)
      })
    } else if (preset === 'weekends') {
      DAYS.forEach(day => {
        newCustomDays[day.key] = WEEKENDS.includes(day.key)
      })
    }

    setState({
      ...state,
      dayPreset: preset,
      customDays: newCustomDays,
    })
  }

  const handleDayToggle = (day: keyof typeof state.customDays) => {
    setState({
      ...state,
      dayPreset: 'custom',
      customDays: {
        ...state.customDays,
        [day]: !state.customDays[day],
      },
    })
  }

  const handleSave = () => {
    setAvailability(state)
  }

  const getSelectedDays = () => {
    return DAYS.filter(day => state.customDays[day.key]).map(day => day.label)
  }

  const getSelectedDaysFC = () => {
    return Object.entries(state.customDays)
      .filter(([_, selected]) => selected)
      .map(([day]) => DAY_TO_FC_NUMBER[day])
      .sort((a, b) => a - b)
  }

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Calendar</h1>
      <p className="text-neutral-500 text-sm">Manage your calendar and availability.</p>
      <div className='max-w-2xl'>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className='flex items-center gap-2 hover:cursor-pointer'><Pen size={12} /><h3 className="text-base font-medium">Edit Your Availability</h3></AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {/* Days Availability */}
                <div>
                  <p className="text-neutral-500 text-sm mb-4 font-medium">What days are you available?</p>

                  {/* Preset Options */}
                  <div className="space-y-3 mb-4">
                    {[
                      { value: 'all', label: 'All Days' },
                      { value: 'weekdays', label: 'Weekdays Only' },
                      { value: 'weekends', label: 'Weekends Only' },
                      { value: 'custom', label: 'Custom' },
                    ].map(preset => (
                      <div
                        key={preset.value}
                        onClick={() => handlePresetChange(preset.value as AvailabilityState['dayPreset'])}
                        className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors cursor-pointer ${
                          state.dayPreset === preset.value
                            ? 'bg-blue-50 border border-blue-200'
                            : 'border border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="pointer-events-none">
                          <Checkbox checked={state.dayPreset === preset.value} />
                        </div>
                        <span className="text-sm">{preset.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Individual Day Selection */}
                  <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
                    <p className="text-xs text-neutral-600 font-medium mb-3">Individual Days</p>
                    <div className="grid grid-cols-2 gap-3">
                      {DAYS.map(day => (
                        <label key={day.key} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={state.customDays[day.key]}
                            onCheckedChange={() => handleDayToggle(day.key)}
                          />
                          <span className="text-sm">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Availability */}
                <div>
                  <p className="text-neutral-500 text-sm mb-4 font-medium">Availability Times</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={state.startTime}
                        onChange={(e) => setState({ ...state, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-2">End Time</label>
                      <input
                        type="time"
                        value={state.endTime}
                        onChange={(e) => setState({ ...state, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button onClick={handleSave} className="w-full">
                  Save Availability
                </Button>
              </div>

              {/* Display Selected Availability */}
              {availability && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Current Availability</p>
                  <p className="text-xs text-blue-800 mt-2">
                    <strong>Days:</strong> {getSelectedDays().join(', ')}
                  </p>
                  <p className="text-xs text-blue-800">
                    <strong>Time:</strong> {availability.startTime} - {availability.endTime}
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Calendar with Availability Props */}
      <div className="[&_.fc-day-past]:opacity-40 [&_.fc-day-past]:bg-neutral-200 [&_.fc-day-past]:cursor-not-allowed [&_.fc-day-future_.fc-timegrid-col-frame]:cursor-pointer [&_.fc-day-today_.fc-timegrid-col-frame]:cursor-pointer">
        <FullCalendar
          plugins={[ timeGridPlugin, interactionPlugin ]}
          initialView="timeGridWeek"
          firstDay={1}
          allDaySlot={false}
          nowIndicator={true}
          businessHours={availability ? {
            daysOfWeek: getSelectedDaysFC(),
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
