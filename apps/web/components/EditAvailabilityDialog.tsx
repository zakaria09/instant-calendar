'use client'

import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface AvailabilityState {
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

interface EditAvailabilityDialogProps {
  initialState: AvailabilityState
  onSave: (state: AvailabilityState) => void
  currentAvailability: AvailabilityState | null
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

export function EditAvailabilityDialog({
  initialState,
  onSave,
  currentAvailability,
}: EditAvailabilityDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<AvailabilityState>(initialState)

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
    onSave(state)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 hover:cursor-pointer">
          <Pen size={16} />
          Edit Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Availability</DialogTitle>
        </DialogHeader>

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
            {state.dayPreset === 'custom' && (
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
            )}
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

          {/* Display Selected Availability */}
          {currentAvailability && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Current Availability</p>
              <p className="text-xs text-blue-800 mt-2">
                <strong>Days:</strong> {DAYS.filter(day => currentAvailability.customDays[day.key]).map(day => day.label).join(', ')}
              </p>
              <p className="text-xs text-blue-800">
                <strong>Time:</strong> {currentAvailability.startTime} - {currentAvailability.endTime}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="w-full hover:cursor-pointer">
            Save Availability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
