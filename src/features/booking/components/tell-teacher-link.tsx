import { Button } from "@/components/ui/button"
import { useSchoolLists } from "@/data/school-lists"
import { summaryRows } from "@/features/booking/components/booking-summary"
import type { Booking } from "@/features/booking/types"

// The teacher is not told when the admin changes or removes a booking.
// This opens WhatsApp with the message written; the admin picks the teacher (no numbers stored).
export function TellTeacherLink({ booking, change }: { booking: Booking; change: "changed" | "removed" }) {
  const { lists } = useSchoolLists()
  const lines = summaryRows(lists, booking, booking)
    .filter(([label]) => label !== "Teacher")
    .map(([label, value]) => `${label}: ${value}`)
  const intro = change === "changed"
    ? "The admin changed your room booking. The new booking:"
    : "The admin removed your room booking:"
  const message = [`Salam ${booking.teacherName}. ${intro}`, ...lines].join("\n")

  return (
    <Button asChild variant="outline" className="h-12 w-full text-base">
      <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
        Tell the teacher on WhatsApp
      </a>
    </Button>
  )
}
