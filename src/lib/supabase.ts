import { createClient } from "@supabase/supabase-js"

// The publishable key is safe in the browser: RLS rules in the database protect the data.
// Never put the secret (service_role) key here.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env")

export const supabase = createClient(url, key)
