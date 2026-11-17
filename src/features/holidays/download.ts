import { parseHolidayFeed } from "@/lib/holiday-feed"
import { supabase } from "@/lib/supabase"

// The holiday-feed Edge Function fetches Google's file for the browser (Google sends no CORS header).
export async function downloadPublicHolidays(years: string[]) {
  const { data, error } = await supabase.functions.invoke("holiday-feed")
  if (error) throw error
  const rows = parseHolidayFeed(data as string, years)
  if (rows.length === 0) throw new Error("Holiday feed: no holidays found")
  return rows
}
