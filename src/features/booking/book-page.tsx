import { useState } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { useBookings } from "@/features/booking/bookings-store"
import { DetailsStep } from "@/features/booking/components/details-step"
import { DoneStep } from "@/features/booking/components/done-step"
import { SlotStep } from "@/features/booking/components/slot-step"
import type { Booking, BookingDetails, SlotSelection } from "@/features/booking/types"

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

// Book a room: choose a slot, add details, confirm.
export function BookPage() {
  const { bookings, addBooking } = useBookings()
  const [selection, setSelection] = useState<SlotSelection | null>(null)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)
  const [step, setStep] = useState<"slot" | "details" | "done">("slot")

  const [token, setToken] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  function chooseSlot(newSelection: SlotSelection) {
    setSelection(newSelection)
    setStep("details")
  }

  function backToSlot() {
    setSaveError(null)
    setToken(null)
    setStep("slot")
  }

  async function confirm(details: BookingDetails) {
    if (!selection) return
    if (!token) {
      setSaveError("Wait for the robot check to finish, then try again.")
      return
    }
    setIsSending(true)
    setSaveError(null)
    const result = await addBooking({ ...selection, ...details }, token)
    setIsSending(false)
    if ("error" in result) {
      setSaveError(result.error)
      // A token works only once. A new key shows a fresh robot check.
      setToken(null)
      setAttempt((n) => n + 1)
      return
    }
    setConfirmed(result.booking)
    setStep("done")
  }

  function startNewBooking() {
    setSelection(null)
    setConfirmed(null)
    setToken(null)
    setStep("slot")
  }

  if (step === "details" && selection) {
    return (
      <DetailsStep selection={selection} onBack={backToSlot} onSubmit={confirm} error={saveError} isSending={isSending}>
        <Turnstile
          key={attempt}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setToken}
          onExpire={() => setToken(null)}
          options={{ size: "flexible" }}
        />
      </DetailsStep>
    )
  }
  if (step === "done" && confirmed) {
    return <DoneStep booking={confirmed} onNewBooking={startNewBooking} />
  }
  return <SlotStep bookings={bookings} initial={selection} onContinue={chooseSlot} />
}
