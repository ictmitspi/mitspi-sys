import { parseHolidayFeed } from "@/lib/holiday-feed"

// Demo: the Vite dev server passes /holiday-feed on to Google (vite.config.ts).
// Later: POST /api/admin/holidays/refresh, and the server fetches and checks the feed.
export async function downloadPublicHolidays(years: string[]) {
  const response = await fetch("/holiday-feed")
  if (!response.ok) throw new Error(`Holiday feed: HTTP ${response.status}`)
  const rows = parseHolidayFeed(await response.text(), years)
  if (rows.length === 0) throw new Error("Holiday feed: no holidays found")
  return rows
}
