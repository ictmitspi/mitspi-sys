import type { SchoolLists } from "@/data/school"
import { nameOf } from "@/data/school-lists"
import type { Booking } from "@/features/booking/types"
import { formatTime } from "@/lib/time"

// Spreadsheet rows. Dates stay YYYY-MM-DD so Excel can sort them.
export function bookingRows(bookings: Booking[], lists: SchoolLists): string[][] {
  return [
    ["Date", "Start", "End", "Room", "Class", "Subject", "Teacher"],
    ...bookings.map((b) => [
      b.date, formatTime(b.startMinutes), formatTime(b.endMinutes),
      nameOf(lists.rooms, b.roomId), nameOf(lists.classes, b.classId),
      nameOf(lists.subjects, b.subjectId), b.teacherName,
    ]),
  ]
}
