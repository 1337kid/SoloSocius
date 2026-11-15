import type {
  CreateRelayRequest,
  CreateRelayResponse,
  DeleteRelayResponse,
  GetRelaysResponse,
  UnsubscribeRelayResponse,
} from "@solosocius/api-types";

import { api } from "@/lib/api/axios";

export const getRelays = async (): Promise<GetRelaysResponse> => {
  const { data } = await api.get<GetRelaysResponse>("/relays");
  return data;
};

export const addRelay = async (
  body: CreateRelayRequest,
): Promise<CreateRelayResponse> => {
  const { data } = await api.post<CreateRelayResponse>("/relays", body);
  return data;
};

export const unsubscribeRelay = async (
  id: string,
): Promise<UnsubscribeRelayResponse> => {
  const { data } = await api.patch<UnsubscribeRelayResponse>(
    `/relays/${id}/unsubscribe`,
  );
  return data;
};

export const resubscribeRelay = async (
  id: string,
): Promise<CreateRelayResponse> => {
  const { data } = await api.patch<CreateRelayResponse>(
    `/relays/${id}/resubscribe`,
  );
  return data;
};

export const deleteRelay = async (id: string): Promise<DeleteRelayResponse> => {
  const { data } = await api.delete<DeleteRelayResponse>(`/relays/${id}`);
  return data;
};
