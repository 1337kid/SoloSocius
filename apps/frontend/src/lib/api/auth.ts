import { api } from "./axios";
import { AuthRequest, User, AuthStatus } from "@/types/auth";

export const login = async (data: AuthRequest) => {
  await api.post("/auth/login", data);
};

export const logout = async () => {
  await api.post("/auth/logout");
};

export const getCurrentUser = async () => {
  const { data } = await api.get<User>("/auth/me");
  return data;
};

export const setup = async (data: AuthRequest) => {
  await api.post("/auth/setup", data);
};

export const getStatus = async () => {
  const { data } = await api.get<AuthStatus>("/auth/status");
  return data;
};