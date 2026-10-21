import { api } from "@/lib/api/axios";

import { emitSessionExpired } from "./events";
import type {
  AuthCredentialsRequest,
  AuthStatusResponse,
  AuthUserResponse,
} from "@solosocius/api-types";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      emitSessionExpired();
    }

    return Promise.reject(error);
  },
);

export async function login(data: AuthCredentialsRequest) {
  await api.post("/auth/login", data);
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getCurrentUser() {
  const { data } = await api.get<AuthUserResponse>("/auth/me");
  return data;
}

export async function setup(data: AuthCredentialsRequest) {
  await api.post("/auth/setup", data);
}

export async function getStatus() {
  const { data } = await api.get<AuthStatusResponse>("/auth/status");
  return data;
}
