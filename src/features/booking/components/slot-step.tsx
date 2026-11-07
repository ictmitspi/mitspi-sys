import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { BookingInfoSheet } from "@/features/booking/components/booking-info-sheet"
import { DateStrip } from "@/features/booking/components/date-strip"
import { SlotGrid } from "@/features/booking/components/slot-grid"
import { StepLayout } from "@/components/step-layout"
import { KIND_LABEL, describeEntry, entriesOn, useSchoolCalendar } from "@/data/school-calendar"
import { choosable, useSchoolLists } from "@/data/school-lists"
import { bookingAt, nextRange, slotStatus, type TimeRange } from "@/features/booking/slots"
import {
  formatDate, formatDuration, formatTimeRange, formatWeekdayLong, fromDateKey, isWeekend, toDateKey, today,
} from "@/lib/time"
import type { Booking, SlotSelection } from "@/features/booking/types"

// A small dot under the date number of a holiday or event, in the day's own text colour.
const DAY_DOT =
  "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:size-1 [&>button]:after:rounded-full [&>button]:after:bg-current"

type Props = {
  bookings: Booking[]
  initial: SlotSelection | null
  onContinue: (selection: SlotSelection) => void
  title?: string
  onBack?: () => void
}

export function SlotStep({ bookings, initial, onContinue, title = "Book a room", onBack }: Props) {
  const rooms = choosable(useSchoolLists().lists.rooms, initial?.roomId)
  const [roomId, setRoomId] = useState(initial?.roomId ?? rooms[0].id) // one room is always in use
  const [date, setDate] = useState(initial ? fromDateKey(initial.date) : today())
  const [range, setRange] = useState<TimeRange | null>(
    initial ? { start: initial.startMinutes, end: initial.endMinutes } : null,
  )
  const [shownBooking, setShownBooking] = useState<Booking | null>(null)
  const dateKey = toDateKey(date)
  const { entries } = useSchoolCalendar()
  const dayEntries = entriesOn(entries, dateKey)
  const statusOf = (slotStart: number) => slotStatus(bookings, roomId, dateKey, slotStart)

  function changeRoom(id: string) {
    setRoomId(id)
    setRange(null)
  }

  function changeDate(newDate: Date) {
    setDate(newDate)
    setRange(null)
  }

  function tapSlot(slotStart: number) {
    setRange(nextRange(range, slotStart, (m) => statusOf(m) === "free"))
  }

  function submit() {
    if (!range) return
    onContinue({ roomId, date: dateKey, startMinutes: range.start, endMinutes: range.end })
  }

  return (
    <StepLayout
      title={title}
      onBack={onBack}
      wide
      footer={
        <div className="space-y-2 md:flex md:items-center md:justify-end md:gap-6 md:space-y-0">
          <p className="text-center text-sm" aria-live="polite">
            {range
              ? `${formatTimeRange(range.start, range.end)} · ${formatDuration(range.end - range.start)}`
              : "No time selected"}
          </p>
          <Button className="h-12 w-full text-base md:w-60" disabled={!range} onClick={submit}>
            Continue
          </Button>
        </div>
      }
    >
      {/* Mobile: one column. Desktop: room and date left, time right (like Cal.com). */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0">
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="font-medium">Room</h2>
            <div className="grid grid-cols-2 gap-2">
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  variant={room.id === roomId ? "default" : "outline"}
                  className="h-auto min-h-12 py-2 text-base whitespace-normal"
                  aria-pressed={room.id === roomId}
                  onClick={() => changeRoom(room.id)}
                >
                  {room.name}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium">Date</h2>
            <DateStrip selected={date} onSelect={changeDate} className="md:hidden" />
            <Calendar
              mode="single"
              required
              selected={date}
              onSelect={changeDate}
              disabled={{ before: today() }}
              startMonth={today()}
              weekStartsOn={1}
              modifiers={{ marked: (day: Date) => entriesOn(entries, toDateKey(day)).length > 0 }}
              modifiersClassNames={{ marked: DAY_DOT }}
              labels={{
                labelDayButton: (day, modifiers) =>
                  [
                    formatDate(toDateKey(day)),
                    ...entriesOn(entries, toDateKey(day)).map(describeEntry),
                    modifiers?.selected && "selected",
                  ].filter(Boolean).join(", "),
              }}
              className="hidden p-0 md:block [--cell-size:--spacing(11)]"
            />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" aria-hidden /> Holiday or event
            </p>
            {/* A note only: weekends, holidays and events never block booking (school's choice). */}
            {(isWeekend(dateKey) || dayEntries.length > 0) && (
              <div role="status" className="space-y-1 rounded-lg border bg-muted px-4 py-3 text-sm">
                {isWeekend(dateKey) && (
                  <p><span className="font-medium">Weekend:</span> {formatWeekdayLong(dateKey)}</p>
                )}
                {dayEntries.map((entry) => (
                  <p key={entry.id}>
                    <span className="font-medium">{KIND_LABEL[entry.kind]}:</span> {entry.name}
                  </p>
                ))}
                <p className="text-muted-foreground">You can still book.</p>
              </div>
            )}
          </section>
        </div>

        <section className="space-y-2">
          <h2 className="font-medium">Time</h2>
          <SlotGrid
            statusOf={statusOf}
            range={range}
            onTap={tapSlot}
            onBookedTap={(slotStart) => setShownBooking(bookingAt(bookings, roomId, dateKey, slotStart) ?? null)}
          />
        </section>
      </div>
      <BookingInfoSheet booking={shownBooking} onClose={() => setShownBooking(null)} />
    </StepLayout>
  )
}
