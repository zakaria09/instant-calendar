'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, BookOpen, Settings, LogOut, Menu, X, LayoutGrid, Users } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import Image from 'next/image'
import logo from '@/public/images/instantcalendarlogo.svg'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organisation', href: '/organisation', icon: Users },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Services', href: '/services', icon: LayoutGrid },
  { name: 'Bookings', href: '/bookings', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/signin') },
    })
  }

  return (
    <div className="flex h-full flex-col border-r border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900">
      {/* Logo */}
      <div className="flex h-12 py-12 justify-center items-center px-6 border-b border-black/10 dark:border-white/10">
        <Image src={logo} alt="Instant Calendar Logo" width={300} height={150} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-black/10 dark:border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-medium text-black dark:text-white flex-shrink-0">
            {session?.user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-black dark:text-white truncate font-medium">
              {session?.user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 bg-white dark:bg-neutral-900 border-b border-black/10 dark:border-white/10">
        <span className="text-sm font-medium text-black dark:text-white">
          Instant Calendar
        </span>
        <button
          onClick={() => setOpen(true)}
          className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 dark:bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-black dark:hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  )
}