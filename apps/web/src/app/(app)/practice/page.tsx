"use client";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Card, EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { levelName, type Exercise } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useExercises, useRoleLabel } from "@/lib/hooks";

export default function Practice() {
  const { t } = useI18n(), q = useExercises(), me = useMe().data, roleLabel = useRoleLabel();
  const [filter, setFilter] = useState("all");
  if (q.isLoading) return <Loading rows={4} />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  if (!q.data!.length) return <EmptyState title={t("No exercises available")} />;
  const own = me?.professional_role;
  const byRole = new Map<string, Exercise[]>();
  [...q.data!].sort((a, b) => Number(b.is_baseline) - Number(a.is_baseline)).forEach((e) => byRole.set(e.professional_role, [...(byRole.get(e.professional_role) ?? []), e]));
  const roles = [...byRole.keys()].sort((a, b) => Number(b === own) - Number(a === own) || roleLabel(a).localeCompare(roleLabel(b)));
  const shownRoles = filter === "all" ? roles : roles.filter((r) => r === filter);
  return (
    <>
      <PageHeader title={t("Practice lab")} sub={t("Professional exercises assessed against a versioned rubric.")} />
      <div role="group" aria-label={t("Filter by profession")} className="mb-5 flex flex-wrap gap-2">
        {["all", ...roles].map((r) => <button key={r} type="button" aria-pressed={filter === r} onClick={() => setFilter(r)} className={clsx("chip h-8 px-3 text-[13px]", filter === r ? "s-rev" : "hover:border-line2")}>{r === "all" ? t("All professions") : roleLabel(r)}</button>)}
      </div>
      <div className="flex flex-col gap-8">{shownRoles.map((r) => (
        <section key={r} aria-label={roleLabel(r)}>
          <div className="mb-3 flex items-center gap-2"><h2 className="lab">{roleLabel(r)}</h2>{r === own && <span className="chip s-lrn" style={{ height: 20, fontSize: 11 }}>{t("Your profession")}</span>}</div>
          <div className="grid gap-4 md:grid-cols-2">{byRole.get(r)!.map((e) => (
            <Link key={e.id} href={`/practice/${e.id}`} className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"><Card className="h-full transition hover:bg-elevated">
              <div className="flex flex-wrap gap-2">{e.is_baseline && <span className="chip s-rev">{t("Baseline")}</span>}<span className="chip">{t("Target: {level}", { level: levelName(t, e.expected_level) })}</span></div>
              <h3 className="h mt-3 text-lg font-semibold">{e.title}</h3><p className="mt-1 line-clamp-2 text-sm text-fg2">{e.scenario}</p></Card></Link>))}</div>
        </section>))}</div>
    </>
  );
}
