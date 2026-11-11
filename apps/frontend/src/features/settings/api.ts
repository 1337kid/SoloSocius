import type {
  CreateRelayRequest,
  CreateRelayResponse,
  DeleteRelayResponse,
  GetRelaysResponse,
  UnsubscribeRelayResponse,
} from "@solosocius/api-types"

import { api } from "@/lib/api/axios"

export const getRelays = async (): Promise<GetRelaysResponse> => {
  const { data } = await api.get<GetRelaysResponse>("/relays")
  return data
}

export const addRelay = async (
  body: CreateRelayRequest,
): Promise<CreateRelayResponse> => {
  const { data } = await api.post<CreateRelayResponse>("/relays", body)
  return data
}

export const unsubscribeRelay = async (
  id: string,
): Promise<UnsubscribeRelayResponse> => {
  const { data } = await api.patch<UnsubscribeRelayResponse>(`/relays/${id}`)
  return data
}

export const deleteRelay = async (id: string): Promise<DeleteRelayResponse> => {
  const { data } = await api.delete<DeleteRelayResponse>(`/relays/${id}`)
  return data
}
