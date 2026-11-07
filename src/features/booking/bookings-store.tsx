import { createContext, useContext, useState, type ReactNode } from "react"
import { MOCK_BOOKINGS } from "@/features/booking/mock-bookings"
import type { Booking } from "@/features/booking/types"

// One admin edit: the booking as it was before. Same idea as `booking_history` in docs/database.md.
export type BookingChange = { bookingId: string; changedAt: Date; oldValues: Booking }

type BookingsStore = {
  bookings: Booking[]
  history: BookingChange[]
  addBooking: (booking: Booking) => void
  updateBooking: (booking: Booking) => void
  removeBooking: (id: string) => void
}

const BookingsContext = createContext<BookingsStore | null>(null)

// The one place that holds bookings, shared by every booking page.
// UI-only MVP: bookings live in memory and reset when the page reloads.
// Later: load and save through the API here; the pages do not change.
export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)
  const [history, setHistory] = useState<BookingChange[]>([])

  function addBooking(booking: Booking) {
    setBookings((current) => [...current, booking])
  }

  function updateBooking(booking: Booking) {
    const oldValues = bookings.find((b) => b.id === booking.id)
    if (oldValues) {
      setHistory((current) => [...current, { bookingId: booking.id, changedAt: new Date(), oldValues }])
    }
    setBookings((current) => current.map((b) => (b.id === booking.id ? booking : b)))
  }

  function removeBooking(id: string) {
    setBookings((current) => current.filter((b) => b.id !== id))
  }

  return (
    <BookingsContext value={{ bookings, history, addBooking, updateBooking, removeBooking }}>
      {children}
    </BookingsContext>
  )
}

export function useBookings() {
  const store = useContext(BookingsContext)
  if (!store) throw new Error("useBookings must be used inside BookingsProvider")
  return store
}
