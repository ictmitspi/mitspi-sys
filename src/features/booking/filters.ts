import type { Booking } from "@/features/booking/types"
import { toMonthKey } from "@/lib/time"

export const ALL = "all"

export type BookingFilters = {
  month: string // "YYYY-MM" or ALL
  classId: string
  subjectId: string
  roomId: string
}

export const NO_FILTERS: BookingFilters = { month: ALL, classId: ALL, subjectId: ALL, roomId: ALL }

function matches(value: string, filter: string) {
  return filter === ALL || value === filter
}

// Bookings that match every filter, oldest first.
export function filterBookings(bookings: Booking[], filters: BookingFilters) {
  return bookings
    .filter((b) =>
      matches(toMonthKey(b.date), filters.month) &&
      matches(b.classId, filters.classId) &&
      matches(b.subjectId, filters.subjectId) &&
      matches(b.roomId, filters.roomId),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.startMinutes - b.startMinutes)
}

// This month plus every month that has a booking, in order.
export function monthOptions(bookings: Booking[], thisMonth: string) {
  return [...new Set([thisMonth, ...bookings.map((b) => toMonthKey(b.date))])].sort()
}
