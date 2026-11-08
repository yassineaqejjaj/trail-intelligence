"use client";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyState, ErrorState, Label, Loading, PageHeader } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { api } from "@/lib/api";
import { useOrg, type Analytics } from "@/lib/org";

export default function OrgSkills() {
  const { t, fmtNum } = useI18n();
  const org = useOrg();
  const q = useQuery({ queryKey: ["analytics", org.data?.id], enabled: !!org.data, queryFn: () => api<Analytics>(`/organizations/${org.data!.id}/analytics`) });
  if (org.isLoading || q.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title={t("No organization")} />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const d = q.data!;
  if (d.suppressed) return <><PageHeader title={t("Skills intelligence")} /><EmptyState title={t("Aggregates hidden")} hint={d.reason} /></>;
  const rows = d.skills.map((s) => ({ name: s.name, gap: s.gap }));
  const domains = [...new Set(d.skills.map((s) => s.domain))];
  const shade = (lv: number | null) => (lv == null ? undefined : `color-mix(in srgb, var(--blue) ${Math.round((lv / 5) * 80) + 8}%, transparent)`);
  return (
    <>
      <PageHeader title={t("Skills intelligence")} sub={t("Based on {n} consenting members.", { n: d.consenting_members })} />
      <Card className="mb-4 border-blue/40"><Label>{t("Privacy")}</Label><p className="mt-2 text-sm text-fg2">{t("Aggregates need 3+ consenting members. Individual submissions are never shown.")} {t("A skill shows an average only when at least 3 consenting members were assessed on it.")}</p></Card>
      <Card><Label>{t("Average level by domain and skill")}</Label>
        <div className="mt-3 space-y-4">{domains.map((dm) => <div key={dm}><p className="mb-1.5 text-sm font-medium">{dm}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{d.skills.filter((s) => s.domain === dm).map((s) => <div key={s.slug} className="flex items-center justify-between gap-2 rounded-[10px] border border-line p-3 text-sm" style={{ background: shade(s.avg_level) }}><span>{s.name}</span><span className="font-display text-lg" title={s.avg_level == null ? t("Fewer than 3 assessed members") : undefined}>{s.avg_level == null ? t("n<3") : fmtNum(s.avg_level)}</span></div>)}</div></div>)}</div></Card>
      <Card className="mt-4"><h2 className="font-display text-lg">{t("Skill gap (members below level 2)")}</h2>
        <div dir="ltr" className="mt-4 h-96" role="img" aria-label={t("Bar chart of members below level 2 per skill")}><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} layout="vertical" margin={{ left: 100 }}><CartesianGrid stroke="var(--border)" horizontal={false} /><XAxis type="number" stroke="var(--muted)" allowDecimals={false} /><YAxis type="category" dataKey="name" stroke="var(--text2)" width={160} fontSize={12} /><Tooltip formatter={(v) => [v, t("Members below level 2")]} contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border)" }} /><Bar dataKey="gap" name={t("Members below level 2")} fill="var(--blue)" radius={4} /></BarChart></ResponsiveContainer></div></Card>
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-line bg-surface"><table className="w-full text-sm"><caption className="sr-only">{t("Skills table")}</caption><thead className="border-b border-line text-muted"><tr><th scope="col" className="p-3 text-start">{t("Skill")}</th><th scope="col" className="p-3 text-start">{t("Domain")}</th><th scope="col" className="p-3 text-start">{t("Assessed")}</th><th scope="col" className="p-3 text-start">{t("Avg level")}</th></tr></thead><tbody>{d.skills.map((s) => <tr key={s.slug} className="border-b border-line last:border-0"><td className="p-3">{s.name}</td><td className="p-3 text-fg2">{s.domain}</td><td className="p-3">{fmtNum(s.assessed)}</td><td className="p-3">{s.avg_level == null ? t("n<3") : fmtNum(s.avg_level)}</td></tr>)}</tbody></table></div>
    </>
  );
}
