// Saves Malaysia's public holidays (national + Selangor) as the app's starting list.
// The admin can also update them in the app ("Holidays and events").
// Run once a year, check, then commit the result:
//   node scripts/fetch-holidays.mjs 2026 2027
// Output: src/data/holidays.json
// Islamic holiday dates are estimates until announced: check them against the
// official list (Prime Minister's Department, BKPP).
import { writeFileSync } from "node:fs"
import { HOLIDAY_FEED_URL, parseHolidayFeed } from "../src/lib/holiday-feed.ts"

const OUT_FILE = new URL("../src/data/holidays.json", import.meta.url)

const years = process.argv.slice(2)
if (years.length === 0 || !years.every((year) => /^\d{4}$/.test(year))) {
  console.error("Usage: node scripts/fetch-holidays.mjs 2026 2027")
  process.exit(1)
}

const response = await fetch(HOLIDAY_FEED_URL)
if (!response.ok) {
  console.error(`Download failed: HTTP ${response.status}`)
  process.exit(1)
}

const holidays = parseHolidayFeed(await response.text(), years)
writeFileSync(OUT_FILE, JSON.stringify(holidays, null, 2) + "\n")
console.log(`Saved ${holidays.length} holidays for ${years.join(", ")} (national + Selangor) to src/data/holidays.json`)
