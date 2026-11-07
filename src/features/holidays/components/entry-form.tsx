import { useState, type FormEvent, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KIND_LABEL, type CalendarEntry, type EntryFields } from "@/data/school-calendar"

const KINDS: EntryFields["kind"][] = ["school-holiday", "event"]
const MAX_NAME_LENGTH = 80

type Props = {
  idPrefix: string
  legend: string
  submitLabel: string
  onSubmit: (fields: EntryFields) => void
  initial?: CalendarEntry
  onCancel?: () => void
}

// Add or change a school holiday or an event. One day, or a range of days.
export function EntryForm({ idPrefix, legend, submitLabel, onSubmit, initial, onCancel }: Props) {
  const [kind, setKind] = useState<EntryFields["kind"]>(
    initial?.kind === "event" ? "event" : "school-holiday",
  )
  const [name, setName] = useState(initial?.name ?? "")
  const [startDate, setStartDate] = useState(initial?.startDate ?? "")
  const [endDate, setEndDate] = useState(initial && initial.endDate !== initial.startDate ? initial.endDate : "")
  const [errors, setErrors] = useState({ name: "", startDate: "", endDate: "" })

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = {
      name: name.trim() === "" ? "Enter a name." : "",
      startDate: startDate === "" ? "Choose the first day." : "",
      endDate: endDate !== "" && endDate < startDate ? "The last day must be on or after the first day." : "",
    }
    if (found.name || found.startDate || found.endDate) {
      setErrors(found)
      return
    }
    onSubmit({ kind, name: name.trim(), startDate, endDate: endDate || startDate })
    setName("")
    setStartDate("")
    setEndDate("")
  }

  return (
    // noValidate: show our own clear messages, not the browser's small bubbles.
    <form onSubmit={submit} noValidate>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">{legend}</legend>

        {/* Same look as the room choice on the booking page. */}
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Type">
          {KINDS.map((k) => (
            <Button key={k} type="button" variant={k === kind ? "default" : "outline"} className="h-12 text-base"
              aria-pressed={k === kind} onClick={() => setKind(k)}>
              {KIND_LABEL[k]}
            </Button>
          ))}
        </div>

        <Field id={`${idPrefix}-name`} label="Name" error={errors.name}>
          <Input id={`${idPrefix}-name`} className="h-12 text-base" maxLength={MAX_NAME_LENGTH}
            placeholder={kind === "event" ? "Example: Hari Sukan" : "Example: Cuti Penggal 3"}
            value={name} aria-invalid={!!errors.name} autoFocus={!!onCancel}
            onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: "" }) }} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id={`${idPrefix}-start`} label="First day" error={errors.startDate}>
            <Input id={`${idPrefix}-start`} type="date" className="h-12 text-base" value={startDate}
              aria-invalid={!!errors.startDate}
              onChange={(e) => { setStartDate(e.target.value); setErrors({ ...errors, startDate: "", endDate: "" }) }} />
          </Field>
          <Field id={`${idPrefix}-end`} label="Last day (optional)" error={errors.endDate}>
            <Input id={`${idPrefix}-end`} type="date" className="h-12 text-base" value={endDate} min={startDate}
              aria-invalid={!!errors.endDate}
              onChange={(e) => { setEndDate(e.target.value); setErrors({ ...errors, endDate: "" }) }} />
          </Field>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="outline" className="h-12">{submitLabel}</Button>
          {onCancel && <Button type="button" variant="ghost" className="h-12" onClick={onCancel}>Cancel</Button>}
        </div>
      </fieldset>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <Label htmlFor={id} className="font-normal text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
