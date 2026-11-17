export const SCHOOL_NAME = "Maahad Integrasi Tahfiz Selangor Pandan Indah"

// shortName: the school's own short form (BM, 1B). Rooms have none yet.
export type ListItem = { id: string; name: string; shortName?: string; isActive: boolean }
export type ListKey = "rooms" | "classes" | "subjects"
export type SchoolLists = Record<ListKey, ListItem[]>

export const OPEN_MINUTES = 7 * 60 + 30 // 7:30 AM
export const CLOSE_MINUTES = 18 * 60 + 30 // 6:30 PM
export const SLOT_MINUTES = 30
