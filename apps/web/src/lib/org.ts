"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type Org = { id: string; name: string; role: string };
export const useOrg = () => useQuery({ queryKey: ["orgs"], queryFn: async () => (await api<Org[]>("/organizations/mine")).find((o) => o.role === "org_admin") ?? null });
export type Analytics = { members: number; consenting_members: number; suppressed: boolean; reason?: string; note?: string; skills: { slug: string; name: string; domain: string; assessed: number; avg_level: number | null; gap: number }[] };
