import { createContext, useContext, useState, type ReactNode } from "react"
import { DEFAULT_LISTS, type ListItem, type ListKey, type SchoolLists } from "@/data/school"

export type ItemFields = { name: string; shortName?: string }

type SchoolListsStore = {
  lists: SchoolLists
  addItem: (key: ListKey, fields: ItemFields) => void
  editItem: (key: ListKey, id: string, fields: ItemFields) => void
  setItemActive: (key: ListKey, id: string, isActive: boolean) => void
}

const SchoolListsContext = createContext<SchoolListsStore | null>(null)

// Rooms, classes and subjects. Every feature reads them; the admin changes them.
// UI-only MVP: changes reset when the page reloads. Later: the API saves them.
export function SchoolListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<SchoolLists>(DEFAULT_LISTS)

  function update(key: ListKey, change: (items: ListItem[]) => ListItem[]) {
    setLists((current) => ({ ...current, [key]: change(current[key]) }))
  }

  const store: SchoolListsStore = {
    lists,
    addItem: (key, fields) => update(key, (items) => [...items, { id: crypto.randomUUID(), ...fields, isActive: true }]),
    editItem: (key, id, fields) => update(key, (items) => items.map((i) => (i.id === id ? { ...i, ...fields } : i))),
    setItemActive: (key, id, isActive) =>
      update(key, (items) => items.map((i) => (i.id === id ? { ...i, isActive } : i))),
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
