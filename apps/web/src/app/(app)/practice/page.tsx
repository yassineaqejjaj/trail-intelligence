"use client";
import Link from "next/link";
import { Badge, Card, EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { useMe } from "@/lib/auth";
import { useExercises } from "@/lib/hooks";
import { LEVEL_NAMES } from "@/lib/api";

export default function Practice() {
  const q = useExercises(), me = useMe().data;
  if (q.isLoading) return <Loading rows={4} />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const list = [...q.data!].sort((a, b) => Number(b.professional_role === me?.professional_role) - Number(a.professional_role === me?.professional_role) || Number(b.is_baseline) - Number(a.is_baseline));
  if (!list.length) return <EmptyState title="No exercises available" />;
  return (
    <>
      <PageHeader title="Practice lab" sub="Professional exercises assessed against a versioned rubric." />
      <div className="grid gap-4 md:grid-cols-2">{list.map((e) => (
        <Link key={e.id} href={`/practice/${e.id}`}><Card className="h-full transition hover:bg-elevated">
          <div className="flex flex-wrap gap-2">{e.is_baseline && <Badge tone="blue">Baseline</Badge>}<Badge>{e.professional_role}</Badge><Badge>Target: {LEVEL_NAMES[e.expected_level]}</Badge></div>
          <h2 className="mt-3 font-display text-lg">{e.title}</h2><p className="mt-1 line-clamp-2 text-sm text-fg2">{e.scenario}</p></Card></Link>))}</div>
    </>
  );
}
