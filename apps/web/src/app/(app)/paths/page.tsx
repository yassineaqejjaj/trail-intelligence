"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, EmptyState, ErrorState, Label, LinkButton, Loading, PageHeader } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { usePath } from "@/lib/hooks";

export default function Paths() {
  const { t, fmtNum } = useI18n(), q = usePath();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const data = q.data!;
  const groups = new Map<string, { name: string; done: number; total: number; started: number }>();
  data.steps.forEach((s) => {
    const g = groups.get(s.skill.domain_slug) ?? { name: s.skill.domain, done: 0, total: 0, started: 0 };
    g.total++; if (s.complete) g.done++; else if (s.skill.state !== "not_assessed") g.started++;
    groups.set(s.skill.domain_slug, g);
  });
  const nextStep = data.steps.find((s) => s.skill.slug === data.next);
  if (!groups.size) return <EmptyState title={t("No learning paths yet")} />;
  return (
    <>
      <PageHeader title={t("Learning paths")} sub={t("One path per AI domain, ordered by prerequisites. A skill counts as complete at level 2+.")} />
      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-[14px] border border-line bg-surface p-5">
        <div className="min-w-[200px] flex-1"><Label>{t("Overall progress")}</Label>
          <div className="mt-1 flex items-baseline gap-2"><span className="h text-[28px] font-semibold">{fmtNum(data.completed)}</span><span className="text-sm text-muted">{t("of {n} skills at level 2+", { n: data.total })}</span></div>
          <div className="bar mt-2"><div className="h-full bg-cyan" style={{ width: `${(data.completed / Math.max(1, data.total)) * 100}%` }} /></div></div>
        {nextStep && <div className="min-w-[220px] flex-1"><Label className="text-blue">{t("Next in your path")}</Label><p className="mt-1 font-semibold">{nextStep.skill.name}</p><p className="text-[13px] text-fg2">{nextStep.skill.domain}</p></div>}
        {nextStep?.exercises[0] && <LinkButton href={`/practice/${nextStep.exercises[0]}`}>{t("Practice")}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></LinkButton>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{[...groups.entries()].map(([slug, g]) => (
        <Link key={slug} href={`/paths/${slug}`} className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
          <Card className="h-full transition hover:bg-elevated">
            <Label>{t("Domain path")}</Label>
            <h2 className="h mt-1 text-xl font-semibold">{g.name}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5"><span className="chip s-ver">{t("Completed: {n}", { n: g.done })}</span><span className="chip s-rev">{t("In progress: {n}", { n: g.started })}</span><span className="chip">{t("Upcoming: {n}", { n: g.total - g.done - g.started })}</span></div>
            <p className="mt-3 text-sm text-fg2">{t("{done} of {total} skills at level 2+", { done: g.done, total: g.total })}</p>
            <div className="bar mt-2"><div className="h-full bg-cyan" style={{ width: `${(g.done / Math.max(1, g.total)) * 100}%` }} /></div></Card></Link>))}</div>
    </>
  );
}
