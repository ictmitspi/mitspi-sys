import { useState, type SubmitEvent } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { StepLayout } from "@/components/step-layout"
import { useAuth } from "@/features/auth/auth-store"
import { PasswordInput } from "@/features/auth/components/password-input"

const MIN_LENGTH = 8 // same as Supabase → Authentication → Email → Minimum password length

// Admin: set a new password. The reset link in the email also opens this page, signed in.
export function PasswordPage() {
  const { changePassword } = useAuth()
  const [password, setPassword] = useState("")
  const [repeat, setRepeat] = useState("")
  const [showErrors, setShowErrors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<"saved" | "failed" | null>(null)

  const passwordError = password.length < MIN_LENGTH ? `Use at least ${MIN_LENGTH} characters.` : ""
  const repeatError = repeat === password ? "" : "The 2 passwords are not the same."

  async function save(e: SubmitEvent) {
    e.preventDefault()
    if (passwordError || repeatError) {
      setShowErrors(true)
      return
    }
    setIsSaving(true)
    const ok = await changePassword(password)
    setIsSaving(false)
    setResult(ok ? "saved" : "failed")
    if (ok) {
      setPassword("")
      setRepeat("")
      setShowErrors(false)
    }
  }

  return (
    <StepLayout title="Change password"
      footer={
        <Button type="submit" form="password-form" className="h-12 w-full text-base" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save password"}
        </Button>
      }>
      {result === "saved" && <p role="status">Password saved. Use it the next time you sign in.</p>}
      {result === "failed" && (
        <p role="alert" className="text-sm text-destructive">
          Could not save the password. It must be new, with at least {MIN_LENGTH} characters. Try again.
        </p>
      )}
      <form id="password-form" onSubmit={save} noValidate className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput id="new-password" autoComplete="new-password" maxLength={128}
            value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={showErrors && !!passwordError} />
          {showErrors && passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="repeat-password">Type it again</Label>
          <PasswordInput id="repeat-password" autoComplete="new-password" maxLength={128}
            value={repeat} onChange={(e) => setRepeat(e.target.value)} aria-invalid={showErrors && !!repeatError} />
          {showErrors && repeatError && <p className="text-sm text-destructive">{repeatError}</p>}
        </div>
      </form>
    </StepLayout>
  )
}
