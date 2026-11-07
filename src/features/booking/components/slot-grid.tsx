import { cn } from "cn"
import { formatTime } from "@/lib/time"
import { SLOT_STARTS, type SlotStatus, type TimeRange } from "@/features/booking/slots"

type Props = {
  statusOf: (slotStart: number) => SlotStatus
  range: TimeRange | null
  onTap: (slotStart: number) => void
  onBookedTap: (slotStart: number) => void // shows who booked it
}

const STATUS_LABEL: Record<SlotStatus, string> = { free: "", booked: "Booked", past: "Past" }

const NOON = 12 * 60
const GROUPS = [
  { label: "Morning", isIn: (m: number) => m < NOON },
  { label: "Afternoon", isIn: (m: number) => m >= NOON },
]

export function SlotGrid({ statusOf, range, onTap, onBookedTap }: Props) {
  // Hide past slots: they cannot be booked and push the free ones below the fold.
  const slotStarts = SLOT_STARTS.filter((m) => statusOf(m) !== "past")
  const hasFreeSlot = slotStarts.some((m) => statusOf(m) === "free")
  const hasBookedSlot = slotStarts.some((m) => statusOf(m) === "booked")

  function renderSlot(slotStart: number) {
    const status = statusOf(slotStart)
    const isBooked = status === "booked"
    const selected = range !== null && slotStart >= range.start && slotStart < range.end
    return (
      <button
        key={slotStart}
        type="button"
        aria-pressed={isBooked ? undefined : selected}
        aria-label={isBooked ? `${formatTime(slotStart)}, booked. Show who booked it.` : undefined}
        onClick={() => (isBooked ? onBookedTap(slotStart) : onTap(slotStart))}
        className={cn(
          "flex h-14 flex-col items-center justify-center rounded-md border text-sm font-medium",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
          !isBooked && !selected && "hover:border-primary hover:bg-accent",
          selected && "border-primary bg-primary text-primary-foreground",
          isBooked && "bg-muted text-muted-foreground hover:border-muted-foreground",
        )}
      >
        {formatTime(slotStart)}
        {status !== "free" && <span className="text-xs font-normal">{STATUS_LABEL[status]}</span>}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {hasFreeSlot ? (
        <p className="text-sm text-muted-foreground">
          Tap a start time. To book longer, tap an end time.
          {hasBookedSlot && " Tap a booked time to see who booked it."}
        </p>
      ) : (
        <p className="text-sm font-medium">No free times on this day. Choose another date.</p>
      )}
      {GROUPS.map(({ label, isIn }) => {
        const groupStarts = slotStarts.filter(isIn)
        if (groupStarts.length === 0) return null
        return (
          <div key={label} className="space-y-2">
            <h3 className="text-sm text-muted-foreground">{label}</h3>
            <div className="grid grid-cols-3 gap-2">{groupStarts.map(renderSlot)}</div>
          </div>
        )
      })}
    </div>
  )
}
