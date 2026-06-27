import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "../api";

export function useProfileData() {
  return useQuery({ queryKey: ["publicProfile"], queryFn: getProfileData });
}
