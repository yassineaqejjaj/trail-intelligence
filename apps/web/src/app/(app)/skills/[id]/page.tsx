"use client";
import Link from "next/link";
import { use } from "react";
import { Card, EmptyState, ErrorState, LevelBar, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useExercises, useSkills } from "@/lib/hooks";
import { LEVEL_NAMES } from "@/lib/api";

export default function SkillDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useSkills(), ex = useExercises();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} />;
  const s = q.data!.find((x) => x.id === id);
  if (!s) return <EmptyState title="Skill not found" action={<LinkButton href="/skills" variant="outline">Back to skills</LinkButton>} />;
  const pre = q.data!.filter((x) => s.prerequisites.includes(x.slug));
  const exs = ex.data?.filter((e) => e.skills.includes(s.slug)) ?? [];
  return (
    <>
      <PageHeader title={s.name} sub={`${s.domain} · framework v${s.framework_version}`} actions={<StateBadge state={s.state} />} />
      <p className="mb-6 max-w-2xl text-fg2">{s.description}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h2 className="font-display text-lg">Your level</h2><p className="mt-2 text-sm">{LEVEL_NAMES[s.level]}</p><div className="mt-2"><LevelBar level={s.level} /></div>
          {s.state === "provisional" && <p className="mt-3 text-xs text-amber">Based on an automated assessment — not yet verified by a human reviewer.</p>}</Card>
        <Card><h2 className="font-display text-lg">Prerequisites</h2>{pre.length === 0 ? <p className="mt-2 text-sm text-fg2">None</p> : <ul className="mt-2 space-y-1.5 text-sm">{pre.map((p) => <li key={p.id} className="flex justify-between"><Link href={`/skills/${p.id}`} className="hover:underline">{p.name}</Link><StateBadge state={p.state} /></li>)}</ul>}</Card>
        <Card><h2 className="font-display text-lg">Proficiency levels</h2><ol className="mt-2 space-y-1 text-sm">{Object.entries(s.levels).map(([k, v]) => <li key={k} className={Number(k) === s.level ? "text-blue" : "text-fg2"}>L{k} — {LEVEL_NAMES[Number(k)]}: {v}</li>)}</ol></Card>
        <Card><h2 className="font-display text-lg">Next steps</h2>{exs.length === 0 ? <p className="mt-2 text-sm text-fg2">No exercises yet.</p> : <ul className="mt-2 space-y-2 text-sm">{exs.map((e) => <li key={e.id}><Link href={`/practice/${e.id}`} className="text-blue hover:underline">{e.title}</Link></li>)}</ul>}
          <h3 className="mt-4 text-sm font-medium">Assessment criteria</h3><ul className="mt-1 list-disc pl-5 text-sm text-fg2">{s.criteria.map((c) => <li key={c}>{c}</li>)}</ul></Card>
      </div>
    </>
  );
}
