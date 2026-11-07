import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { describeEntry, entriesOn, useSchoolCalendar } from "@/data/school-calendar"
import { addDays, formatWeekday, formatWeekMonth, startOfWeek, toDateKey, today } from "@/lib/time"

type Props = {
  selected: Date
  onSelect: (date: Date) => void
  className?: string
  allowPast?: boolean // admin views past days; teachers cannot book them
}

// Mobile date picker: one week at a time, Monday first. Past days are disabled unless allowPast.
export function DateStrip({ selected, onSelect, className, allowPast = false }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(selected))
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const isThisWeek = weekStart <= startOfWeek(today())
  const selectedKey = toDateKey(selected)
  const todayKey = toDateKey(today())
  const { entries } = useSchoolCalendar()

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" aria-live="polite">{formatWeekMonth(weekStart)}</p>
        <div className="-mr-3 flex">
          <Button
            variant="ghost"
            size="icon"
            className="size-12"
            aria-label="Previous week"
            disabled={!allowPast && isThisWeek}
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-12"
            aria-label="Next week"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = toDateKey(day)
          const isSelected = key === selectedKey
          const dayEntries = entriesOn(entries, key)
          return (
            <button
              key={key}
              type="button"
              disabled={!allowPast && day < today()}
              aria-pressed={isSelected}
              onClick={() => onSelect(day)}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-0.5 rounded-md",
                "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                "disabled:text-muted-foreground disabled:opacity-50",
                isSelected ? "bg-primary text-primary-foreground" : "enabled:hover:bg-accent",
                !isSelected && key === todayKey && "bg-accent",
              )}
            >
              <span className={cn("text-xs", !isSelected && "text-muted-foreground")}>{formatWeekday(day)}</span>
              <span className="text-base font-medium">{day.getDate()}</span>
              {/* Dot for a holiday or event; an empty space on other days keeps the numbers in line. */}
              <span className={cn("size-1 rounded-full", dayEntries.length > 0 ? "bg-current" : "bg-transparent")} aria-hidden />
              {dayEntries.length > 0 && <span className="sr-only">, {dayEntries.map(describeEntry).join(", ")}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
