"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, EmptyState, ErrorState, Field, Input, Loading, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { useOrg } from "@/lib/org";

export default function Teams() {
  const org = useOrg(), qc = useQueryClient();
  const [email, setEmail] = useState(""), [team, setTeam] = useState("General");
  const add = useMutation({ mutationFn: () => api(`/organizations/${org.data!.id}/members`, { method: "POST", json: { email, team } }), onSuccess: () => { toast.success("Member added"); setEmail(""); qc.invalidateQueries({ queryKey: ["members"] }); }, onError: (e) => toast.error(e.message) });
  const q = useQuery({ queryKey: ["members", org.data?.id], enabled: !!org.data, queryFn: () => api<{ user_id: string; name: string; email: string; team: string; org_role: string; onboarded: boolean }[]>(`/organizations/${org.data!.id}/members`) });
  if (org.isLoading || q.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title="No organization" />;
  if (q.isError) return <ErrorState error={q.error} />;
  return (
    <>
      <PageHeader title="Teams & members" sub="Directory only. Assessment details are not available to administrators." />
      <Card className="mb-4"><form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}><Field id="me" label="Add a registered user by email"><Input id="me" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field id="mt" label="Team"><Input id="mt" value={team} onChange={(e) => setTeam(e.target.value)} /></Field><Button type="submit" disabled={add.isPending}>Add member</Button></form></Card>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface"><table className="w-full text-left text-sm"><caption className="sr-only">Organization members</caption><thead className="border-b border-line text-muted"><tr><th scope="col" className="p-3">Name</th><th scope="col" className="p-3">Email</th><th scope="col" className="p-3">Team</th><th scope="col" className="p-3">Role</th><th scope="col" className="p-3">Onboarded</th></tr></thead>
        <tbody>{q.data!.map((m) => <tr key={m.user_id} className="border-b border-line last:border-0"><td className="p-3">{m.name || "—"}</td><td className="p-3 text-fg2">{m.email}</td><td className="p-3">{m.team}</td><td className="p-3"><Badge>{m.org_role}</Badge></td><td className="p-3">{m.onboarded ? "Yes" : "No"}</td></tr>)}</tbody></table></div>
    </>
  );
}
