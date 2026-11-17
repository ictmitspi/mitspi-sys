// Admin's "Update from Google". The browser cannot read Google's holiday feed (no CORS header),
// so this function fetches it on the server and passes the text on. The app reads it.
const FEED_URL =
  "https://calendar.google.com/calendar/ical/en.malaysia%23holiday%40group.v.calendar.google.com/public/basic.ics"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS })

  const feed = await fetch(FEED_URL)
  if (!feed.ok) return new Response("feed_failed", { status: 502, headers: CORS })
  return new Response(await feed.text(), { headers: { ...CORS, "Content-Type": "text/calendar" } })
})
