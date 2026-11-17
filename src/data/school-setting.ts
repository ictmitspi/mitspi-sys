import { supabase } from "@/lib/supabase"

// Malaysian number, country code first, digits only. Example: 60123456789. Same rule as the database CHECK.
export const WHATSAPP_PATTERN = /^60[0-9]{8,10}$/

// The admin's WhatsApp number: one row in school_setting. Everyone reads it; only the admin changes it.
export async function fetchAdminWhatsapp() {
  const { data, error } = await supabase.from("school_setting").select("admin_whatsapp").single()
  if (error) throw error
  return data.admin_whatsapp as string
}

// .select().single() fails when no row changed, for example after the admin's sign-in expired.
export async function saveAdminWhatsapp(number: string) {
  const { error } = await supabase
    .from("school_setting").update({ admin_whatsapp: number }).eq("id", 1).select().single()
  if (error) throw error
}
