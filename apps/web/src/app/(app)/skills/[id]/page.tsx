"use client";
import Link from "next/link";
import { use } from "react";
import { Card, EmptyState, ErrorState, Label, LevelBar, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { levelName } from "@/lib/api";
import { useExercises, useSkills } from "@/lib/hooks";

export default function SkillDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT(), q = useSkills(), ex = useExercises();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const s = q.data!.find((x) => x.id === id);
  if (!s) return <EmptyState title={t("Skill not found")} action={<LinkButton href="/skills" variant="outline">{t("Back to skills")}</LinkButton>} />;
  const pre = q.data!.filter((x) => s.prerequisites.includes(x.slug));
  const exs = ex.data?.filter((e) => e.skills.includes(s.slug)) ?? [];
  return (
    <>
      <PageHeader title={s.name} sub={t("{domain} · framework v{version}", { domain: s.domain, version: s.framework_version })} actions={<StateBadge state={s.state} />} />
      <p className="mb-6 max-w-2xl text-fg2">{s.description}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><Label>{t("Your level")}</Label><p className="h mt-2 text-lg font-semibold">{levelName(t, s.level)}</p><div className="mt-2"><LevelBar level={s.level} /></div>
          {s.state === "provisional" && <p className="mt-3 text-xs text-amber">{t("Based on an automated assessment — not yet verified by a human reviewer.")}</p>}</Card>
        <Card><Label>{t("Prerequisites")}</Label>{pre.length === 0 ? <p className="mt-2 text-sm text-fg2">{t("None")}</p> : <ul className="mt-2 space-y-1.5 text-sm">{pre.map((p) => <li key={p.id} className="flex items-center justify-between gap-3"><Link href={`/skills/${p.id}`} className="hover:underline">{p.name}</Link><StateBadge state={p.state} /></li>)}</ul>}</Card>
        <Card><Label>{t("Proficiency levels")}</Label><ol className="mt-2 space-y-1 text-sm">{Object.entries(s.levels).map(([k, v]) => <li key={k} className={Number(k) === s.level ? "text-blue" : "text-fg2"}>{t("L{k} — {name}: {desc}", { k, name: levelName(t, Number(k)), desc: v })}</li>)}</ol></Card>
        <Card><Label>{t("Next steps")}</Label>{exs.length === 0 ? <p className="mt-2 text-sm text-fg2">{t("No exercises yet.")}</p> : <ul className="mt-2 space-y-2 text-sm">{exs.map((e) => <li key={e.id}><Link href={`/practice/${e.id}`} className="text-blue hover:underline">{e.title}</Link></li>)}</ul>}
          <h3 className="mt-4 text-sm font-medium">{t("Assessment criteria")}</h3><ul className="mt-1 list-disc ps-5 text-sm text-fg2">{s.criteria.map((c) => <li key={c}>{c}</li>)}</ul></Card>
      </div>
    </>
  );
}
