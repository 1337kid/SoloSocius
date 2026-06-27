import { api } from "@/lib/api/axios";

import { emitSessionExpired } from "./events";
import type { AuthRequest, AuthStatus, User } from "./types";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      emitSessionExpired();
    }

    return Promise.reject(error);
  },
);

export async function login(data: AuthRequest) {
  await api.post("/auth/login", data);
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getCurrentUser() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function setup(data: AuthRequest) {
  await api.post("/auth/setup", data);
}

export async function getStatus() {
  const { data } = await api.get<AuthStatus>("/auth/status");
  return data;
}
