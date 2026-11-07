import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ListItem } from "@/data/school"
import { labelOf, useSchoolLists } from "@/data/school-lists"
import { ALL, type BookingFilters as Filters } from "@/features/booking/filters"
import { formatMonth } from "@/lib/time"

type Option = { value: string; label: string; short?: string }

type Props = {
  filters: Filters
  months: string[]
  onChange: (filters: Filters) => void
}

const withAll = (allLabel: string, options: Option[]) => [{ value: ALL, label: allLabel }, ...options]
// Hidden items stay in the filters: old bookings may still use them.
const fromList = (items: ListItem[]) =>
  items.map((i) => ({ value: i.id, label: i.isActive ? labelOf(i) : `${labelOf(i)} (hidden)`, short: i.shortName }))

export function BookingFilters({ filters, months, onChange }: Props) {
  const { lists } = useSchoolLists()
  const set = (key: keyof Filters) => (value: string) => onChange({ ...filters, [key]: value })

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:hidden">
      <FilterSelect id="filter-month" label="Month" value={filters.month} onChange={set("month")}
        options={withAll("All months", months.map((m) => ({ value: m, label: formatMonth(m) })))} />
      <FilterSelect id="filter-class" label="Class" value={filters.classId} onChange={set("classId")}
        options={withAll("All classes", fromList(lists.classes))} />
      <FilterSelect id="filter-subject" label="Subject" value={filters.subjectId} onChange={set("subjectId")}
        options={withAll("All subjects", fromList(lists.subjects))} />
      <FilterSelect id="filter-room" label="Room" value={filters.roomId} onChange={set("roomId")}
        options={withAll("All rooms", fromList(lists.rooms))} />
    </div>
  )
}

// Same look as the selects on the booking form. A closed filter is half the
// phone width, so it shows the short form (1K, PJPK), like the booking rows.
function FilterSelect({ id, label, value, options, onChange }: {
  id: string; label: string; value: string; options: Option[]; onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full text-base data-[size=default]:h-12">
          <SelectValue>{selected?.short ?? selected?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="h-11 text-base">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
