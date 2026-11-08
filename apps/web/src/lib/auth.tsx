"use client";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError, type User } from "./api";

export function useMe() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try { return await api<User>("/users/me"); }
      catch (e) { if (e instanceof ApiError && e.status === 401) return null; throw e; }
    },
    staleTime: 60_000,
  });
}
