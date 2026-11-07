import type { ReactNode } from "react"
import { ContactAdmin } from "@/components/contact-admin"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SCHOOL_NAME } from "@/data/school"
import { AppHeader } from "@/app/app-header"
import { AppSidebar } from "@/app/app-sidebar"
import { useAuth } from "@/features/auth/auth-store"
import type { Page } from "@/app/pages"

type Props = {
  pages: Page[]
  children: ReactNode
}

// Navbar on top, sidebar below it (shadcn block sidebar-16). On phones the sidebar is a drawer.
export function AppShell({ pages, children }: Props) {
  const { isAdmin } = useAuth()
  return (
    <div className="[--header-height:--spacing(14)]">
      <SidebarProvider className="flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar pages={pages} />
          <SidebarInset>
            {children}
            <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} {SCHOOL_NAME.toUpperCase()}
            </footer>
            {/* Only teachers need it: the admin does not contact themself. */}
            {!isAdmin && <ContactAdmin />}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
