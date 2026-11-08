"use client"

import { useState } from "react"
import { TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useSession } from "@/features/auth/hooks/useSession"
import { useDeleteAccount } from "@/features/profile/hooks/useDeleteAccount"

export function DeleteAccountSettings() {
  const [password, setPassword] = useState("")
  const deleteAccount = useDeleteAccount()
  const { endSession } = useSession()

  async function handleDeleteAccount() {
    if (!password) {
      toast.error("Please enter your password.")
      return
    }

    try {
      await deleteAccount.mutateAsync(password)
    } catch {
      toast.error("Failed to delete account. Check your password and try again.")
      return
    }

    endSession()
  }

  return (
    <section data-slot="settings-panel">
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>This cannot be undone</AlertTitle>
        <AlertDescription>
          Your posts, data, and follow relationships will be removed. Followers
          are notified over ActivityPub.
        </AlertDescription>
      </Alert>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleDeleteAccount()
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="confirm-password">Password</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Your password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button
            type="submit"
            variant="destructive"
            disabled={deleteAccount.isPending || !password}
          >
            {deleteAccount.isPending ? <Spinner data-icon="inline-start" /> : null}
            {deleteAccount.isPending ? "Verifying…" : "Delete account"}
          </Button>
        </FieldGroup>
      </form>
    </section>
  )
}
