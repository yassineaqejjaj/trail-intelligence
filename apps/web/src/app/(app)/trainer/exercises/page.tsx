"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge, EmptyState, ErrorState, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, type Exercise } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useRoles } from "@/lib/hooks";

export default function TrainerExercises() {
  const t = useT(), me = useMe().data, roles = useRoles().data ?? [];
  const q = useQuery({ queryKey: ["t-ex"], queryFn: () => api<Exercise[]>("/trainer/exercises") });
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const roleLabel = (k: string) => roles.find((r) => r.key === k)?.label ?? k;
  return (
    <>
      <PageHeader title={t("Exercises")} actions={<LinkButton href="/trainer/exercises/new">{t("New exercise")}</LinkButton>} />
      {!q.data!.length ? <EmptyState title={t("No exercises")} action={<LinkButton href="/trainer/exercises/new">{t("New exercise")}</LinkButton>} /> : <ul className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">{q.data!.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0"><p className="font-medium">{e.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted"><Badge tone="cyan">{roleLabel(e.professional_role)}</Badge><span>{t("Rubric v{n}", { n: e.rubric_version })}</span><span>·</span><span>{t("{n} skills", { n: e.skills.length })}</span></div></div>
          <div className="flex items-center gap-3"><StateBadge state={e.status} />{(me?.role === "platform_admin" || e.slug.startsWith("custom-")) && <Link href={`/trainer/exercises/${e.id}`} className="text-sm font-medium text-blue hover:underline">{t("Edit")}</Link>}</div></li>))}</ul>}
    </>
  );
}
