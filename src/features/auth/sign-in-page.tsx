import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepLayout } from "@/components/step-layout"
import { useAuth } from "@/features/auth/auth-store"

// Admin sign-in. Teachers do not sign in.
export function SignInPage({ next }: { next: string }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showErrors, setShowErrors] = useState(false)

  const emailError = email.includes("@") ? "" : "Enter your email."
  const passwordError = password === "" ? "Enter your password." : ""
  // Go back to the admin page that sent us here, if any.
  const from = (location.state as { from?: string } | null)?.from ?? next

  function submit() {
    if (emailError || passwordError) {
      setShowErrors(true)
      return
    }
    signIn()
    navigate(from, { replace: true })
  }

  return (
    <StepLayout
      title="Admin sign in"
      footer={<Button className="h-12 w-full text-base" onClick={submit}>Sign in</Button>}
    >
      <p className="text-muted-foreground">
        Only the admin signs in. Demo: any email and password work. The server will check them later.
      </p>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className="h-12 text-base"
          autoComplete="username"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={showErrors && !!emailError}
        />
        {showErrors && emailError && <p className="text-sm text-destructive">{emailError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          className="h-12 text-base"
          autoComplete="current-password"
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={showErrors && !!passwordError}
        />
        {showErrors && passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
      </div>
    </StepLayout>
  )
}
