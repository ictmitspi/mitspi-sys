import type { ReactNode } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

type Props = {
  title: string
  onBack?: () => void
  footer: ReactNode
  children: ReactNode
  wide?: boolean // wider frame on desktop, for 2-column screens
}

// Same frame on every screen: title at the top, one primary action at the bottom.
export function StepLayout({ title, onBack, footer, children, wide = false }: Props) {
  return (
    <div className={cn("mx-auto flex w-full max-w-md flex-1 flex-col", wide && "md:max-w-4xl")}>
      <header className="flex items-center gap-1 px-4 pt-6 pb-4">
        {onBack && (
          <Button variant="ghost" size="icon" className="-ml-3 size-12" onClick={onBack} aria-label="Back">
            <ChevronLeft className="size-6" />
          </Button>
        )}
        <h1 className="text-2xl font-semibold">{title}</h1>
      </header>
      <div className="flex-1 space-y-6 px-4 pb-6">{children}</div>
      <footer className="sticky bottom-0 space-y-2 border-t bg-background px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {footer}
      </footer>
    </div>
  )
}
