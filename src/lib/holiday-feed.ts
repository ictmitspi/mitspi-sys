// Malaysia's public holidays from Google's public holiday calendar (ICS, no API key).
// Used by scripts/fetch-holidays.mjs and by the admin's "Update from Google" button,
// so both keep the same holidays. No imports: Node runs this file as it is.

export const HOLIDAY_FEED_URL =
  "https://calendar.google.com/calendar/ical/en.malaysia%23holiday%40group.v.calendar.google.com/public/basic.ics"

const STATE = "Selangor"
// Selangor holidays that the feed does not have (checked 20 Oct 2026). Month-day, name.
const STATE_EXTRAS: [string, string][] = [["12-11", "Hari Keputeraan Sultan Selangor"]]

export type HolidayRow = { date: string; name: string } // date: YYYY-MM-DD

function field(event: string, name: string) {
  const line = event.split(/\r?\n/).find((l) => l.startsWith(`${name}:`) || l.startsWith(`${name};`))
  return line ? line.slice(line.indexOf(":") + 1).replace(/\\([,;\\])/g, "$1").trim() : ""
}

// National holidays plus the ones for Selangor, in the given years, oldest first.
export function parseHolidayFeed(ics: string, years: string[]): HolidayRow[] {
  // ICS folds long lines: a line that starts with a space continues the line before.
  const text = ics.replace(/\r?\n[ \t]/g, "")
  const rows: HolidayRow[] = []

  for (const event of text.split("BEGIN:VEVENT").slice(1)) {
    const start = field(event, "DTSTART") // 20261225
    const date = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`
    // "Nuzul Al-Quran (regional holiday) (tentative)" → "Nuzul Al-Quran (tentative)"
    const name = field(event, "SUMMARY").replace(/\s*\(regional holiday\)/, "")
    const description = field(event, "DESCRIPTION")
    const isNational = description === "Public holiday"
    const isForState = description.startsWith("Public holiday in ") && description.includes(STATE)

    // Keep only clean data: the app shows it as text.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !years.includes(date.slice(0, 4))) continue
    if (!(isNational || isForState) || name === "" || name.length > 80) continue
    if (!rows.some((r) => r.date === date && r.name === name)) rows.push({ date, name })
  }

  for (const year of years) {
    for (const [monthDay, name] of STATE_EXTRAS) rows.push({ date: `${year}-${monthDay}`, name })
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date))
}
