import { useMutation } from "@tanstack/react-query";
import { deleteAccount } from "../api";

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
  });
}
