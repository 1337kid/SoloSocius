"use client"

import { useState } from "react"
import type { Relay, RelayStatus } from "@solosocius/api-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { RadioTower } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

import {
  useAddRelay,
  useDeleteRelay,
  useRelays,
  useUnsubscribeRelay,
} from "../hooks/useRelays"
import { CreateRelaySchema, type CreateRelaySchemaType } from "../schemas"

const statusLabel: Record<RelayStatus, string> = {
  pending: "Pending",
  accepted: "Subscribed",
  rejected: "Rejected",
  unsubscribed: "Unsubscribed",
}

const statusVariant: Record<
  RelayStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  unsubscribed: "outline",
}

const canUnsubscribe = (status: RelayStatus) =>
  status === "pending" || status === "accepted"

export function RelaySettings() {
  const relays = useRelays()
  const addRelay = useAddRelay()
  const unsubscribe = useUnsubscribeRelay()
  const removeRelay = useDeleteRelay()
  const [relayToRemove, setRelayToRemove] = useState<Relay | null>(null)

  const form = useForm({
    resolver: zodResolver(CreateRelaySchema),
    defaultValues: {
      name: "",
      inboxUrl: "",
    },
  })

  function onSubmit(values: CreateRelaySchemaType) {
    addRelay.mutate(values, {
      onSuccess: () => form.reset(),
    })
  }

  async function confirmRemove() {
    if (!relayToRemove) return
    try {
      await removeRelay.mutateAsync(relayToRemove.id)
      setRelayToRemove(null)
    } catch {
      // The mutation hook reports the error.
    }
  }

  return (
    <section data-slot="settings-panel">
      <FieldSet>
        <FieldLegend>Relays</FieldLegend>
        <FieldDescription>
          Add a relay by name and inbox URL. A follow is sent to that inbox and
          stays pending until the relay accepts.
        </FieldDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="relay-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="relay-name"
                    placeholder="Relay name"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="inboxUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="relay-inbox">Inbox URL</FieldLabel>
                  <Input
                    {...field}
                    id="relay-inbox"
                    type="url"
                    inputMode="url"
                    placeholder="https://relay.example/inbox"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Button type="submit" disabled={addRelay.isPending}>
              {addRelay.isPending ? <Spinner data-icon="inline-start" /> : null}
              {addRelay.isPending ? "Adding…" : "Add relay"}
            </Button>
          </FieldGroup>
        </form>

        {relays.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton variant="title" />
            <Skeleton variant="line" />
          </div>
        ) : null}

        {relays.isError ? (
          <FieldDescription>Could not load relays.</FieldDescription>
        ) : null}

        {relays.data && relays.data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <RadioTower />
              </EmptyMedia>
              <EmptyTitle>No relays yet</EmptyTitle>
              <EmptyDescription>
                Add a relay inbox to receive public posts from other servers.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {relays.data && relays.data.length > 0 ? (
          <div className="flex flex-col gap-3">
            {relays.data.map((relay) => {
              const unsubscribing =
                unsubscribe.isPending && unsubscribe.variables === relay.id
              const removing =
                removeRelay.isPending && removeRelay.variables === relay.id

              return (
                <div key={relay.id} className="flex flex-col gap-3">
                  <Separator />
                  <Field orientation="responsive">
                    <FieldContent>
                      <FieldTitle>{relay.name}</FieldTitle>
                      <FieldDescription className="break-all">
                        {relay.inboxUrl}
                      </FieldDescription>
                    </FieldContent>
                    <Badge variant={statusVariant[relay.status]}>
                      {statusLabel[relay.status]}
                    </Badge>
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    {canUnsubscribe(relay.status) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={unsubscribing || removing}
                        onClick={() => unsubscribe.mutate(relay.id)}
                      >
                        {unsubscribing ? (
                          <Spinner data-icon="inline-start" />
                        ) : null}
                        Unsubscribe
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={removing || unsubscribing}
                      onClick={() => setRelayToRemove(relay)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </FieldSet>

      <Dialog
        open={relayToRemove !== null}
        onOpenChange={(open) => {
          if (!open && !removeRelay.isPending) setRelayToRemove(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove relay</DialogTitle>
            <DialogDescription>
              {relayToRemove
                ? `${relayToRemove.name} will be removed. An active subscription is unsubscribed first.`
                : "This relay will be removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={removeRelay.isPending}
              onClick={() => setRelayToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removeRelay.isPending}
              onClick={() => void confirmRemove()}
            >
              {removeRelay.isPending ? <Spinner data-icon="inline-start" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
