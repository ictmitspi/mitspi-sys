import { createContext, useContext, useState, type ReactNode } from "react"
import publicHolidays from "@/data/holidays.json"
import type { HolidayRow } from "@/lib/holiday-feed"

export type EntryKind = "public-holiday" | "school-holiday" | "event"

// One holiday or event. Dates are YYYY-MM-DD; endDate is the last day (same as start for one day).
export type CalendarEntry = { id: string; kind: EntryKind; name: string; startDate: string; endDate: string }

// What the admin types. Public holidays come only from the feed.
export type EntryFields = Omit<CalendarEntry, "id" | "kind"> & { kind: Exclude<EntryKind, "public-holiday"> }

export const KIND_LABEL: Record<EntryKind, string> = {
  "public-holiday": "Public holiday",
  "school-holiday": "School holiday",
  event: "Event",
}

function toEntries(rows: HolidayRow[]): CalendarEntry[] {
  return rows.map((r) => ({
    id: `public-${r.date}-${r.name}`, kind: "public-holiday", name: r.name, startDate: r.date, endDate: r.date,
  }))
}

type SchoolCalendarStore = {
  entries: CalendarEntry[]
  addEntry: (fields: EntryFields) => void
  editEntry: (id: string, fields: EntryFields) => void
  removeEntry: (id: string) => void
  replacePublicHolidays: (rows: HolidayRow[]) => void
}

const SchoolCalendarContext = createContext<SchoolCalendarStore | null>(null)

// Public holidays (from src/data/holidays.json or the admin's update) plus the
// school holidays and events that the admin adds. Information only: no date is blocked.
// UI-only MVP: changes reset when the page reloads. Later: the API saves them.
export function SchoolCalendarProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CalendarEntry[]>(() => toEntries(publicHolidays))

  const store: SchoolCalendarStore = {
    entries,
    addEntry: (fields) => setEntries((current) => [...current, { id: crypto.randomUUID(), ...fields }]),
    editEntry: (id, fields) => setEntries((current) => current.map((e) => (e.id === id ? { ...e, ...fields } : e))),
    removeEntry: (id) => setEntries((current) => current.filter((e) => e.id !== id)),
    replacePublicHolidays: (rows) =>
      setEntries((current) => [...current.filter((e) => e.kind !== "public-holiday"), ...toEntries(rows)]),
  }

  return <SchoolCalendarContext value={store}>{children}</SchoolCalendarContext>
}

export function useSchoolCalendar() {
  const store = useContext(SchoolCalendarContext)
  if (!store) throw new Error("useSchoolCalendar must be used inside SchoolCalendarProvider")
  return store
}

// Every holiday or event on one day, public holidays first.
export function entriesOn(entries: CalendarEntry[], dateKey: string) {
  return entries
    .filter((e) => e.startDate <= dateKey && dateKey <= e.endDate)
    .sort((a, b) => Number(b.kind === "public-holiday") - Number(a.kind === "public-holiday"))
}

// Example: "Public holiday: Diwali"
export function describeEntry(entry: CalendarEntry) {
  return `${KIND_LABEL[entry.kind]}: ${entry.name}`
}
