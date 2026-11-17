import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type AuthStore = {
  isAdmin: boolean
  isChecking: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthStore | null>(null)

// Admin sign-in with Supabase Auth. The session stays after a reload.
// The page only hides admin screens: the RLS rules and functions check the admin on every request.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setIsAdmin(data.session ? await checkIsAdmin() : false)
      setIsChecking(false)
    })
  }, [])

  // A user who signs in but is not in admin_user is signed out again.
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return false
    const admin = await checkIsAdmin()
    if (!admin) await supabase.auth.signOut()
    setIsAdmin(admin)
    return admin
  }

  // State changes first, so the sidebar can sign out in the same transition as its page change.
  function signOut() {
    setIsAdmin(false)
    void supabase.auth.signOut()
  }

  return <AuthContext value={{ isAdmin, isChecking, signIn, signOut }}>{children}</AuthContext>
}

async function checkIsAdmin() {
  const { data, error } = await supabase.rpc("is_admin")
  return !error && data === true
}

export function useAuth() {
  const store = useContext(AuthContext)
  if (!store) throw new Error("useAuth must be used inside AuthProvider")
  return store
}
