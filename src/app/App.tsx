import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AppShell } from "@/app/app-shell"
import { ADMIN_HOME, DAY_VIEW, PAGES, SIGN_IN_PATH } from "@/app/pages"
import { RequireAdmin } from "@/app/require-admin"
import { SchoolCalendarProvider } from "@/data/school-calendar"
import { SchoolListsProvider } from "@/data/school-lists"
import { AuthProvider } from "@/features/auth/auth-store"
import { SignInPage } from "@/features/auth/sign-in-page"
import { BookingEditPage } from "@/features/booking/booking-edit-page"
import { BookingsProvider } from "@/features/booking/bookings-store"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolListsProvider>
          <SchoolCalendarProvider>
            <BookingsProvider>
              <AppShell pages={PAGES}>
                <Routes>
                  {PAGES.map((page) => (
                    <Route
                      key={page.path}
                      path={page.path}
                      element={page.access === "admin" ? <RequireAdmin><page.component /></RequireAdmin> : <page.component />}
                    />
                  ))}
                  {/* A booking opens from the list or the day view; "Back" returns to where it came from. */}
                  {[ADMIN_HOME, DAY_VIEW].map((path) => (
                    <Route key={path} path={`${path}/:id`} element={<RequireAdmin><BookingEditPage /></RequireAdmin>} />
                  ))}
                  <Route path={SIGN_IN_PATH} element={<SignInPage next={ADMIN_HOME} />} />
                  <Route path="*" element={<Navigate to={PAGES[0].path} replace />} />
                </Routes>
              </AppShell>
            </BookingsProvider>
          </SchoolCalendarProvider>
        </SchoolListsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
