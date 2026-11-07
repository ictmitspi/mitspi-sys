import { useState } from "react"
import { useLocation } from "react-router"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { nameOf, useSchoolLists } from "@/data/school-lists"
import { useBookings } from "@/features/booking/bookings-store"
import { BookingFilters } from "@/features/booking/components/booking-filters"
import { BookingList } from "@/features/booking/components/booking-list"
import { bookingRows } from "@/features/booking/export"
import { ALL, NO_FILTERS, filterBookings, monthOptions } from "@/features/booking/filters"
import type { Booking } from "@/features/booking/types"
import { downloadCsv } from "@/lib/csv"
import { formatDate, formatDuration, formatMonth, formatTimeRange, toDateKey, toMonthKey, today } from "@/lib/time"

// Bookings dashboard: filter, count, list and download.
export function BookingsPage() {
  const { bookings } = useBookings()
  const { lists } = useSchoolLists()
  const thisMonth = toMonthKey(toDateKey(today()))
  const [filters, setFilters] = useState({ ...NO_FILTERS, month: thisMonth })
  // The edit page sends the removed booking here, so the admin sees what happened.
  const removed = (useLocation().state as { removed?: Booking } | null)?.removed

  const shown = filterBookings(bookings, filters)
  const totalMinutes = shown.reduce((sum, b) => sum + b.endMinutes - b.startMinutes, 0)
  const isEmpty = shown.length === 0
  // The list starts at today. Past days stay one tap away, and always in the report (CSV, PDF).
  const [showPast, setShowPast] = useState(false)
  const todayKey = toDateKey(today())
  const past = shown.filter((b) => b.date < todayKey)
  const upcoming = shown.filter((b) => b.date >= todayKey)
  const hidePast = !showPast && past.length > 0 && upcoming.length > 0

  // Printed pages have no selects, so they say which filters were used.
  const filterSummary = [
    filters.month === ALL ? "All months" : formatMonth(filters.month),
    filters.classId === ALL ? "All classes" : nameOf(lists.classes, filters.classId),
    filters.subjectId === ALL ? "All subjects" : nameOf(lists.subjects, filters.subjectId),
    filters.roomId === ALL ? "All rooms" : nameOf(lists.rooms, filters.roomId),
  ].join(" · ")

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="h-12" disabled={isEmpty}
            onClick={() => downloadCsv(`bookings-${filters.month}.csv`, bookingRows(shown, lists))}>
            <Download /> Excel (CSV)
          </Button>
          <Button variant="outline" className="h-12" disabled={isEmpty} onClick={() => window.print()}>
            <Printer /> PDF
          </Button>
        </div>
      </div>

      {removed && (
        <p role="status" className="rounded-lg border px-4 py-3 print:hidden">
          <span className="font-medium">Booking removed:</span> {formatDate(removed.date)},{" "}
          {formatTimeRange(removed.startMinutes, removed.endMinutes)}, {nameOf(lists.rooms, removed.roomId)}.
        </p>
      )}

      <BookingFilters filters={filters} months={monthOptions(bookings, thisMonth)} onChange={setFilters} />
      <p className="hidden text-sm print:block">{filterSummary}</p>

      <dl className="grid grid-cols-2 gap-3" aria-live="polite">
        <div className="rounded-lg border p-4">
          <dt className="text-sm text-muted-foreground">Bookings</dt>
          <dd className="text-2xl font-semibold tabular-nums">{shown.length}</dd>
        </div>
        <div className="rounded-lg border p-4">
          <dt className="text-sm text-muted-foreground">Time booked</dt>
          <dd className="text-2xl font-semibold tabular-nums">{formatDuration(totalMinutes)}</dd>
        </div>
      </dl>

      {isEmpty ? (
        <div className="space-y-3 rounded-lg border p-6 text-center">
          <p className="font-medium">No bookings match these filters.</p>
          <Button variant="outline" className="h-12" onClick={() => setFilters(NO_FILTERS)}>
            Show all bookings
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {hidePast && (
            <Button variant="outline" className="h-12 w-full print:hidden" onClick={() => setShowPast(true)}>
              Show {past.length} earlier {past.length === 1 ? "booking" : "bookings"}
            </Button>
          )}
          <div className={hidePast ? "hidden print:block" : undefined}>
            <BookingList bookings={past} />
          </div>
          <BookingList bookings={upcoming} />
        </div>
      )}
    </div>
  )
}
