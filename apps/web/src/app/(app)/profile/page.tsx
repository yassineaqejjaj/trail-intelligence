"use client";
import Link from "next/link";
import { Card, EmptyState, ErrorState, LevelBar, Loading, StateBadge } from "@/components/ui";
import { LEVEL_NAMES, type Skill } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useProgress } from "@/lib/hooks";

export default function Passport() {
  const me = useMe().data, p = useProgress();
  if (p.isLoading) return <Loading />;
  if (p.isError) return <ErrorState error={p.error} />;
  const by = new Map<string, Skill[]>();
  p.data!.skills.filter((s) => s.state !== "not_assessed").forEach((s) => by.set(s.domain, [...(by.get(s.domain) ?? []), s]));
  const ver = p.data!.summary.verified, prov = p.data!.summary.provisional;
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4"><div><div className="lab">Skills Passport</div><h1 className="h mt-2 text-[36px] font-semibold leading-tight">{me?.full_name || me?.email}</h1><p className="mt-1 text-[15px] text-fg2">{me?.professional_role ?? "Professional"} · {ver} verified · {prov} provisional</p></div>
        <span className="chip s-ins">Private — visible only to you</span></section>
      <Card className="border-amber/40 text-sm text-fg2"><b className="text-fg">Read this as evidence, not a certificate.</b> Amber entries come from automated assessments that no human has reviewed. Only green entries were confirmed by a trainer.</Card>
      {by.size === 0 ? <EmptyState title="No demonstrated skills yet" hint="Complete an exercise to start your passport." action={<Link href="/practice" className="text-blue underline">Open the practice lab</Link>} /> :
        [...by.entries()].map(([d, ss]) => <Card key={d}><h2 className="h text-lg font-semibold">{d}</h2><ul className="mt-3 divide-y divide-line">{ss.map((s) => <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><Link href={`/skills/${s.id}`} className="font-medium hover:underline">{s.name}</Link><span className="ml-2 text-xs text-muted">{LEVEL_NAMES[s.level]}</span></span><span className="flex items-center gap-3"><LevelBar level={s.level} /><StateBadge state={s.state} /></span></li>)}</ul></Card>)}
      <p className="text-xs text-muted">{p.data!.disclaimer}</p>
    </div>
  );
}
