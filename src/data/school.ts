export const SCHOOL_NAME = "Maahad Integrasi Tahfiz Selangor Pandan Indah"

// shortName: the school's own short form (BM, 1B). Rooms have none yet.
export type ListItem = { id: string; name: string; shortName?: string; isActive: boolean }
export type ListKey = "rooms" | "classes" | "subjects"
export type SchoolLists = Record<ListKey, ListItem[]>

const item = (id: string, name: string, shortName?: string): ListItem => ({ id, name, shortName, isActive: true })
const withShortName = ([name, shortName]: [string, string]) => item(shortName.toLowerCase(), name, shortName)

// Starting lists from the school (20 Oct 2026).
// Rooms: the school's computer labs. The admin changes any list on "School lists".
export const DEFAULT_LISTS: SchoolLists = {
  rooms: [item("makmal-komputer-1", "Makmal Komputer 1"), item("makmal-komputer-2", "Makmal Komputer 2")],
  classes: ([
    ["1 Al Biruni", "1B"], ["1 Al Khawarizmi", "1K"],
    ["2 Al Biruni", "2B"], ["2 Al Khawarizmi", "2K"],
    ["3 Al Biruni", "3B"], ["3 Al Khawarizmi", "3K"],
    ["4 Al Biruni", "4B"], ["4 Al Khawarizmi", "4K"],
    ["5 Al Biruni", "5B"], ["5 Al Khawarizmi", "5K"],
  ] as [string, string][]).map(withShortName),
  subjects: ([
    ["Bahasa Melayu", "BM"],
    ["Bahasa Inggeris", "BI"],
    ["Matematik", "MT"],
    ["Sains", "SC"],
    ["Sejarah", "SEJ"],
    ["Bahasa Arab", "BA"],
    ["Al Lughah Al Arabiah Al Muasirah", "LAM"],
    ["Al Quran wa As Sunnah", "QS"],
    ["Al Syariah", "SYA"],
    ["Dirasah Al Islamiyah", "DI"],
    ["Ekonomi", "EKO"],
    ["Geografi", "GEO"],
    ["Hifz Al Quran", "AQH"],
    ["Lughatul Arabiah", "LA"],
    ["Maharat Al Quran", "MQ"],
    ["Matematik Tambahan", "ADM"],
    ["Pend Jasmani dan Pend Kesihatan", "PJPK"],
    ["Pendidikan Al Quran dan As Sunnah", "PQS"],
    ["Pendidikan Islam", "PI"],
    ["Pendidikan Seni Visual", "PSV"],
    ["Pendidikan Syariah Islamiyah", "PSI"],
    ["Prinsip Perakaunan", "AKAUN"],
    ["Reka Bentuk Teknologi", "RBT"],
    ["Ulum Al Quran", "UM"],
    ["Usul Al Din", "USL"],
  ] as [string, string][]).map(withShortName),
}

export const OPEN_MINUTES = 7 * 60 + 30 // 7:30 AM
export const CLOSE_MINUTES = 18 * 60 + 30 // 6:30 PM
export const SLOT_MINUTES = 30

// How teachers reach the admin. Placeholder: replace with the real number.
// Country code, digits only (Malaysia 60...). It is public in the page: use the school's number.
export const ADMIN_WHATSAPP = "60123456789"
