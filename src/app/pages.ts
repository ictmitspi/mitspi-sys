import type { ComponentType } from "react"
import { CalendarClock, CalendarDays, CalendarPlus, ClipboardList, List, type LucideIcon } from "lucide-react"
import { BookPage } from "@/features/booking/book-page"
import { BookingsPage } from "@/features/booking/bookings-page"
import { DayViewPage } from "@/features/booking/day-view-page"
import { HolidaysPage } from "@/features/holidays/holidays-page"
import { SchoolListsPage } from "@/features/school-lists/school-lists-page"

export type Page = {
  path: string
  label: string
  icon: LucideIcon
  component: ComponentType
  access: "public" | "admin" // admin pages need sign-in and show under "Admin"
}

export const ADMIN_HOME = "/admin/bookings"
export const DAY_VIEW = "/admin/day"
export const SIGN_IN_PATH = "/admin/sign-in"

// Every page in the sidebar, in order. The first one is the home page.
// To add a feature: build it in src/features/<name>/, then add one line here.
export const PAGES: Page[] = [
  { path: "/book", label: "Book a room", icon: CalendarPlus, component: BookPage, access: "public" },
  { path: ADMIN_HOME, label: "Bookings", icon: ClipboardList, component: BookingsPage, access: "admin" },
  { path: DAY_VIEW, label: "Day view", icon: CalendarClock, component: DayViewPage, access: "admin" },
  { path: "/admin/lists", label: "School lists", icon: List, component: SchoolListsPage, access: "admin" },
  { path: "/admin/holidays", label: "Holidays and events", icon: CalendarDays, component: HolidaysPage, access: "admin" },
]
