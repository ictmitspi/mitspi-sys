import { Button } from "@/components/ui/button"
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { BookingSummary } from "@/features/booking/components/booking-summary"
import type { Booking } from "@/features/booking/types"

type Props = { booking: Booking | null; onClose: () => void }

// Who booked a time. A side panel on desktop, a bottom sheet on phones (thumb reach).
export function BookingInfoSheet({ booking, onClose }: Props) {
  const isMobile = useIsMobile()

  return (
    <Sheet open={booking !== null} onOpenChange={(open) => !open && onClose()}>
      {/* One big Close button at the bottom (thumb reach), so no small ✕ at the top. */}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showCloseButton={false}
        className={isMobile ? "max-h-[85dvh] overflow-y-auto" : "overflow-y-auto"}
      >
        <SheetHeader>
          <SheetTitle>Booked</SheetTitle>
          <SheetDescription>To change this booking, ask the admin.</SheetDescription>
        </SheetHeader>
        {booking && (
          <div className="px-4">
            <BookingSummary selection={booking} details={booking} />
          </div>
        )}
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="h-12 w-full text-base">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
