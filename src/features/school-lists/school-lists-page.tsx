import type { ListKey } from "@/data/school"
import { useSchoolLists } from "@/data/school-lists"
import { ListEditor } from "@/features/school-lists/components/list-editor"

const LISTS: { key: ListKey; title: string; noun: string; hasShortName: boolean }[] = [
  { key: "rooms", title: "Rooms", noun: "room", hasShortName: false },
  { key: "classes", title: "Classes", noun: "class", hasShortName: true },
  { key: "subjects", title: "Subjects", noun: "subject", hasShortName: true },
]

// Admin: the rooms, classes and subjects that teachers choose from.
export function SchoolListsPage() {
  const { lists, addItem, editItem, setItemActive } = useSchoolLists()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">School lists</h1>
        <p className="text-muted-foreground">
          Teachers choose from these lists when they book. Hide an item to stop new bookings with it.
          Old bookings keep it.
        </p>
      </div>
      {LISTS.map(({ key, title, noun, hasShortName }) => (
        <ListEditor
          key={key}
          title={title}
          noun={noun}
          hasShortName={hasShortName}
          items={lists[key]}
          onAdd={(fields) => addItem(key, fields)}
          onEdit={(id, fields) => editItem(key, id, fields)}
          onSetActive={(id, isActive) => setItemActive(key, id, isActive)}
        />
      ))}
    </div>
  )
}
