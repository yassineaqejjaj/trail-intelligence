"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, ErrorState, LinkButton, Loading, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { useOrg, type Analytics } from "@/lib/org";

export default function Enterprise() {
  const org = useOrg();
  const a = useQuery({ queryKey: ["analytics", org.data?.id], enabled: !!org.data, queryFn: () => api<Analytics>(`/organizations/${org.data!.id}/analytics`) });
  if (org.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title="No organization" hint="You are not an administrator of any organization." />;
  if (a.isError) return <ErrorState error={a.error} />;
  return (
    <>
      <PageHeader title={org.data.name} sub="Organization overview" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-fg2">Members</p><p className="font-display text-3xl">{a.data?.members ?? "…"}</p></Card>
        <Card><p className="text-sm text-fg2">Sharing aggregates</p><p className="font-display text-3xl">{a.data?.consenting_members ?? "…"}</p></Card>
        <Card><p className="text-sm text-fg2">Privacy</p><p className="text-sm">Aggregates need 3+ consenting members. Individual submissions are never shown.</p></Card>
      </div>
      <div className="mt-4 flex gap-2"><LinkButton href="/enterprise/skills" variant="outline">Skills intelligence</LinkButton><LinkButton href="/enterprise/teams" variant="outline">Teams</LinkButton><LinkButton href="/enterprise/programs" variant="outline">Programs</LinkButton></div>
    </>
  );
}
