import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WHATSAPP_PATTERN, fetchAdminWhatsapp, saveAdminWhatsapp } from "@/data/school-setting"

// "012-345 6789" → "60123456789"
function toWhatsappNumber(input: string) {
  const digits = input.replace(/\D/g, "")
  return digits.startsWith("0") ? `6${digits}` : digits
}

type Status = "loading" | "load-failed" | "idle" | "saving" | "saved" | "save-failed"

// Admin: the number behind the teachers' WhatsApp button. Change it when a new admin takes over.
export function WhatsappForm() {
  const [number, setNumber] = useState("")
  const [status, setStatus] = useState<Status>("loading")
  const [inputError, setInputError] = useState("")

  useEffect(() => {
    fetchAdminWhatsapp().then(
      (saved) => {
        setNumber(saved)
        setStatus("idle")
      },
      () => setStatus("load-failed"),
    )
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const clean = toWhatsappNumber(number)
    if (!WHATSAPP_PATTERN.test(clean)) {
      setInputError("Enter a Malaysian phone number. Example: 012-345 6789.")
      return
    }
    setStatus("saving")
    try {
      await saveAdminWhatsapp(clean)
      setNumber(clean)
      setStatus("saved")
    } catch {
      setStatus("save-failed")
    }
  }

  const message =
    inputError ||
    (status === "saved" ? "Saved. The WhatsApp button now opens this number." : "") ||
    (status === "save-failed" ? "Could not save the number. Check your connection, then try again." : "")
  const isError = inputError !== "" || status === "save-failed"

  return (
    <section className="space-y-3" aria-labelledby="whatsapp-title">
      <div className="space-y-1">
        <h2 id="whatsapp-title" className="text-lg font-semibold">Admin WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          Teachers tap the WhatsApp button to reach this number. Anyone who opens the booking page can see it.
        </p>
      </div>

      {status === "loading" && <p className="text-muted-foreground">Loading…</p>}
      {status === "load-failed" && (
        <p role="alert" className="text-sm text-destructive">
          Could not load the number. Check your connection, then reload the page.
        </p>
      )}
      {status !== "loading" && status !== "load-failed" && (
        <form onSubmit={submit} className="space-y-1">
          <Label htmlFor="admin-whatsapp" className="font-normal text-muted-foreground">WhatsApp number</Label>
          <div className="flex flex-wrap items-end gap-2">
            <Input
              id="admin-whatsapp"
              type="tel"
              className="h-12 min-w-0 flex-1 basis-48 text-base"
              maxLength={20}
              value={number}
              onChange={(e) => {
                setNumber(e.target.value)
                setInputError("")
                setStatus("idle")
              }}
              aria-invalid={inputError !== ""}
              aria-describedby="admin-whatsapp-message"
            />
            <Button type="submit" variant="outline" className="h-12" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Save number"}
            </Button>
          </div>
          <p id="admin-whatsapp-message" role="status" className={isError ? "text-sm text-destructive" : "text-sm"}>
            {message}
          </p>
        </form>
      )}
    </section>
  )
}
