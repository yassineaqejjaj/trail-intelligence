"use client";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import clsx from "clsx";
import { Card, EmptyState, ErrorState, Label, LevelBar, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { useExercises, usePath, useSkills } from "@/lib/hooks";

export default function PathDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, fmtNum } = useI18n(), q = usePath(), ex = useExercises(), skills = useSkills();
  const [open, setOpen] = useState<string | null>(null);
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const steps = q.data!.steps.filter((s) => s.skill.domain_slug === id);
  if (!steps.length) return <EmptyState title={t("Path not found")} action={<LinkButton href="/paths" variant="outline">{t("All paths")}</LinkButton>} />;
  const done = steps.filter((s) => s.complete).length;
  const nextSlug = q.data!.next;
  const nameOf = (slug: string) => skills.data?.find((x) => x.slug === slug)?.name ?? slug;
  const current = open ?? (steps.find((s) => s.skill.slug === nextSlug) ?? steps.find((s) => !s.complete))?.skill.id ?? null;
  return (
    <>
      <PageHeader title={steps[0].skill.domain} sub={t("{done} of {total} complete", { done, total: steps.length })} actions={<LinkButton href="/paths" variant="outline">{t("All paths")}</LinkButton>} />
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="p-3">
          <ol className="m-0 list-none p-0">{steps.map((s, i) => {
            const isNext = s.skill.slug === nextSlug, started = !s.complete && s.skill.state !== "not_assessed", isOpen = current === s.skill.id;
            const chip = s.complete ? ["s-ver", t("Level 2+ reached")] : isNext ? ["s-rev", t("Next up")] : started ? ["s-imp", t("In progress")] : ["", t("Upcoming")];
            const exercises = s.exercises.map((eid) => ex.data?.find((e) => e.id === eid)).filter((e) => !!e);
            return (
              <li key={s.skill.id} className="relative">
                {i < steps.length - 1 && <span aria-hidden="true" className={clsx("absolute start-[37px] bottom-0 top-0 w-0.5", s.complete ? "bg-green" : "bg-line")} />}
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : s.skill.id)} className="relative flex w-full items-center gap-3.5 rounded-[14px] p-4 text-start hover:bg-elevated">
                  <span className={clsx("relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-medium", s.complete ? "bg-green text-on" : isNext ? "border-2 border-blue bg-bg text-blue" : "border-[1.5px] border-line2 bg-bg text-muted")}>{s.complete ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : fmtNum(i + 1)}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5"><span className="text-[15px] font-semibold">{s.skill.name}</span><span className="line-clamp-1 text-[12.5px] text-fg2">{s.skill.description}</span></span>
                  <span className={clsx("chip", chip[0])}>{chip[1]}</span>
                  <ChevronDown className={clsx("h-4 w-4 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                </button>
                {isOpen && <div className="mx-4 mb-3 grid gap-4 rounded-xl border border-line bg-elevated p-4 sm:ms-[72px] sm:grid-cols-2">
                  <div className="sm:col-span-2"><Label>{t("Description")}</Label><p className="mt-1.5 text-[13.5px] leading-relaxed">{s.skill.description}</p></div>
                  <div><Label>{t("Requires")}</Label>{s.skill.prerequisites.length === 0 ? <p className="mt-1.5 text-[13.5px] text-fg2">{t("None")}</p> : <ul className="mt-1.5 space-y-1 text-[13.5px]">{s.skill.prerequisites.map((p) => <li key={p}>{nameOf(p)}</li>)}</ul>}</div>
                  <div><Label>{t("Your level")}</Label><div className="mt-2 flex flex-wrap items-center gap-3"><LevelBar level={s.skill.level} /><StateBadge state={s.skill.state} /></div></div>
                  <div className="sm:col-span-2"><Label>{t("Exercises")}</Label>{exercises.length === 0 ? <p className="mt-1.5 text-[13.5px] text-fg2">{t("No exercises yet.")}</p> : <ul className="mt-1.5 space-y-1.5 text-[13.5px]">{exercises.map((e) => <li key={e.id}><Link href={`/practice/${e.id}`} className="text-blue hover:underline">{e.title}</Link></li>)}</ul>}</div>
                  <div className="flex flex-wrap gap-2 sm:col-span-2"><LinkButton href={`/skills/${s.skill.id}`} variant="outline">{t("Skill details")}</LinkButton>{s.exercises[0] && <LinkButton href={`/practice/${s.exercises[0]}`}>{t("Practice")}</LinkButton>}</div>
                </div>}
              </li>);
          })}</ol>
        </Card>
        <Card className="flex flex-col gap-3"><Label>{t("Path summary")}</Label>
          <div><span className="h text-[28px] font-semibold">{fmtNum(done)}</span><span className="text-[15px] text-muted"> / {fmtNum(steps.length)}</span><p className="text-[12.5px] text-fg2">{t("skills at level 2+")}</p></div>
          <div className="bar"><div className="h-full bg-cyan" style={{ width: `${(done / steps.length) * 100}%` }} /></div>
          <p className="text-xs leading-relaxed text-muted">{t("A skill counts as complete at level 2+. Provisional levels come from automated assessments.")}</p></Card>
      </div>
    </>
  );
}
