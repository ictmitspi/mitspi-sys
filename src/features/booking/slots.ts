import { CLOSE_MINUTES, OPEN_MINUTES, SLOT_MINUTES } from "@/data/school"
import type { Booking, SlotSelection } from "@/features/booking/types"
import { nowMinutes, toDateKey, today } from "@/lib/time"

export type SlotStatus = "free" | "booked" | "past"
export type TimeRange = { start: number; end: number }

// Start time of every slot in a day: 7:30, 8:00, ... 6:00 PM (22 slots).
export const SLOT_STARTS: number[] = []
for (let m = OPEN_MINUTES; m < CLOSE_MINUTES; m += SLOT_MINUTES) SLOT_STARTS.push(m)

function overlaps(a: TimeRange, b: TimeRange) {
  return a.start < b.end && b.start < a.end
}

// The booking that holds this slot, if any.
export function bookingAt(
  bookings: Booking[], roomId: string, dateKey: string, slotStart: number,
): Booking | undefined {
  const slot = { start: slotStart, end: slotStart + SLOT_MINUTES }
  return bookings.find(
    (b) => b.roomId === roomId && b.date === dateKey &&
      overlaps(slot, { start: b.startMinutes, end: b.endMinutes }),
  )
}

export function slotStatus(
  bookings: Booking[], roomId: string, dateKey: string, slotStart: number,
): SlotStatus {
  if (dateKey === toDateKey(today()) && slotStart < nowMinutes()) return "past"
  return bookingAt(bookings, roomId, dateKey, slotStart) ? "booked" : "free"
}

// A booking that has started is history: the admin cannot change or remove it.
export function hasStarted(booking: SlotSelection) {
  const todayKey = toDateKey(today())
  return booking.date < todayKey || (booking.date === todayKey && booking.startMinutes <= nowMinutes())
}

// Tap rules: the first tap picks the start. A later tap extends the range to
// that slot, if every slot in between is free. Otherwise the tap starts a new range.
export function nextRange(
  range: TimeRange | null, slotStart: number, isFree: (slotStart: number) => boolean,
): TimeRange {
  const single = { start: slotStart, end: slotStart + SLOT_MINUTES }
  if (!range || slotStart < range.start) return single
  for (let m = range.start; m <= slotStart; m += SLOT_MINUTES) {
    if (!isFree(m)) return single
  }
  return { start: range.start, end: slotStart + SLOT_MINUTES }
}
