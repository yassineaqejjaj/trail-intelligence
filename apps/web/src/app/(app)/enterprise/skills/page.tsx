"use client";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { useOrg, type Analytics } from "@/lib/org";

export default function OrgSkills() {
  const org = useOrg();
  const q = useQuery({ queryKey: ["analytics", org.data?.id], enabled: !!org.data, queryFn: () => api<Analytics>(`/organizations/${org.data!.id}/analytics`) });
  if (org.isLoading || q.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title="No organization" />;
  if (q.isError) return <ErrorState error={q.error} />;
  const d = q.data!;
  if (d.suppressed) return <><PageHeader title="Skills intelligence" /><EmptyState title="Aggregates hidden" hint={d.reason} /></>;
  const rows = d.skills.map((s) => ({ name: s.name, gap: s.gap, avg: s.avg_level ?? 0 }));
  return (
    <>
      <PageHeader title="Skills intelligence" sub={`Based on ${d.consenting_members} consenting members. ${d.note}`} />
      <Card><h2 className="font-display text-lg">Skill gap (members below level 2)</h2>
        <div className="mt-4 h-96" role="img" aria-label="Bar chart of members below level 2 per skill"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} layout="vertical" margin={{ left: 100 }}><CartesianGrid stroke="var(--border)" horizontal={false} /><XAxis type="number" stroke="var(--muted)" allowDecimals={false} /><YAxis type="category" dataKey="name" stroke="var(--text2)" width={160} fontSize={12} /><Tooltip contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border)" }} /><Bar dataKey="gap" fill="var(--blue)" radius={4} /></BarChart></ResponsiveContainer></div></Card>
      <table className="mt-4 w-full text-left text-sm"><caption className="sr-only">Skills table</caption><thead className="text-muted"><tr><th scope="col" className="py-2">Skill</th><th scope="col">Domain</th><th scope="col">Assessed</th><th scope="col">Avg level</th></tr></thead><tbody>{d.skills.map((s) => <tr key={s.slug} className="border-t border-line"><td className="py-2">{s.name}</td><td className="text-fg2">{s.domain}</td><td>{s.assessed}</td><td>{s.avg_level ?? "n<3"}</td></tr>)}</tbody></table>
    </>
  );
}
