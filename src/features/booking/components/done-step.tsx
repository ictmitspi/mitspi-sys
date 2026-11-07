import { Button } from "@/components/ui/button"
import { BookingSummary } from "@/features/booking/components/booking-summary"
import { StepLayout } from "@/components/step-layout"
import type { Booking } from "@/features/booking/types"

type Props = { booking: Booking; onNewBooking: () => void }

export function DoneStep({ booking, onNewBooking }: Props) {
  return (
    <StepLayout
      title="Booking confirmed"
      footer={
        <Button className="h-12 w-full text-base" onClick={onNewBooking}>
          Make another booking
        </Button>
      }
    >
      <p className="text-muted-foreground">
        This time is now locked. Other teachers cannot book it.
        To change or cancel it, ask the admin.
      </p>
      <BookingSummary selection={booking} details={booking} />
    </StepLayout>
  )
}
