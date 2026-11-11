import type {
  CreateRelayRequest,
  GetRelaysResponse,
  Relay,
} from "@solosocius/api-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/lib/api/axios"

import { addRelay, deleteRelay, getRelays, unsubscribeRelay } from "../api"
import { relayQueryKeys } from "../keys"

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

const sortRelays = (relays: Relay[]) =>
  [...relays].sort((a, b) => a.name.localeCompare(b.name))

export function useRelays() {
  return useQuery({
    queryKey: relayQueryKeys.list,
    queryFn: getRelays,
  })
}

export function useAddRelay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateRelayRequest) => addRelay(body),
    onSuccess: (relay) => {
      queryClient.setQueryData<GetRelaysResponse>(relayQueryKeys.list, (current) =>
        sortRelays([...(current ?? []).filter((item) => item.id !== relay.id), relay]),
      )
      toast.success("Relay added. Waiting for the relay to accept.")
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to add relay."))
    },
  })
}

export function useUnsubscribeRelay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unsubscribeRelay(id),
    onSuccess: (relay) => {
      queryClient.setQueryData<GetRelaysResponse>(relayQueryKeys.list, (current) =>
        (current ?? []).map((item) => (item.id === relay.id ? relay : item)),
      )
      toast.success(`Unsubscribed from ${relay.name}.`)
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to unsubscribe from relay."))
    },
  })
}

export function useDeleteRelay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRelay(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<GetRelaysResponse>(relayQueryKeys.list, (current) =>
        (current ?? []).filter((item) => item.id !== id),
      )
      toast.success("Relay removed.")
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to remove relay."))
    },
  })
}
