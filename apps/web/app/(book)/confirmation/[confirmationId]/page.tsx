'use client';

import Link from 'next/link';
import React from 'react';

type ConfirmationPayload = {
  id: string;
  serviceName: string;
  staffName: string;
  dateTime: string;
  createdAt: string;
};

const CONFIRMATION_STORAGE_PREFIX = 'booking-confirmation:';

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{confirmationId: string}>;
}) {
  const {confirmationId} = React.use(params);
  const subscribe = React.useCallback(() => () => {}, []);

  const confirmationRaw = React.useSyncExternalStore(
    subscribe,
    () => {
      return sessionStorage.getItem(
        `${CONFIRMATION_STORAGE_PREFIX}${confirmationId}`,
      );
    },
    () => null,
  );

  const confirmation = React.useMemo(() => {
    if (!confirmationRaw) return null;

    try {
      return JSON.parse(confirmationRaw) as ConfirmationPayload;
    } catch {
      return null;
    }
  }, [confirmationRaw]);

  const formattedDateTime = confirmation?.dateTime
    ? new Date(confirmation.dateTime).toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className='min-h-screen bg-[#FAF7F4] flex items-start justify-center px-4 py-12'>
      <div className='w-full max-w-lg rounded-2xl border border-[#6B4C3B]/15 bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-serif text-[#6B4C3B] tracking-tight'>
          Booking Confirmed
        </h1>

        {!confirmation ? (
          <p className='mt-4 text-sm text-gray-600'>
            We could not find booking details for this confirmation ID.
          </p>
        ) : (
          <div className='mt-6 space-y-4'>
            <div className='rounded-xl bg-[#FAF7F4] p-4'>
              <p className='text-xs uppercase tracking-wide text-gray-500'>Confirmation ID</p>
              <p className='text-sm font-medium text-gray-900 mt-1'>{confirmation.id}</p>
            </div>

            <div className='space-y-2 text-lg'>
              <p className='text-gray-700'>
                <span className='font-semibold text-gray-900'>Service:</span> {confirmation.serviceName}
              </p>
              <p className='text-gray-700'>
                <span className='font-semibold text-gray-900'>Staff:</span> {confirmation.staffName}
              </p>
              <p className='text-gray-700'>
                <span className='font-semibold text-gray-900'>Time:</span> {formattedDateTime}
              </p>
            </div>
          </div>
        )}

        <div className='mt-8'>
          <Link
            href='/book/1'
            className='inline-flex items-center justify-center rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A3D2E] transition-colors'
          >
            Edit Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
