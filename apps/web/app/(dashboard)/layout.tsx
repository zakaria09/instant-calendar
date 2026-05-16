'use client'

import Sidebar from '@/app/components/Sidebar/Sidebar'
import { OrganisationProvider } from '../providers/organisationProvider'

function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <div className="flex h-screen bg-neutral-50 ">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
        <OrganisationProvider>
          {children}
        </OrganisationProvider>
      </main>
    </div>
  )
}

export default ProtectedLayout