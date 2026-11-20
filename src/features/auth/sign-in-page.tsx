import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepLayout } from "@/components/step-layout"
import { useAuth } from "@/features/auth/auth-store"
import { ForgotPassword } from "@/features/auth/components/forgot-password"
import { PasswordInput } from "@/features/auth/components/password-input"

// Admin sign-in. Teachers do not sign in.
export function SignInPage({ next, passwordPath }: { next: string; passwordPath: string }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showErrors, setShowErrors] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isForgot, setIsForgot] = useState(false)

  const emailError = email.includes("@") ? "" : "Enter your email."
  const passwordError = password === "" ? "Enter your password." : ""
  // Go back to the admin page that sent us here, if any.
  const from = (location.state as { from?: string } | null)?.from ?? next

  async function submit() {
    if (emailError || passwordError) {
      setShowErrors(true)
      return
    }
    setIsSending(true)
    setFailed(false)
    const ok = await signIn(email.trim(), password)
    setIsSending(false)
    if (ok) navigate(from, { replace: true })
    else setFailed(true)
  }

  if (isForgot) {
    return <ForgotPassword initialEmail={email} redirectTo={window.location.origin + passwordPath}
      onBack={() => setIsForgot(false)} />
  }

  return (
    <StepLayout
      title="Admin sign in"
      footer={
        <Button className="h-12 w-full text-base" onClick={submit} disabled={isSending}>
          {isSending ? "Signing in…" : "Sign in"}
        </Button>
      }
    >
      <p className="text-muted-foreground">Only the admin signs in.</p>

      {/* One message for every failure, so it does not tell which part was wrong. */}
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          Could not sign in. Check your email and password, then try again.
        </p>
      )}

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
          <PasswordInput
            id="password"
            autoComplete="current-password"
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={showErrors && !!passwordError}
          />
        {showErrors && passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
        <Button variant="link" className="h-12 px-0" onClick={() => setIsForgot(true)}>
          Forgot password?
        </Button>
      </div>
    </StepLayout>
  )
}