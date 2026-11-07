// Times are minutes from midnight. Example: 450 = 7:30 AM.
export type SlotSelection = {
  roomId: string
  date: string // YYYY-MM-DD
  startMinutes: number
  endMinutes: number
}

// Ids point into the school lists (src/data/school-lists.tsx).
export type BookingDetails = {
  classId: string
  subjectId: string
  teacherName: string
}

export type Booking = SlotSelection & BookingDetails & { id: string }
