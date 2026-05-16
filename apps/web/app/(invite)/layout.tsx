
async function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 ">
      {children}
    </div>
  )
}

export default InviteLayout