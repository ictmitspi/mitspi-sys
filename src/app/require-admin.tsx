import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"
import { SIGN_IN_PATH } from "@/app/pages"
import { useAuth } from "@/features/auth/auth-store"

// Sends a signed-out user to sign-in, then back to this page (with its ?query, like the day view date).
// This only hides pages in the browser. Real protection is on the server.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const { pathname, search } = useLocation()

  if (!isAdmin) return <Navigate to={SIGN_IN_PATH} state={{ from: pathname + search }} replace />
  return children
}
