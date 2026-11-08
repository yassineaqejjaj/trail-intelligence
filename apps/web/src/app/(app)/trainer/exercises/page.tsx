"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState, ErrorState, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { api, type Exercise } from "@/lib/api";
import { useMe } from "@/lib/auth";

export default function TrainerExercises() {
  const me = useMe().data;
  const q = useQuery({ queryKey: ["t-ex"], queryFn: () => api<Exercise[]>("/trainer/exercises") });
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <>
      <PageHeader title="Exercises" actions={<LinkButton href="/trainer/exercises/new">New exercise</LinkButton>} />
      {!q.data!.length ? <EmptyState title="No exercises" /> : <ul className="divide-y divide-line rounded-xl border border-line bg-surface">{q.data!.map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-medium">{e.title}</p><p className="text-xs text-muted">{e.professional_role} · rubric v{e.rubric_version} · {e.skills.length} skills</p></div>
          <div className="flex items-center gap-3"><StateBadge state={e.status} />{(me?.role === "platform_admin" || e.slug.startsWith("custom-")) && <Link href={`/trainer/exercises/${e.id}`} className="text-sm text-blue underline">Edit</Link>}</div></li>))}</ul>}
    </>
  );
}
