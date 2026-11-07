import type { Booking } from "@/features/booking/types"
import { addDays, toDateKey, today } from "@/lib/time"

// Sample bookings so the demo shows locked times, a past booking and a filled dashboard.
// Remove when the real API exists.
const day = (offset: number) => toDateKey(addDays(today(), offset))

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "mock-7", roomId: "makmal-komputer-2", date: day(-5),
    startMinutes: 9 * 60, endMinutes: 10 * 60,
    classId: "4b", teacherName: "Cikgu Farid", subjectId: "sej",
  },
  {
    id: "mock-1", roomId: "makmal-komputer-1", date: day(1),
    startMinutes: 8 * 60, endMinutes: 9 * 60 + 30,
    classId: "3b", teacherName: "Cikgu Aminah", subjectId: "sc",
  },
  {
    id: "mock-2", roomId: "makmal-komputer-1", date: day(1),
    startMinutes: 14 * 60, endMinutes: 15 * 60,
    classId: "5k", teacherName: "Cikgu Ravi", subjectId: "mt",
  },
  {
    id: "mock-3", roomId: "makmal-komputer-2", date: day(0),
    startMinutes: 16 * 60, endMinutes: 17 * 60,
    classId: "1b", teacherName: "Cikgu Lee", subjectId: "aqh",
  },
  {
    id: "mock-4", roomId: "makmal-komputer-2", date: day(3),
    startMinutes: 10 * 60, endMinutes: 11 * 60,
    classId: "3k", teacherName: "Cikgu Siti", subjectId: "ba",
  },
  {
    id: "mock-5", roomId: "makmal-komputer-1", date: day(7),
    startMinutes: 9 * 60, endMinutes: 10 * 60 + 30,
    classId: "5b", teacherName: "Cikgu Aminah", subjectId: "di",
  },
  {
    id: "mock-6", roomId: "makmal-komputer-2", date: day(35),
    startMinutes: 11 * 60, endMinutes: 12 * 60,
    classId: "2b", teacherName: "Cikgu Farid", subjectId: "sej",
  },
]
