import { useSchoolLists } from "@/data/school-lists"
import { formatDateTime } from "@/lib/time"
import { useBookings } from "@/features/booking/bookings-store"
import { summaryRows } from "@/features/booking/components/booking-summary"
import type { Booking } from "@/features/booking/types"

// Admin only: each edit of this booking, newest first, with only the rows that changed.
export function BookingHistory({ booking }: { booking: Booking }) {
  const { lists } = useSchoolLists()
  const changes = useBookings().history.filter((c) => c.bookingId === booking.id)

  // Each change goes from its old values to the next change's old values (or to the booking now).
  const entries = changes
    .map((change, i) => {
      const after = changes[i + 1]?.oldValues ?? booking
      const before = summaryRows(lists, change.oldValues, change.oldValues)
      const now = summaryRows(lists, after, after)
      const rows = before
        .map(([label, oldValue], j) => ({ label, oldValue, newValue: now[j][1] }))
        .filter((row) => row.oldValue !== row.newValue)
      return { changedAt: change.changedAt, rows }
    })
    .filter((entry) => entry.rows.length > 0) // a save with no change is not a change
    .reverse()

  return (
    <section aria-labelledby="history-title" className="space-y-2">
      <h2 id="history-title" className="font-medium">Change history</h2>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">Not changed since it was booked.</p>
      ) : (
        <ol className="divide-y rounded-lg border">
          {entries.map((entry) => (
            <li key={entry.changedAt.getTime()} className="space-y-1 px-4 py-3">
              <p className="text-sm text-muted-foreground">{formatDateTime(entry.changedAt)}</p>
              <dl className="space-y-1">
                {entry.rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-sm text-muted-foreground">{row.label}</dt>
                    <dd className="break-words">
                      <span className="text-muted-foreground">{row.oldValue}</span>
                      <span aria-hidden="true"> → </span>
                      <span className="sr-only"> changed to </span>
                      <span className="font-medium">{row.newValue}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
