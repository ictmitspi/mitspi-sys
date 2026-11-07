import { startTransition } from "react"
import { NavLink, useLocation, useNavigate } from "react-router"
import { LogIn, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { PAGES, SIGN_IN_PATH, type Page } from "@/app/pages"
import { useAuth } from "@/features/auth/auth-store"

export function AppSidebar({ pages }: { pages: Page[] }) {
  const { isAdmin, signOut } = useAuth()
  const { setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const closeDrawer = () => setOpenMobile(false) // only matters on phones

  // The router changes page inside a transition. Sign out in the same transition,
  // or the admin page renders signed out first and its guard sends us to sign-in.
  function signOutAndLeave() {
    closeDrawer()
    startTransition(() => {
      navigate(PAGES[0].path)
      signOut()
    })
  }

  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
      <SidebarContent>
        <NavGroup pages={pages.filter((p) => p.access === "public")} onNavigate={closeDrawer} />
        {isAdmin && (
          <NavGroup label="Admin" pages={pages.filter((p) => p.access === "admin")} onNavigate={closeDrawer} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isAdmin ? (
              <SidebarMenuButton size="lg" onClick={signOutAndLeave}>
                <LogOut />
                <span>Sign out (admin)</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild size="lg">
                <NavLink to={SIGN_IN_PATH} onClick={closeDrawer}>
                  <LogIn />
                  <span>Admin sign in</span>
                </NavLink>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function NavGroup({ label, pages, onNavigate }: { label?: string; pages: Page[]; onNavigate: () => void }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {pages.map((page) => (
          <SidebarMenuItem key={page.path}>
            {/* startsWith: a booking at /admin/bookings/<id> keeps "Bookings" active */}
            <SidebarMenuButton asChild size="lg" isActive={pathname.startsWith(page.path)}>
              <NavLink to={page.path} onClick={onNavigate}>
                <page.icon />
                <span>{page.label}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
