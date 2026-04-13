import Sidebar from '@/app/components/Sidebar/Sidebar'


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}