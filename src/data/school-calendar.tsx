import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { HolidayRow } from "@/lib/holiday-feed"
import { supabase } from "@/lib/supabase"

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

const ENTRY_COLUMNS = "id, kind, name, start_date, end_date"

type EntryRow = { id: string; kind: string; name: string; start_date: string; end_date: string }

// The database writes the kind as "SCHOOL_HOLIDAY"; the app as "school-holiday".
function toEntry(row: EntryRow): CalendarEntry {
  return {
    id: row.id,
    kind: row.kind.toLowerCase().replace("_", "-") as EntryKind,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
  }
}

type SchoolCalendarStore = {
  entries: CalendarEntry[]
  loadFailed: boolean
  saveError: string | null
  addEntry: (fields: EntryFields) => void
  editEntry: (id: string, fields: EntryFields) => void
  removeEntry: (id: string) => void
  replacePublicHolidays: (rows: HolidayRow[]) => Promise<void>
}

function toRow(fields: EntryFields) {
  return {
    kind: fields.kind.toUpperCase().replace("-", "_"),
    name: fields.name,
    start_date: fields.startDate,
    end_date: fields.endDate,
  }
}

const SchoolCalendarContext = createContext<SchoolCalendarStore | null>(null)

// Public holidays (from Google, through the admin's update) plus the
// school holidays and events that the admin adds. Information only: no date is blocked.
// Everyone reads them. RLS lets only the admin add, change or remove them.
export function SchoolCalendarProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function load() {
    const { data, error } = await supabase.from("calendar_entry").select(ENTRY_COLUMNS)
    if (error) {
      setLoadFailed(true)
      return
    }
    setLoadFailed(false)
    setEntries((data as EntryRow[]).map(toEntry))
  }

  useEffect(() => {
    void load()
  }, [])

    // Shows or clears the save error. Returns true when the save failed.
  function saveFailed(error: unknown) {
    setSaveError(error ? "Could not save the change. Check your connection, then try again." : null)
    return Boolean(error)
  }

  // The screen changes only after the database saved the change.
  async function addEntry(fields: EntryFields) {
    const { data, error } = await supabase.from("calendar_entry").insert(toRow(fields)).select(ENTRY_COLUMNS).single()
    if (saveFailed(error)) return
    const saved = toEntry(data as EntryRow)
    setEntries((current) => [...current, saved])
  }

  async function editEntry(id: string, fields: EntryFields) {
    const { data, error } = await supabase
      .from("calendar_entry").update(toRow(fields)).eq("id", id).select(ENTRY_COLUMNS).single()
    if (saveFailed(error)) return
    const saved = toEntry(data as EntryRow)
    setEntries((current) => current.map((e) => (e.id === id ? saved : e)))
  }

  async function removeEntry(id: string) {
    const { error } = await supabase.from("calendar_entry").delete().eq("id", id)
    if (saveFailed(error)) return
    setEntries((current) => current.filter((e) => e.id !== id))
  }

  // "Update from Google". One database call swaps all public holidays (07-calendar.sql).
  async function replacePublicHolidays(rows: HolidayRow[]) {
    const { error } = await supabase.rpc("replace_public_holidays", { p_rows: rows })
    if (error) throw error
    await load()
  }

  const store: SchoolCalendarStore = {
    entries,
    loadFailed,
    saveError,
    addEntry,
    editEntry,
    removeEntry,
    replacePublicHolidays,
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
