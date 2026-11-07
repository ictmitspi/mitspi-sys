import type { ListItem } from "@/data/school"

export const MAX_NAME_LENGTH = 50
export const MAX_SHORT_NAME_LENGTH = 10

// Error text for a new or changed name, or "" when it is fine.
export function nameError(items: ListItem[], name: string, exceptId?: string) {
  const clean = name.trim().toLowerCase()
  if (clean === "") return "Enter a name."
  if (items.some((i) => i.id !== exceptId && i.name.toLowerCase() === clean)) {
    return "This name is already in the list."
  }
  return ""
}

// Same for a short form (BM, 1B). Short forms are saved in capitals.
export function shortNameError(items: ListItem[], shortName: string, exceptId?: string) {
  const clean = shortName.trim().toUpperCase()
  if (clean === "") return "Enter a short form."
  if (items.some((i) => i.id !== exceptId && i.shortName?.toUpperCase() === clean)) {
    return "This short form is already in the list."
  }
  return ""
}
