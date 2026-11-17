// Teacher booking: check the Turnstile robot test, then save with create_booking().
// Only this server code holds the key that may call create_booking (see 03-teacher-functions.sql).
import { createClient } from "npm:@supabase/supabase-js@2.118.0"

type BookingRequest = {
  roomId: number
  date: string // YYYY-MM-DD
  start: string // HH:MM
  end: string
  classId: number
  subjectId: number
  teacherName: string
  turnstileToken: string
}

// Any site may call this. Turnstile tokens only come from the widget on our own site.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function reply(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } })
}

// Input from the internet: check the shape here. create_booking() checks the values.
function isBookingRequest(body: unknown): body is BookingRequest {
  const b = body as Partial<BookingRequest> | null
  return !!b &&
    Number.isInteger(b.roomId) && Number.isInteger(b.classId) && Number.isInteger(b.subjectId) &&
    typeof b.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
    typeof b.start === "string" && /^\d{2}:\d{2}$/.test(b.start) &&
    typeof b.end === "string" && /^\d{2}:\d{2}$/.test(b.end) &&
    typeof b.teacherName === "string" && b.teacherName.length <= 80 &&
    typeof b.turnstileToken === "string" && b.turnstileToken.length <= 2048
}

async function passedTurnstile(token: string) {
  const form = new FormData()
  form.append("secret", Deno.env.get("TURNSTILE_SECRET_KEY") ?? "")
  form.append("response", token)
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  })
  const result = await response.json()
  return result.success === true
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS })
  if (req.method !== "POST") return reply(405, { error: "invalid" })

  const body = await req.json().catch(() => null)
  if (!isBookingRequest(body)) return reply(400, { error: "invalid" })
  if (!(await passedTurnstile(body.turnstileToken))) return reply(403, { error: "robot" })

  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!)
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, secretKeys["default"])
  const { data, error } = await supabase.rpc("create_booking", {
    p_room_id: body.roomId,
    p_date: body.date,
    p_start: body.start,
    p_end: body.end,
    p_class_id: body.classId,
    p_subject_id: body.subjectId,
    p_teacher_name: body.teacherName,
  })
  if (error) {
    // Codes only: no teacher names in the logs.
    console.error("create_booking failed", error.code, error.message)
    if (error.code === "23505") return reply(409, { error: "taken" })
    if (error.message === "too_many") return reply(429, { error: "busy" })
    if (error.message === "too_long") return reply(400, { error: "too_long" })
    return reply(400, { error: "invalid" })
  }
  return reply(200, { id: data })
})
