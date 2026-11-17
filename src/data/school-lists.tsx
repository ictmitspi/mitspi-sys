import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { ListItem, ListKey, SchoolLists } from "@/data/school"
import { supabase } from "@/lib/supabase"

export type ItemFields = { name: string; shortName?: string }

type SchoolListsStore = {
  lists: SchoolLists
  saveError: string | null
  addItem: (key: ListKey, fields: ItemFields) => void
  editItem: (key: ListKey, id: string, fields: ItemFields) => void
  setItemActive: (key: ListKey, id: string, isActive: boolean) => void
}

const SchoolListsContext = createContext<SchoolListsStore | null>(null)

const TABLES: Record<ListKey, string> = { rooms: "room", classes: "school_class", subjects: "subject" }

type ListRow = { id: number; name: string; short_name?: string | null; is_active: boolean }

// The database uses number ids; the app uses text ids. Convert once, here.
function toItem(row: ListRow): ListItem {
  return { id: String(row.id), name: row.name, shortName: row.short_name ?? undefined, isActive: row.is_active }
}

// Only classes and subjects have a short_name column.
function toRow(fields: ItemFields): { name: string; short_name?: string } {
  return fields.shortName === undefined ? { name: fields.name } : { name: fields.name, short_name: fields.shortName }
}

async function fetchList(key: ListKey) {
  const { data, error } = await supabase.from(TABLES[key]).select("*").order("id")
  if (error) throw error
  return (data as ListRow[]).map(toItem)
}

// Rooms, classes and subjects. Every feature reads them; the admin changes them.
// Everyone may read them. RLS lets only the admin add or change them.
export function SchoolListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<SchoolLists | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function load() {
    setLoadFailed(false)
    try {
      const [rooms, classes, subjects] = await Promise.all([
        fetchList("rooms"), fetchList("classes"), fetchList("subjects"),
      ])
      setLists({ rooms, classes, subjects })
    } catch {
      setLoadFailed(true)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  // The screen changes only after the database saved the row.
  async function save(key: ListKey, request: PromiseLike<{ data: unknown; error: unknown }>, id?: string) {
    const { data, error } = await request
    if (error) {
      setSaveError("Could not save the change. Check your connection, then try again.")
      return
    }
    setSaveError(null)
    const item = toItem(data as ListRow)
    setLists((current) => current && {
      ...current,
      [key]: id ? current[key].map((i) => (i.id === id ? item : i)) : [...current[key], item],
    })
  }

  if (loadFailed) {
    return (
      <div role="alert" className="mx-auto max-w-md space-y-4 px-4 py-10 text-center">
        <p>Could not load the rooms, classes and subjects. Check your connection.</p>
        <Button className="h-12" onClick={load}>Try again</Button>
      </div>
    )
  }
  if (!lists) return <p className="px-4 py-10 text-center text-muted-foreground">Loading…</p>

  const table = (key: ListKey) => supabase.from(TABLES[key])
  const store: SchoolListsStore = {
    lists,
    saveError,
    addItem: (key, fields) => void save(key, table(key).insert(toRow(fields)).select().single()),
    editItem: (key, id, fields) =>
      void save(key, table(key).update(toRow(fields)).eq("id", Number(id)).select().single(), id),
    setItemActive: (key, id, isActive) =>
      void save(key, table(key).update({ is_active: isActive }).eq("id", Number(id)).select().single(), id),
  }

  return <SchoolListsContext value={store}>{children}</SchoolListsContext>
}

export function useSchoolLists() {
  const store = useContext(SchoolListsContext)
  if (!store) throw new Error("useSchoolLists must be used inside SchoolListsProvider")
  return store
}

// Bookings keep ids, so a rename shows everywhere at once.
// Full name: booking details and CSV. Example: "Bahasa Melayu".
export function nameOf(items: ListItem[], id: string) {
  return items.find((i) => i.id === id)?.name ?? id
}

// Short form for tight rows, or the name if there is none. Example: "BM".
export function shortOf(items: ListItem[], id: string) {
  const found = items.find((i) => i.id === id)
  return found ? (found.shortName ?? found.name) : id
}

// Label for a select option. Example: "Bahasa Melayu (BM)".
export function labelOf(item: ListItem) {
  return item.shortName ? `${item.name} (${item.shortName})` : item.name
}

// What a form may offer: items in use, plus the current value if it was hidden later.
export function choosable(items: ListItem[], currentId?: string) {
  return items.filter((i) => i.isActive || i.id === currentId)
}
