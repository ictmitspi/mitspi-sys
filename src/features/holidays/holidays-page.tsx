import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KIND_LABEL, useSchoolCalendar, type CalendarEntry } from "@/data/school-calendar"
import { EntryForm } from "@/features/holidays/components/entry-form"
import { downloadPublicHolidays } from "@/features/holidays/download"
import { formatDateRange, toDateKey, today } from "@/lib/time"

type UpdateStatus = { state: "idle" | "working" | "done" | "failed"; message: string }

const byStartDate = (a: CalendarEntry, b: CalendarEntry) => a.startDate.localeCompare(b.startDate)

// Admin: school holidays and events (typed by hand) and public holidays (from Google).
// Teachers see all of them on the booking page. They do not block booking.
export function HolidaysPage() {
  const { entries, addEntry, editEntry, removeEntry, replacePublicHolidays } = useSchoolCalendar()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<UpdateStatus>({ state: "idle", message: "" })

  const ownEntries = entries.filter((e) => e.kind !== "public-holiday").sort(byStartDate)
  const publicHolidays = entries.filter((e) => e.kind === "public-holiday").sort(byStartDate)
  const thisYear = today().getFullYear()
  const years = [String(thisYear), String(thisYear + 1)]
  const todayKey = toDateKey(today())

  async function updatePublicHolidays() {
    setStatus({ state: "working", message: "" })
    try {
      const rows = await downloadPublicHolidays(years)
      replacePublicHolidays(rows)
      setStatus({ state: "done", message: `Updated: ${rows.length} public holidays for ${years.join(" and ")}.` })
    } catch {
      setStatus({ state: "failed", message: "Could not download the holidays. The old list stays. Try again later." })
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 px-4 pt-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Holidays and events</h1>
        <p className="text-muted-foreground">
          Teachers see these on the booking page as a note. They can still book on these days.
        </p>
      </div>

      <section className="space-y-3" aria-labelledby="own-title">
        <h2 id="own-title" className="text-lg font-semibold">School holidays and events</h2>
        {ownEntries.length === 0 ? (
          <p className="rounded-lg border px-4 py-3 text-muted-foreground">
            No school holidays or events yet. Add the first one below.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {ownEntries.map((entry) =>
              editingId === entry.id ? (
                <li key={entry.id} className="px-4 py-3">
                  <EntryForm idPrefix={`edit-${entry.id}`} legend={`Change ${entry.name}`} submitLabel="Save"
                    initial={entry} onCancel={() => setEditingId(null)}
                    onSubmit={(fields) => { editEntry(entry.id, fields); setEditingId(null) }} />
                </li>
              ) : (
                <li key={entry.id} className="flex items-center gap-1 py-1 pr-1 pl-4">
                  <div className="min-w-0 flex-1 py-2">
                    <p className="break-words">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {KIND_LABEL[entry.kind]} · {formatDateRange(entry.startDate, entry.endDate)}
                    </p>
                  </div>
                  <Button variant="ghost" className="h-12" aria-label={`Change ${entry.name}`}
                    onClick={() => setEditingId(entry.id)}>
                    Change
                  </Button>
                  {/* No confirm step: an entry is quick to add again, and no booking depends on it. */}
                  <Button variant="ghost" className="h-12 text-destructive hover:text-destructive"
                    aria-label={`Remove ${entry.name}`} onClick={() => removeEntry(entry.id)}>
                    Remove
                  </Button>
                </li>
              ),
            )}
          </ul>
        )}
        <EntryForm idPrefix="add-entry" legend="Add a school holiday or event" submitLabel="Add" onSubmit={addEntry} />
      </section>

      <section className="space-y-3" aria-labelledby="public-title">
        <div className="space-y-1">
          <h2 id="public-title" className="text-lg font-semibold">Public holidays</h2>
          <p className="text-sm text-muted-foreground">
            National and Selangor holidays from Google's Malaysia holiday calendar. Islamic dates are
            estimates until they are announced.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-12" disabled={status.state === "working"} onClick={updatePublicHolidays}>
            {status.state === "working" ? "Updating…" : "Update from Google"}
          </Button>
          <p role="status" className={status.state === "failed" ? "text-sm text-destructive" : "text-sm"}>
            {status.message}
          </p>
        </div>
        <ul className="divide-y rounded-lg border">
          {publicHolidays.map((h) => (
            <li key={h.id} className={h.endDate < todayKey ? "px-4 py-3 text-muted-foreground" : "px-4 py-3"}>
              <p className="break-words">{h.name}</p>
              <p className="text-sm text-muted-foreground">{formatDateRange(h.startDate, h.endDate)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
