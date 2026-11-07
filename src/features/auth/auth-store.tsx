import { createContext, useContext, useState, type ReactNode } from "react"

type AuthStore = {
  isAdmin: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthStore | null>(null)

// DEMO ONLY: no password check, and it resets on reload.
// This only shows the flow. It is not security: anyone can sign in here.
// Later: signIn calls the API (Spring Security), and the server checks
// the admin on every admin request.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <AuthContext value={{ isAdmin, signIn: () => setIsAdmin(true), signOut: () => setIsAdmin(false) }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const store = useContext(AuthContext)
  if (!store) throw new Error("useAuth must be used inside AuthProvider")
  return store
}
