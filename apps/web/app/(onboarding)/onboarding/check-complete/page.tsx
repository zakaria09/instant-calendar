'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckOnboardingCompletion } from '../../hooks/useOnboardingMutations';
import Spinner from '@/components/ui/loadingSpinner';

export default function OnBoardingCompletionCheckPage() {
  const router = useRouter();
  const { data, isError, refetch } =
    useCheckOnboardingCompletion();

  useEffect(() => {
    if (!data) return;

    if (data.completed) {
      router.replace('/dashboard');
      return;
    }

    router.replace('/onboarding');
  }, [data, router]);

  return (
    <div className='min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-xl border border-[#E8E2DC] bg-white p-6 shadow-sm'>
        {!isError ? (
          <div className='space-y-3 text-center'>
            <div className='flex justify-center'>
              <Spinner size='w-10 h-10' />
            </div>
            <h1 className='text-lg font-semibold text-[#2C2421]'>
              Checking your account
            </h1>
            <p className='text-sm text-[#8C7B72]'>
              We are confirming your onboarding status...
            </p>
          </div>
        ) : null}

        {isError ? (
          <div className='space-y-4 text-center'>
            <h1 className='text-lg font-semibold text-[#2C2421]'>
              We could not check your status
            </h1>
            <p className='text-sm text-[#8C7B72]'>
              Please try again. If this keeps happening, refresh the page.
            </p>
            <button
              type='button'
              onClick={() => refetch()}
              className='h-10 rounded-lg bg-[#6B4C3B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#5A3E30] active:bg-[#4A3226]'
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
