import { Link, useLocation, useSearchParams } from "react-router"
import { SLOT_MINUTES } from "@/data/school"
import { shortOf, useSchoolLists } from "@/data/school-lists"
import { useBookings } from "@/features/booking/bookings-store"
import { DateStrip } from "@/features/booking/components/date-strip"
import { SLOT_STARTS } from "@/features/booking/slots"
import { formatDate, formatTime, formatTimeRange, fromDateKey, toDateKey, today } from "@/lib/time"

// The day comes from the URL (?date=2026-10-22), so Back and reload keep it.
// A missing or bad value (typed by hand) falls back to today.
function dateFromUrl(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return today()
  const date = fromDateKey(value)
  return toDateKey(date) === value ? date : today() // rejects 2026-02-31
}

// Grid row of a time: row 1 is the room names, row 2 is the first slot.
const rowOf = (minutes: number) => (minutes - SLOT_STARTS[0]) / SLOT_MINUTES + 2

// One day on one screen: time down the side, one column a room (like Google Calendar's day view).
export function DayViewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const date = dateFromUrl(searchParams.get("date"))
  const dateKey = toDateKey(date)
  const location = useLocation()
  const selectDate = (day: Date) => setSearchParams({ date: toDateKey(day) }, { replace: true })
  const { lists } = useSchoolLists()
  const dayBookings = useBookings().bookings.filter((b) => b.date === dateKey)
  // Rooms in use, plus a hidden room that still has a booking on this day.
  const rooms = lists.rooms.filter((r) => r.isActive || dayBookings.some((b) => b.roomId === r.id))

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-10">
      <h1 className="text-2xl font-semibold">Day view</h1>
      <DateStrip selected={date} onSelect={selectDate} allowPast />
      <p className="font-medium" aria-live="polite">
        {formatDate(dateKey)}{" "}
        <span className="font-normal text-muted-foreground">
          · {dayBookings.length} {dayBookings.length === 1 ? "booking" : "bookings"}
        </span>
      </p>

      <div
        // Rows: 48px on touch screens (tap size), 36px on desktop so the whole day fits one screen.
        className="grid gap-x-2 [--row:3rem] md:[--row:2.25rem]"
        style={{ gridTemplateColumns: `auto repeat(${rooms.length}, minmax(0, 1fr))`, gridTemplateRows: `auto repeat(${SLOT_STARTS.length}, var(--row))` }}
      >
        {rooms.map((room, i) => (
          <p
            key={room.id}
            className="sticky top-(--header-height) z-10 bg-background py-2 text-sm font-medium break-words"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {room.name}
          </p>
        ))}

        {/* Hour labels and lines. Half hours get a line only, to keep the side quiet. */}
        {SLOT_STARTS.map((m) => (
          <div key={m} className="col-span-full border-t" style={{ gridRow: rowOf(m) }} />
        ))}
        {SLOT_STARTS.filter((m) => m % 60 === 0 || m === SLOT_STARTS[0]).map((m) => (
          <p key={m} className="pt-1 pr-2 text-xs text-muted-foreground tabular-nums" style={{ gridColumn: 1, gridRow: rowOf(m) }}>
            {formatTime(m)}
          </p>
        ))}

        {dayBookings.map((b) => (
          <Link
            key={b.id}
            to={b.id}
            state={{ from: location.pathname + location.search }}
            aria-label={`${formatTimeRange(b.startMinutes, b.endMinutes)}, ${shortOf(lists.classes, b.classId)}, ${shortOf(lists.subjects, b.subjectId)}, ${b.teacherName}`}
            className="z-[5] my-0.5 overflow-hidden rounded-md border bg-accent px-2 py-1 text-xs hover:bg-primary/15 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            style={{
              gridColumn: rooms.findIndex((r) => r.id === b.roomId) + 2,
              gridRow: `${rowOf(b.startMinutes)} / ${rowOf(b.endMinutes)}`,
            }}
          >
            <p className="font-medium">{shortOf(lists.classes, b.classId)} · {shortOf(lists.subjects, b.subjectId)}</p>
            <p className="break-words text-muted-foreground">{b.teacherName}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
