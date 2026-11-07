import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { SCHOOL_NAME } from "@/data/school"
import logo from "@/assets/logo.png"

export function AppHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) items-center gap-2 border-b bg-background px-4">
      <Button variant="ghost" size="icon" className="-ml-3 size-12 md:hidden" aria-label="Open menu" onClick={toggleSidebar}>
        <Menu className="size-6" />
      </Button>
      <img src={logo} alt="" className="size-10 shrink-0" />
      {/* The full name wraps to 2 lines on a phone; it is never cut off. */}
      <p className="min-w-0 text-sm leading-tight font-semibold md:text-base">{SCHOOL_NAME}</p>
    </header>
  )
}
