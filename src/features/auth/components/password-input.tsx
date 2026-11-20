import { useState, type ComponentProps } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// A password box with a button that shows or hides the password. 
export function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type" | "className">) {
    const [isShown, setIsShown] = useState(false)
    return (
        <div className="relative">
            <Input {...props} type={isShown ? "text" : "password"} className="h-12 pr-12 text-base" />
            <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 size-12"
                aria-label="Show password" aria-pressed={isShown} onClick={() => setIsShown(!isShown)}>
                {isShown ? <EyeOff /> : <Eye />}
            </Button>
        </div>
    )
}