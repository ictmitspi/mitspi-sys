import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookingSummary } from "@/features/booking/components/booking-summary"
import { StepLayout } from "@/components/step-layout"
import { choosable, labelOf, useSchoolLists } from "@/data/school-lists"
import type { BookingDetails, SlotSelection } from "@/features/booking/types"

type Props = {
  selection: SlotSelection
  onBack: () => void
  onSubmit: (details: BookingDetails) => void
  initial?: BookingDetails
  submitLabel?: string
}

// Long subject names wrap onto a second line instead of being cut off.
const SELECT_TRIGGER =
  "w-full min-h-12 py-2 text-left text-base whitespace-normal data-[size=default]:h-auto *:data-[slot=select-value]:line-clamp-none"

export function DetailsStep({ selection, onBack, onSubmit, initial, submitLabel = "Confirm booking" }: Props) {
  const { lists } = useSchoolLists()
  const [classId, setClassId] = useState(initial?.classId ?? "")
  const [teacherName, setTeacherName] = useState(initial?.teacherName ?? "")
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? "")
  const [showErrors, setShowErrors] = useState(false)

  const classError = classId === "" ? "Choose a class." : ""
  const subjectError = subjectId === "" ? "Choose a subject." : ""
  const teacherError = teacherName.trim() === "" ? "Enter the teacher's name." : ""

  function submit() {
    if (classError || subjectError || teacherError) {
      setShowErrors(true)
      return
    }
    onSubmit({ classId, subjectId, teacherName: teacherName.trim() })
  }

  return (
    <StepLayout
      title="Booking details"
      onBack={onBack}
      footer={
        <Button className="h-12 w-full text-base" onClick={submit}>
          {submitLabel}
        </Button>
      }
    >
      <BookingSummary selection={selection} />

      <div className="space-y-2">
        <Label htmlFor="class">Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger id="class" className={SELECT_TRIGGER} aria-invalid={showErrors && !!classError}>
            <SelectValue placeholder="Choose a class" />
          </SelectTrigger>
          <SelectContent>
            {choosable(lists.classes, initial?.classId).map((c) => (
              <SelectItem key={c.id} value={c.id} className="h-11 text-base">
                {labelOf(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showErrors && classError && <p className="text-sm text-destructive">{classError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="teacher">Teacher name</Label>
        <Input
          id="teacher"
          className="h-12 text-base"
          placeholder="Example: Cikgu Ahmad"
          maxLength={80}
          autoComplete="name"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          aria-invalid={showErrors && !!teacherError}
        />
        {showErrors && teacherError && <p className="text-sm text-destructive">{teacherError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger id="subject" className={SELECT_TRIGGER} aria-invalid={showErrors && !!subjectError}>
            <SelectValue placeholder="Choose a subject" />
          </SelectTrigger>
          <SelectContent>
            {choosable(lists.subjects, initial?.subjectId).map((s) => (
              <SelectItem key={s.id} value={s.id} className="h-11 text-base">
                {labelOf(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showErrors && subjectError && <p className="text-sm text-destructive">{subjectError}</p>}
      </div>
    </StepLayout>
  )
}
