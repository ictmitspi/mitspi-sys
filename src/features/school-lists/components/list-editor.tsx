import { useState, type FormEvent } from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ListItem } from "@/data/school"
import type { ItemFields } from "@/data/school-lists"
import {
  MAX_NAME_LENGTH, MAX_SHORT_NAME_LENGTH, nameError, shortNameError,
} from "@/features/school-lists/validate"

type Props = {
  title: string // "Rooms"
  noun: string // "room"
  hasShortName: boolean // classes and subjects have short forms (1B, BM)
  items: ListItem[]
  onAdd: (fields: ItemFields) => void
  onEdit: (id: string, fields: ItemFields) => void
  onSetActive: (id: string, isActive: boolean) => void
}

// One list: rename or hide each item, add a new one. Hide, not delete: old bookings keep it.
export function ListEditor({ title, noun, hasShortName, items, onAdd, onEdit, onSetActive }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const activeCount = items.filter((i) => i.isActive).length

  return (
    <section className="space-y-3" aria-labelledby={`${noun}-title`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id={`${noun}-title`} className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{activeCount} of {items.length} in the booking form</p>
      </div>

      <ul className="divide-y rounded-lg border">
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id} className="px-4 py-3">
              <ItemForm
                idPrefix={`edit-${item.id}`}
                legend={`Rename ${item.name}`}
                submitLabel="Save"
                items={items}
                hasShortName={hasShortName}
                initial={item}
                onSubmit={(fields) => {
                  onEdit(item.id, fields)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={item.id} className="flex items-center gap-1 py-1 pr-1 pl-4">
              <div className="min-w-0 flex-1">
                <p className={cn("break-words", !item.isActive && "text-muted-foreground")}>
                  {item.name}
                  {item.shortName && <span className="text-muted-foreground"> ({item.shortName})</span>}
                </p>
                {!item.isActive && <p className="text-sm text-muted-foreground">Hidden from the booking form</p>}
              </div>
              <Button variant="ghost" className="h-12" aria-label={`Rename ${item.name}`}
                onClick={() => setEditingId(item.id)}>
                Rename
              </Button>
              <Button
                variant="ghost"
                className="h-12"
                aria-label={`${item.isActive ? "Hide" : "Show"} ${item.name}`}
                disabled={item.isActive && activeCount === 1}
                onClick={() => onSetActive(item.id, !item.isActive)}
              >
                {item.isActive ? "Hide" : "Show"}
              </Button>
            </li>
          ),
        )}
      </ul>
      {activeCount === 1 && (
        <p className="text-sm text-muted-foreground">At least one {noun} must stay in the booking form.</p>
      )}

      <ItemForm idPrefix={`add-${noun}`} legend={`Add a ${noun}`} submitLabel="Add" items={items}
        hasShortName={hasShortName} onSubmit={onAdd} />
    </section>
  )
}

type ItemFormProps = {
  idPrefix: string
  legend: string
  submitLabel: string
  items: ListItem[]
  hasShortName: boolean
  onSubmit: (fields: ItemFields) => void
  initial?: ListItem
  onCancel?: () => void
}

function ItemForm({ idPrefix, legend, submitLabel, items, hasShortName, onSubmit, initial, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [shortName, setShortName] = useState(initial?.shortName ?? "")
  const [errors, setErrors] = useState({ name: "", shortName: "" })

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = {
      name: nameError(items, name, initial?.id),
      shortName: hasShortName ? shortNameError(items, shortName, initial?.id) : "",
    }
    if (found.name || found.shortName) {
      setErrors(found)
      return
    }
    onSubmit({ name: name.trim(), shortName: hasShortName ? shortName.trim().toUpperCase() : undefined })
    setName("")
    setShortName("")
  }

  return (
    <form onSubmit={submit}>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">{legend}</legend>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-40 space-y-1">
            <Label htmlFor={`${idPrefix}-name`} className="font-normal text-muted-foreground">Name</Label>
            <Input
              id={`${idPrefix}-name`}
              className="h-12 text-base"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors({ ...errors, name: "" }) // the old error no longer fits the new text
              }}
              aria-invalid={!!errors.name}
              autoFocus={!!onCancel}
            />
          </div>
          {hasShortName && (
            <div className="w-28 space-y-1">
              <Label htmlFor={`${idPrefix}-short`} className="font-normal text-muted-foreground">Short form</Label>
              <Input
                id={`${idPrefix}-short`}
                className="h-12 text-base uppercase"
                maxLength={MAX_SHORT_NAME_LENGTH}
                value={shortName}
                onChange={(e) => {
                  setShortName(e.target.value)
                  setErrors({ ...errors, shortName: "" })
                }}
                aria-invalid={!!errors.shortName}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="outline" className="h-12">{submitLabel}</Button>
            {onCancel && <Button type="button" variant="ghost" className="h-12" onClick={onCancel}>Cancel</Button>}
          </div>
        </div>
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        {errors.shortName && <p className="text-sm text-destructive">{errors.shortName}</p>}
      </fieldset>
    </form>
  )
}
