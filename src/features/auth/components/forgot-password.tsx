import { useState, type SubmitEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepLayout } from "@/components/step-layout"
import { useAuth } from "@/features/auth/auth-store"

// Sends a reset link. It always shows the same message, so it does not tell if an email is the admin's.
export function ForgotPassword({ initialEmail, redirectTo, onBack }: {
    initialEmail: string
    redirectTo: string
    onBack: () => void
}) {
    const { sendPasswordLink } = useAuth()
    const [email, setEmail] = useState(initialEmail)
    const [showError, setShowError] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)

    const emailError = email.includes("@") ? "" : "Enter a valid email address."

    async function send(e: SubmitEvent) {
        e.preventDefault()
        if (emailError) {
            setShowError(true)
            return
        }
        setIsSending(true)
        await sendPasswordLink(email.trim(), redirectTo)
        setIsSending(false)
        setIsSent(true)
    }

    if (isSent) {
        return (
            <StepLayout title="Check your email" onBack={onBack}
                footer={<Button className="h-12 w-full text-base" onClick={onBack}>Back to sign in</Button>}>
                <p role="status">
                    If this is the admin email, a link is on its way. Open it to set a new password.
                    Check the spam folder too. No email after 10 minutes? Wait 1 hour, then try again.
                </p>
            </StepLayout>
        )
    }

    return (
        <StepLayout title="Reset password" onBack={onBack}
            footer={
                <Button type="submit" form="reset-form" className="h-12 w-full text-base" disabled={isSending}>
                    {isSending ? "Sending…" : "Send reset link"}
                </Button>
            }>
            <p className="text-muted-foreground">We send a link to the admin email. The link opens a page to set a new password.</p>
            <form id="reset-form" onSubmit={send} noValidate className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" className="h-12 text-base" autoComplete="username" maxLength={254}
                    value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={showError && !!emailError} />
                {showError && emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </form>
        </StepLayout>
    )
}