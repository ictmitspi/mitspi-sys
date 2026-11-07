import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StepLayout } from "@/components/step-layout"
import { useBookings } from "@/features/booking/bookings-store"
import { BookingHistory } from "@/features/booking/components/booking-history"
import { BookingSummary } from "@/features/booking/components/booking-summary"
import { DetailsStep } from "@/features/booking/components/details-step"
import { SlotStep } from "@/features/booking/components/slot-step"
import { hasStarted } from "@/features/booking/slots"
import type { SlotSelection } from "@/features/booking/types"

// Admin: see one booking, edit it (same steps as booking) or remove it.
export function BookingEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bookings, updateBooking, removeBooking } = useBookings()
  const [step, setStep] = useState<"view" | "slot" | "details">("view")
  const [selection, setSelection] = useState<SlotSelection | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const booking = bookings.find((b) => b.id === id)
  // The page that opened this booking (the day view sends its URL with the date). Default: the list.
  const from = (useLocation().state as { from?: string } | null)?.from
  const backToList = () => (from ? navigate(from) : navigate("..", { relative: "path" }))

  if (!booking) {
    return (
      <StepLayout
        title="Booking not found"
        onBack={backToList}
        footer={<Button className="h-12 w-full text-base" onClick={backToList}>Back to bookings</Button>}
      >
        <p className="text-muted-foreground">It may have been removed.</p>
      </StepLayout>
    )
  }

  // History stays true for reports: a started booking is read-only.
  if (hasStarted(booking)) {
    return (
      <StepLayout
        title="Booking"
        onBack={backToList}
        footer={<Button className="h-12 w-full text-base" onClick={backToList}>Back to bookings</Button>}
      >
        <p className="text-muted-foreground">
          This booking has started, so it cannot be changed or removed. It stays in the reports.
        </p>
        <BookingSummary selection={booking} details={booking} />
        <BookingHistory booking={booking} />
      </StepLayout>
    )
  }

  if (step === "slot") {
    return (
      <SlotStep
        title="Change time"
        bookings={bookings.filter((b) => b.id !== booking.id)} // its own slots stay free
        initial={selection ?? booking}
        onBack={() => setStep("view")}
        onContinue={(newSelection) => {
          setSelection(newSelection)
          setStep("details")
        }}
      />
    )
  }

  if (step === "details" && selection) {
    return (
      <DetailsStep
        selection={selection}
        initial={booking}
        submitLabel="Save changes"
        onBack={() => setStep("slot")}
        onSubmit={(details) => {
          updateBooking({ ...booking, ...selection, ...details })
          setSelection(null)
          setIsSaved(true)
          setStep("view")
        }}
      />
    )
  }

  const remove = () => {
    removeBooking(booking.id)
    if (from) navigate(from)
    else navigate("..", { relative: "path", state: { removed: booking } }) // the list says what was removed
  }

  return (
    <StepLayout
      title="Booking"
      onBack={backToList}
      footer={
        <Button className="h-12 w-full text-base" onClick={() => { setIsSaved(false); setStep("slot") }}>
          Edit booking
        </Button>
      }
    >
      {isSaved && <p role="status" className="font-medium">Changes saved.</p>}
      <BookingSummary selection={booking} details={booking} />
      <BookingHistory booking={booking} />
      <RemoveBookingButton onConfirm={remove} />
    </StepLayout>
  )
}

// Removing cannot be undone, so ask first (NN/g: confirm destructive actions).
function RemoveBookingButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="h-12 w-full text-base text-destructive hover:text-destructive">
          Remove booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            The time becomes free for other teachers. You cannot undo this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-12">Keep booking</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="h-12" onClick={onConfirm}>
            Remove booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
