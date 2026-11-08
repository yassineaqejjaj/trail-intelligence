"use client";
import Link from "next/link";
import { EmptyState, ErrorState, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useAssessments } from "@/lib/hooks";
import { LEVEL_NAMES } from "@/lib/api";

export default function Assessments() {
  const q = useAssessments();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <>
      <PageHeader title="Assessments" sub="History of your evaluated submissions" />
      {!q.data!.length ? <EmptyState title="No assessments yet" hint="Submit an exercise to receive evidence-linked feedback." action={<LinkButton href="/practice">Open practice lab</LinkButton>} /> :
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">{q.data!.map((a) => (
          <li key={a.id}><Link href={`/assessments/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-elevated"><div><p className="text-sm font-medium">{new Date(a.created_at).toLocaleString()}</p><p className="text-xs text-muted">{a.level ? LEVEL_NAMES[a.level] : "No level"}{a.overall_score != null ? ` · ${a.overall_score}%` : ""}</p></div><StateBadge state={a.status} /></Link></li>))}</ul>}
    </>
  );
}
