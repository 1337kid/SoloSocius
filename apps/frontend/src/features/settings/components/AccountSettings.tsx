"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { useFollowRequests } from "@/features/profile/hooks/useFollowRequests"
import { useProfileData } from "@/features/profile/hooks/useProfileData"

export function AccountSettings() {
  const { data: profileData } = useProfileData()
  const { isTogglingManualApproval, toggleManualApproval } = useFollowRequests()

  return (
    <section data-slot="settings-panel">
      <FieldGroup>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel htmlFor="manual-approval">
            Manually approve followers
          </FieldLabel>
          <FieldDescription>
            New followers stay pending until you approve them.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="manual-approval"
          checked={profileData?.manuallyApprovesFollowers ?? false}
          onCheckedChange={() => toggleManualApproval()}
          disabled={isTogglingManualApproval}
        />
      </Field>
      </FieldGroup>
    </section>
  )
}
