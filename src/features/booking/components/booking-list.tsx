import { Link } from "react-router"
import { ChevronRight } from "lucide-react"
import { nameOf, shortOf, useSchoolLists } from "@/data/school-lists"
import type { Booking } from "@/features/booking/types"
import { formatDate, formatTimeRange } from "@/lib/time"

// Bookings in order, grouped by date. Map keeps the order they were added in.
function groupByDate(bookings: Booking[]) {
  const groups = new Map<string, Booking[]>()
  for (const b of bookings) groups.set(b.date, [...(groups.get(b.date) ?? []), b])
  return [...groups]
}

// One heading a day (the date shows once), then one row a booking.
// Each row opens the booking (a relative link: <list path>/<id>).
export function BookingList({ bookings }: { bookings: Booking[] }) {
  const { lists } = useSchoolLists()

  return (
    <div className="space-y-6">
      {groupByDate(bookings).map(([date, dayBookings]) => (
        <section key={date} className="space-y-2">
          {/* Stays under the app bar while the day's rows scroll past. */}
          <h2 className="sticky top-(--header-height) z-10 bg-background py-2 font-medium print:static">
            {formatDate(date)}{" "}
            <span className="font-normal text-muted-foreground">
              · {dayBookings.length} {dayBookings.length === 1 ? "booking" : "bookings"}
            </span>
          </h2>
          <ul className="divide-y rounded-lg border">
            {dayBookings.map((b) => (
              <li key={b.id} className="break-inside-avoid">
                <Link
                  to={b.id}
                  className="flex min-h-12 items-center gap-3 px-4 py-2 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-4">
                    <p className="font-medium tabular-nums sm:w-44 sm:shrink-0">
                      {formatTimeRange(b.startMinutes, b.endMinutes)}
                    </p>
                    <p className="text-sm break-words text-muted-foreground">
                      {nameOf(lists.rooms, b.roomId)} · {shortOf(lists.classes, b.classId)} ·{" "}
                      {shortOf(lists.subjects, b.subjectId)} · {b.teacherName}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground print:hidden" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
