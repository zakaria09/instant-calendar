function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950">
      {children}
    </div>
  )
}

export default BookingLayout