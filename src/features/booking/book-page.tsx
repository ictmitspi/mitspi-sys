import { useState } from "react"
import { useBookings } from "@/features/booking/bookings-store"
import { DetailsStep } from "@/features/booking/components/details-step"
import { DoneStep } from "@/features/booking/components/done-step"
import { SlotStep } from "@/features/booking/components/slot-step"
import type { Booking, BookingDetails, SlotSelection } from "@/features/booking/types"

// Book a room: choose a slot, add details, confirm.
export function BookPage() {
  const { bookings, addBooking } = useBookings()
  const [selection, setSelection] = useState<SlotSelection | null>(null)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)
  const [step, setStep] = useState<"slot" | "details" | "done">("slot")

  function chooseSlot(newSelection: SlotSelection) {
    setSelection(newSelection)
    setStep("details")
  }

  function confirm(details: BookingDetails) {
    if (!selection) return
    const booking = { id: crypto.randomUUID(), ...selection, ...details }
    addBooking(booking)
    setConfirmed(booking)
    setStep("done")
  }

  function startNewBooking() {
    setSelection(null)
    setConfirmed(null)
    setStep("slot")
  }

  if (step === "details" && selection) {
    return <DetailsStep selection={selection} onBack={() => setStep("slot")} onSubmit={confirm} />
  }
  if (step === "done" && confirmed) {
    return <DoneStep booking={confirmed} onNewBooking={startNewBooking} />
  }
  return <SlotStep bookings={bookings} initial={selection} onContinue={chooseSlot} />
}
