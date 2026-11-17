import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { FunctionsHttpError } from "@supabase/supabase-js"
import type { Booking } from "@/features/booking/types"
import { supabase } from "@/lib/supabase"
import { fromDbTime, toDbTime } from "@/lib/time"

// One admin edit: the booking as it was before. Comes from the booking_history table.
export type BookingChange = { bookingId: string; changedAt: Date; oldValues: Booking }

type BookingsStore = {
  bookings: Booking[]
  history: BookingChange[]
  loadFailed: boolean
  loadDay: (roomId: string, dateKey: string) => void
  addBooking: (booking: Omit<Booking, "id">, turnstileToken: string) => Promise<{ booking: Booking } | { error: string }>
  updateBooking: (booking: Booking) => Promise<string | null>
  removeBooking: (id: string) => Promise<string | null>
}

const BookingsContext = createContext<BookingsStore | null>(null)

// The booking table and availability() give the same columns.
const BOOKING_COLUMNS = "id, room_id, booking_date, start_time, end_time, class_id, subject_id, teacher_name"

type BookingRow = {
  id: string
  room_id: number
  booking_date: string
  start_time: string
  end_time: string
  class_id: number
  subject_id: number
  teacher_name: string
}

type HistoryRow = { booking_id: string; changed_at: string; old_values: BookingRow }

// The database uses number ids and "08:30:00" times. The app uses text ids and minutes.
function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    roomId: String(row.room_id),
    date: row.booking_date,
    startMinutes: fromDbTime(row.start_time),
    endMinutes: fromDbTime(row.end_time),
    classId: String(row.class_id),
    subjectId: String(row.subject_id),
    teacherName: row.teacher_name,
  }
}

// A safe message for the user. The details stay in the Supabase logs.
function saveErrorMessage(error: { code: string; message: string }) {
  if (error.code === "23505") return "This time was just taken. Choose another time."
  if (error.message === "started") return "This booking has started, so it cannot be changed."
  return "Could not save. Check your connection, then try again."
}

// Error codes from the create-booking Edge Function, as messages for the teacher.
const CREATE_ERRORS: Record<string, string> = {
  taken: "This time was just taken. Go back and choose another time.",
  busy: "Many bookings right now. Wait a minute, then try again.",
  too_long: "One teacher can book at most 4 hours a day.",
  robot: "The robot check failed. Try again.",
}

// The one place that holds bookings, shared by every booking page.
// Admin: all active bookings and the change history. RLS gives everyone else no rows.
// Teacher: one room and day at a time, through availability().
export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [history, setHistory] = useState<BookingChange[]>([])
  const [loadFailed, setLoadFailed] = useState(false)

  async function loadAll() {
    const [bookingResult, historyResult] = await Promise.all([
      supabase.from("booking").select(BOOKING_COLUMNS).eq("status", "ACTIVE"),
      supabase.from("booking_history").select("booking_id, changed_at, old_values").order("changed_at"),
    ])
    if (bookingResult.error || historyResult.error) {
      setLoadFailed(true)
      return
    }
    setLoadFailed(false)
    setBookings((bookingResult.data as BookingRow[]).map(toBooking))
    setHistory(
      (historyResult.data as HistoryRow[]).map((row) => ({
        bookingId: row.booking_id,
        changedAt: new Date(row.changed_at),
        oldValues: toBooking(row.old_values),
      })),
    )
  }

  async function loadDay(roomId: string, dateKey: string) {
    const { data, error } = await supabase.rpc("availability", { p_room_id: Number(roomId), p_date: dateKey })
    if (error) {
      setLoadFailed(true)
      return
    }
    setLoadFailed(false)
    const day = (data as BookingRow[]).map(toBooking)
    setBookings((current) => [
      ...current.filter((b) => !(b.roomId === roomId && b.date === dateKey)),
      ...day,
    ])
  }

  // Load again when the admin signs in or out.
  // Supabase says: do not call Supabase inside this callback, so start the load just after it.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      setTimeout(loadAll, 0)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Teacher. The Edge Function checks Turnstile, then create_booking() saves it.
  async function addBooking(booking: Omit<Booking, "id">, turnstileToken: string) {
    const { data, error } = await supabase.functions.invoke("create-booking", {
      body: {
        roomId: Number(booking.roomId),
        date: booking.date,
        start: toDbTime(booking.startMinutes),
        end: toDbTime(booking.endMinutes),
        classId: Number(booking.classId),
        subjectId: Number(booking.subjectId),
        teacherName: booking.teacherName,
        turnstileToken,
      },
    })
    if (error) {
      const body = error instanceof FunctionsHttpError ? await error.context.json().catch(() => ({})) : {}
      return { error: CREATE_ERRORS[body.error] ?? "Could not save the booking. Check your connection, then try again." }
    }
    const saved = { ...booking, id: data.id as string }
    setBookings((current) => [...current, saved])
    return { booking: saved }
  }

  // Admin. Returns null when saved, or a message for the user.
  // The database checks the admin, the rules and free slots. Its trigger writes the history.
  async function updateBooking(booking: Booking) {
    const { error } = await supabase.rpc("update_booking", {
      p_id: booking.id,
      p_room_id: Number(booking.roomId),
      p_date: booking.date,
      p_start: toDbTime(booking.startMinutes),
      p_end: toDbTime(booking.endMinutes),
      p_class_id: Number(booking.classId),
      p_subject_id: Number(booking.subjectId),
      p_teacher_name: booking.teacherName,
    })
    if (error) return saveErrorMessage(error)
    await loadAll()
    return null
  }

  async function removeBooking(id: string) {
    const { error } = await supabase.rpc("cancel_booking", { p_id: id })
    if (error) return saveErrorMessage(error)
    setBookings((current) => current.filter((b) => b.id !== id))
    return null
  }

  return (
    <BookingsContext value={{ bookings, history, loadFailed, loadDay, addBooking, updateBooking, removeBooking }}>
      {children}
    </BookingsContext>
  )
}

export function useBookings() {
  const store = useContext(BookingsContext)
  if (!store) throw new Error("useBookings must be used inside BookingsProvider")
  return store
}
