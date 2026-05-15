import Image from 'next/image';
import header_img from '@/public/images/header_img.png';
import {CalendarCheck2, RefreshCcw} from 'lucide-react';
import Tile from './components/Tile/Tile';
import journal from '@/public/images/journal.png';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOnboardingStatus, getSession } from '@/lib/auth-server';
import { API_BASE } from '@/utils/constants';
import { cookies, headers } from 'next/headers'

const fetchUserOrganisation = async () => {
  const cookieStore = await cookies()
  console.log(`${API_BASE}/api/organisation/me`)
  const res = await fetch(`${API_BASE}/api/organisation/me`, {
    method: 'GET',
    headers: {
      cookie: cookieStore.toString(),
    },
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    const body = await res.text()
    console.error('Organisation fetch failed:', res.status, body)
    throw new Error('Failed to fetch organisation')
  }
  return res.json();
}

export default async function Home() {
  const session = await getSession()
  const onboarding = await getOnboardingStatus()

  if (session?.user) {

    // TODO: If the user has an invitation pending, redirect to the invitation page instead of onboarding
    const organisation = await fetchUserOrganisation()

    // TODO: Fetch invitations
    // TODO: check if the user has a pending invitation, redirect to the invitation page
    console.log('Session:', session)

    console.log('Organisation:', organisation)

    if (onboarding?.isOnboarded) {
      redirect('/dashboard')
    }

    redirect('/onboarding')
  }
  return (
    <div className='container mx-auto px-8 sm:px-0'>
      <section className='py-8'>
        <div className='flex flex-col-reverse md:flex-row gap-8 lg:gap-0 justify-between'>
          <div className='flex flex-col py-8 justify-between gap-8'>
            <h1 className='sm:text-6xl text-5xl font-light'>
              Scheduling,{' '}
              <span className='block text-blue-500 italic font-bold underline decoration-blue-500'>
                Made Simple.
              </span>
            </h1>
            <p className='text-base text-slate-800 max-w-md'>
              Say goodbye to scheduling headaches and hello to effortless
              organization. Our intuitive scheduling app is designed to
              streamline your calendar management.
            </p>
            <Link href="/dashboard" className='px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors duration-300'>
              Get Started
            </Link>
          </div>
          <div>
            <Image
              src={header_img}
              className='rounded-2xl w-full h-full object-cover'
              alt='Description'
              width={420}
              height={640}
            />
          </div>
        </div>
      </section>
      <section className='py-16'>
        <div>
          <h2 className='text-3xl font-semibold'>Crafted for Clarity</h2>
          <p className='mt-4 text-lg text-slate-800 max-w-sm'>
            Every feature is designed to reduce cognitive load and make
            scheduling a breeze.
          </p>
        </div>
        <div className='py-8'>
          <div className='flex md:flex-row flex-col gap-4'>
            <Tile
              title='Smart Scheduling'
              className='basis-2/3'
              description='Our AI analyses your schedule and will adjust your calendar if meetings run over and adjust accordingly.'
              icon={
                <CalendarCheck2 className='my-4 text-blue-700 font-extrabold' />
              }
              bgColor='bg-white'
              textColor='text-slate-800'
            />
            <Tile
              title='Intuitive Interface'
              className='basis-1/3'
              description='Connect Outlook, Google Calendar, and Apple Calendar to have all your meetings in one place.'
              icon={<RefreshCcw className='my-4 text-white font-extrabold' />}
              bgColor='bg-blue-700'
              textColor='text-white'
            />
          </div>
          <div className='flex md:flex-row flex-col gap-4 mt-4'>
            <Tile
              title='Collaborative Planning'
              className='basis-1/3 flex flex-col justify-center'
              description="View your colleagues' availability and schedule meetings that work for everyone. No more back-and-forth emails!"
              bgColor='bg-gray-100'
              textColor='text-slate-800'
            />
            <div className='flex flex-col md:flex-row w-full rounded-xl overflow-hidden min-h-72 border-slate-100 border-2 border-solid shadow-md basis-2/3'>
              <div className='w-full md:basis-2/3 px-5 sm:px-12 py-8 flex flex-col justify-center'>
                <h2 className='text-2xl font-semibold mb-2 min-h-16 leading-8'>Journaling Mode</h2>
                <p className='text-lg max-w-sm min-h-24'>
                  A dedicated space to jot down your thoughts and reflections
                  alongside your schedule.
                </p>
              </div>
              <Image
                src={journal}
                className='md:w-1/2 w-full md:basis-1/3 object-cover'
                alt='Description'
                width={420}
                height={640}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
