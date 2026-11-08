"use client";
import Link from "next/link";
import { Card, ErrorState, Loading, PageHeader } from "@/components/ui";
import { usePath } from "@/lib/hooks";

export default function Paths() {
  const q = usePath();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const groups = new Map<string, { name: string; done: number; total: number }>();
  q.data!.steps.forEach((s) => { const g = groups.get(s.skill.domain_slug) ?? { name: s.skill.domain, done: 0, total: 0 }; g.total++; if (s.complete) g.done++; groups.set(s.skill.domain_slug, g); });
  return (
    <>
      <PageHeader title="Learning paths" sub="One path per AI domain, ordered by prerequisites. A skill counts as complete at level 2+." />
      <div className="grid gap-4 md:grid-cols-2">{[...groups.entries()].map(([slug, g]) => (
        <Link key={slug} href={`/paths/${slug}`}><Card className="transition hover:bg-elevated"><h2 className="font-display text-lg">{g.name}</h2><p className="text-sm text-fg2">{g.done} / {g.total} skills</p><div className="mt-3 h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-cyan" style={{ width: `${(g.done / g.total) * 100}%` }} /></div></Card></Link>))}</div>
    </>
  );
}
