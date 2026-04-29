'use client';
import React, {useCallback, useEffect, useReducer, useRef} from 'react';
import {BookingState} from '../../types/booking.types';
import {
  getBookingFromStorage,
  getStepFromURL,
  saveBookingToStorage,
  setStepInURL,
  STORAGE_KEY,
} from '../../utils/helpers';
import Stepper from '../../_components/Stepper/Stepper';
import ServiceSelect, {SERVICES} from '../../_components/ServiceSelect/ServiceSelect';
import StaffSelect, {STAFF} from '../../_components/StaffSelect/StaffSelect';
import DateSelect from '../../_components/DateSelect/DateSelect';
import { Button } from '@/components/ui/button';
import {useRouter} from 'next/navigation';

// move to utils/constants.ts or similar if used elsewhere
export enum BookingSteps {
  Service = 1,
  Staff = 2,
  DateTime = 3,
}

const CONFIRMATION_STORAGE_PREFIX = 'booking-confirmation:';

export default function BookingPage() {
  const router = useRouter();
  const EMPTY_BOOKING: BookingState = {
    serviceId: null,
    staffId: null,
    dateTime: null,
  };

  type BookingPageState = {
    booking: BookingState;
    step: number;
  };

  type BookingPageAction =
    | {type: 'hydrate'; booking: BookingState; step: number}
    | {type: 'setStep'; step: number}
    | {type: 'updateBooking'; updates: Partial<BookingState>};

  const reducer = (
    state: BookingPageState,
    action: BookingPageAction,
  ): BookingPageState => {
    switch (action.type) {
      case 'hydrate':
        return {booking: action.booking, step: action.step};
      case 'setStep':
        return {...state, step: action.step};
      case 'updateBooking':
        return {...state, booking: {...state.booking, ...action.updates}};
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    booking: EMPTY_BOOKING,
    step: BookingSteps.Service,
  });
  const hasPersistedOnce = useRef(false);

  const {booking, step} = state;

  // Hydrate browser-only state after first client render to keep SSR/CSR markup identical.
  useEffect(() => {
    const persistedBooking = getBookingFromStorage();
    const urlStep = getStepFromURL();

    let maxAllowedStep = BookingSteps.Service;
    if (persistedBooking.serviceId) maxAllowedStep = BookingSteps.Staff;
    if (persistedBooking.serviceId && persistedBooking.staffId)
      maxAllowedStep = BookingSteps.DateTime;

    dispatch({
      type: 'hydrate',
      booking: persistedBooking,
      step: Math.min(urlStep, maxAllowedStep),
    });
  }, []);

  useEffect(() => {
    if (!hasPersistedOnce.current) {
      hasPersistedOnce.current = true;
      return;
    }
    saveBookingToStorage(booking);
  }, [booking]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlStep = getStepFromURL();
      dispatch({type: 'setStep', step: urlStep});
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToStep = useCallback((newStep: number) => {
    dispatch({type: 'setStep', step: newStep});
    setStepInURL(newStep);
  }, []);

  const updateBooking = useCallback((updates: Partial<BookingState>) => {
    dispatch({type: 'updateBooking', updates});
  }, []);

  const completedSteps = new Set<number>();
  if (booking.serviceId) completedSteps.add(BookingSteps.Service);
  if (booking.staffId) completedSteps.add(BookingSteps.Staff);
  if (booking.dateTime) completedSteps.add(BookingSteps.DateTime);

  const handleConfirm = () => {
    if (!booking.serviceId || !booking.staffId || !booking.dateTime) return;

    const confirmationId = crypto.randomUUID();
    const serviceName = SERVICES.find((s) => s.id === booking.serviceId)?.name ?? 'Unknown service';
    const staffName =
      booking.staffId === 'no-preference'
        ? 'No preference'
        : STAFF.find((p) => p.id === booking.staffId)?.name ?? 'Unknown staff member';

    const confirmationPayload = {
      id: confirmationId,
      serviceName,
      staffName,
      dateTime: booking.dateTime,
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem(
      `${CONFIRMATION_STORAGE_PREFIX}${confirmationId}`,
      JSON.stringify(confirmationPayload),
    );
    sessionStorage.removeItem(STORAGE_KEY);
    router.push(`/confirmation/${confirmationId}`);
  };

  return (
    <div className='min-h-screen bg-[#FAF7F4] flex items-start justify-center px-4 py-12'>
      <div className='w-full max-w-lg'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-serif text-[#6B4C3B] tracking-tight'>
            Marble &amp; Blade
          </h1>
          <p className='text-gray-500 text-sm mt-1'>Book your appointment</p>
        </div>

        <Stepper
          currentStep={step}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {/* Selection summary */}
        {step > BookingSteps.Service && (
          <div className='mb-4 space-y-1'>
            {booking.serviceId && (
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <span className='text-[#6B4C3B] font-semibold'>✓</span>
                <span>{SERVICES.find((s) => s.id === booking.serviceId)?.name}</span>
              </div>
            )}
            {step > BookingSteps.Staff && booking.staffId && (
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <span className='text-[#6B4C3B] font-semibold'>✓</span>
                <span>
                  {booking.staffId === 'no-preference'
                    ? 'No preference'
                    : STAFF.find((p) => p.id === booking.staffId)?.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Next step prompt */}
        {step === BookingSteps.Staff && booking.serviceId && (
          <p className='text-base font-medium text-gray-800 mb-4'>
            Who would you like your{' '}
            <span className='text-[#6B4C3B]'>
              {SERVICES.find((s) => s.id === booking.serviceId)?.name}
            </span>{' '}
            with?
          </p>
        )}
        {step === BookingSteps.DateTime && (
          <p className='text-base font-medium text-gray-800 mb-4'>
            When would you like to book?
          </p>
        )}

        {step === BookingSteps.Service && (
          <>
            <ServiceSelect
              selected={booking.serviceId}
              onSelect={(id) => updateBooking({serviceId: id})}
            />
            {booking.serviceId && (
              <button
                type='button'
                onClick={() => goToStep(BookingSteps.Staff)}
                className='cursor-pointer mt-6 w-full py-3 bg-[#6B4C3B] text-white text-sm font-medium rounded-xl hover:bg-[#5A3D2E] transition-colors shadow-sm'
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === BookingSteps.Staff && (
          <>
            <StaffSelect
              selected={booking.staffId}
              onSelect={(id) => updateBooking({staffId: id})}
            />
            {booking.staffId && (
              <button
                type='button'
                onClick={() => goToStep(BookingSteps.DateTime)}
                className='cursor-pointer mt-6 w-full py-3 bg-[#6B4C3B] text-white text-sm font-medium rounded-xl hover:bg-[#5A3D2E] transition-colors shadow-sm'
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === BookingSteps.DateTime && (
          <DateSelect
            onSelect={(iso) => updateBooking({dateTime: iso})}
          />
        )}

        {/* Navigation */}
        <div className='flex justify-between mt-4'>
          {step > BookingSteps.Service ? (
            <Button
              type='button'
              size={'lg'}
              variant={'outline'}
              onClick={() => goToStep(step - 1)}
              className='cursor-pointer text-[#6B4C3B] hover:text-[#6B4C3B]/70 font-medium transition-colors'
            >
              ← Back
            </Button>
          ) : null}
          {step === BookingSteps.DateTime && booking.dateTime && (
            <div>
              <Button
                type='button'
                size={'lg'}
                onClick={handleConfirm}
                className='cursor-pointer px-6 py-2.5 bg-[#6B4C3B] text-white font-medium rounded-xl hover:bg-[#5A3D2E] transition-colors shadow-sm'
              >
                Confirm Booking
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
