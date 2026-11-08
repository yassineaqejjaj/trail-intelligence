"use client";
import Link from "next/link";
import { use } from "react";
import { Card, EmptyState, ErrorState, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { usePath } from "@/lib/hooks";
import { CheckCircle2, Circle } from "lucide-react";

export default function PathDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = usePath();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} />;
  const steps = q.data!.steps.filter((s) => s.skill.domain_slug === id);
  if (!steps.length) return <EmptyState title="Path not found" action={<LinkButton href="/paths" variant="outline">All paths</LinkButton>} />;
  return (
    <>
      <PageHeader title={steps[0].skill.domain} sub={`${steps.filter((s) => s.complete).length} of ${steps.length} complete`} />
      <ol className="space-y-3">{steps.map((s) => (
        <li key={s.skill.id}><Card className="flex items-center gap-4">{s.complete ? <CheckCircle2 className="h-5 w-5 text-green" aria-label="Complete" /> : <Circle className="h-5 w-5 text-muted" aria-label="Not complete" />}
          <div className="flex-1"><Link href={`/skills/${s.skill.id}`} className="font-medium hover:underline">{s.skill.name}</Link><p className="text-sm text-fg2">{s.skill.description}</p>
            {s.skill.prerequisites.length > 0 && <p className="mt-1 text-xs text-muted">Requires: {s.skill.prerequisites.join(", ")}</p>}</div>
          <StateBadge state={s.skill.state} />{s.exercises[0] && <LinkButton href={`/practice/${s.exercises[0]}`} variant="outline">Practice</LinkButton>}</Card></li>))}</ol>
    </>
  );
}
