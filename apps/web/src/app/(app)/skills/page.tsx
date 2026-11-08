"use client";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Constellation, DomainDetail, toDomains } from "@/components/constellation";
import { Card, ErrorState, LevelBar, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { useSkills } from "@/lib/hooks";

export default function Skills() {
  const t = useT(), q = useSkills();
  const [view, setView] = useState<"graph" | "list">("graph"), [domain, setDomain] = useState("all"), [sel, setSel] = useState<string | null>(null);
  if (q.isLoading) return <Loading rows={4} />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const skills = q.data!, domains = toDomains(skills);
  const shown = domain === "all" ? skills : skills.filter((s) => s.domain_slug === domain);
  const selected = domains.find((d) => d.slug === sel);
  return (
    <>
      <PageHeader title={t("My skills")} sub={t("Prerequisites, current levels and evidence state. Blue = provisional (AI-assessed), green = verified by a human reviewer.")} actions={
        <div role="group" aria-label={t("View")} className="flex gap-1 rounded-[10px] border border-line p-[3px]">{(["graph", "list"] as const).map((v) => <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={clsx("h-8 rounded-lg px-3 text-[13px] font-medium", view === v ? "bg-elevated text-fg shadow-[inset_0_0_0_1px_var(--border)]" : "text-fg2")}>{v === "graph" ? t("Constellation") : t("List")}</button>)}</div>} />
      <div className="mb-4 flex items-center gap-2"><label htmlFor="dom" className="lab">{t("Domain")}</label>
        <select id="dom" value={domain} onChange={(e) => { setDomain(e.target.value); setSel(e.target.value === "all" ? null : e.target.value); }} className="min-h-9 rounded-[10px] border border-line bg-elevated px-2 text-sm"><option value="all">{t("All domains")}</option>{domains.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></div>
      {view === "graph" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="p-2"><Constellation skills={skills} selected={sel} onSelect={(s) => { setSel(s); setDomain(s ?? "all"); }} height={520} /></Card>
          <div className="space-y-3">{selected ? <DomainDetail domain={selected} onClose={() => { setSel(null); setDomain("all"); }} /> : <Card><p className="lab">{t("Hover a node to trace prerequisites")}</p><p className="mt-2 text-sm text-fg2">{t("Click a domain to see its skills and levels. Use the List view for an accessible table of every skill.")}</p></Card>}</div>
        </div>
      ) : (
        <Card className="overflow-hidden p-0"><div role="table" aria-label={t("Skills list")}><div role="row" className="lab grid grid-cols-[2.2fr_1fr_1.2fr] gap-3 px-4 py-3"><span role="columnheader">{t("Skill")}</span><span role="columnheader">{t("Level")}</span><span role="columnheader">{t("State")}</span></div>
          {shown.map((s) => <div role="row" key={s.id} className="grid grid-cols-[2.2fr_1fr_1.2fr] items-center gap-3 border-t border-line px-4 py-3 text-[13.5px] hover:bg-elevated"><span role="cell"><Link href={`/skills/${s.id}`} className="font-medium hover:underline">{s.name}</Link><span className="block text-xs text-muted">{s.domain}</span></span><span role="cell"><LevelBar level={s.level} /></span><span role="cell"><StateBadge state={s.state} /></span></div>)}</div></Card>
      )}
    </>
  );
}
