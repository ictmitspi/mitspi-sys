import { nameOf, useSchoolLists } from "@/data/school-lists"
import { formatDate, formatTimeRange } from "@/lib/time"
import type { BookingDetails, SlotSelection } from "@/features/booking/types"

type Props = { selection: SlotSelection; details?: BookingDetails }
type Lists = ReturnType<typeof useSchoolLists>["lists"]

export function BookingSummary({ selection, details }: Props) {
  const { lists } = useSchoolLists()
  const rows = summaryRows(lists, selection, details)

  return (
    <dl className="divide-y rounded-lg border">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

// [label, value] pairs. The change history uses the same labels and formats.
export function summaryRows(lists: Lists, selection: SlotSelection, details?: BookingDetails) {
  const rows: [string, string][] = [
    ["Room", nameOf(lists.rooms, selection.roomId)],
    ["Date", formatDate(selection.date)],
    ["Time", formatTimeRange(selection.startMinutes, selection.endMinutes)],
  ]
  if (details) {
    rows.push(
      ["Class", nameOf(lists.classes, details.classId)],
      ["Subject", nameOf(lists.subjects, details.subjectId)],
      ["Teacher", details.teacherName],
    )
  }
  return rows
}
