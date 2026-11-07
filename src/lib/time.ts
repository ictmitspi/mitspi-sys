// One place for every date and time format in the app.

export function today() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Monday of the week that holds this date.
export function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7))
}

// Local date as YYYY-MM-DD (not toISOString, which converts to UTC).
export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function nowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// Example: "Tue 20 Oct 2026"
export function formatDate(key: string) {
  return fromDateKey(key).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  })
}

// "2026-10-20" → "2026-10"
export function toMonthKey(dateKey: string) {
  return dateKey.slice(0, 7)
}

// "2026-10" → "October 2026"
export function formatMonth(monthKey: string) {
  return fromDateKey(`${monthKey}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

// Selangor's weekend is Saturday and Sunday.
export function isWeekend(key: string) {
  const day = fromDateKey(key).getDay()
  return day === 0 || day === 6
}

// Example: "Saturday"
export function formatWeekdayLong(key: string) {
  return fromDateKey(key).toLocaleDateString("en-GB", { weekday: "long" })
}

// Example: "Mon"
export function formatWeekday(date: Date) {
  return date.toLocaleDateString("en-GB", { weekday: "short" })
}

// Example: "October 2026". A week in two months: "Oct – Nov 2026".
export function formatWeekMonth(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6)
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return weekStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  }
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear()
  const start = weekStart.toLocaleDateString("en-GB", { month: "short", year: sameYear ? undefined : "numeric" })
  return `${start} – ${weekEnd.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
}

// Example: "Mon, 23 Nov 2026 – Sun, 6 Dec 2026", or one date when start = end.
export function formatDateRange(startKey: string, endKey: string) {
  return startKey === endKey ? formatDate(startKey) : `${formatDate(startKey)} – ${formatDate(endKey)}`
}

// Example: "7:30 AM"
export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const period = hours < 12 ? "AM" : "PM"
  const hours12 = hours % 12 || 12
  return `${hours12}:${String(minutes % 60).padStart(2, "0")} ${period}`
}

// Example: "1 h 30 min"
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

// Example: "Wed 21 Oct 2026, 10:15 AM"
export function formatDateTime(date: Date) {
  return `${formatDate(toDateKey(date))}, ${formatTime(date.getHours() * 60 + date.getMinutes())}`
}

export function formatTimeRange(startMinutes: number, endMinutes: number) {
  return `${formatTime(startMinutes)} – ${formatTime(endMinutes)}`
}
