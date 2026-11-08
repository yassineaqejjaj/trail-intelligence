"use client";
import { ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Constellation, DomainDetail, toDomains } from "@/components/constellation";
import { Card, EmptyState, ErrorState, LevelBar, LinkButton, Loading, StateBadge } from "@/components/ui";
import { LEVEL_NAMES } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useAssessments, useExercises, usePath, useProgress } from "@/lib/hooks";

function Stat({ label, value, of, chip }: { label: string; value: number | string; of?: string; chip?: React.ReactNode }) {
  return <Card className="flex flex-col gap-1.5 p-[18px]"><div className="text-[13px] text-fg2">{label}</div><div className="flex items-baseline gap-2"><span className="h text-[32px] font-semibold">{value}</span>{of && <span className="text-sm text-muted">{of}</span>}</div>{chip}</Card>;
}

export default function Dashboard() {
  const me = useMe().data, p = useProgress(), a = useAssessments(), ex = useExercises(), path = usePath();
  const [view, setView] = useState<"graph" | "list">("graph"), [sel, setSel] = useState<string | null>(null);
  if (p.isLoading) return <Loading rows={4} />;
  if (p.isError) return <ErrorState error={p.error} retry={() => p.refetch()} />;
  const prog = p.data!, rec = prog.recommendation;
  const baseline = ex.data?.find((e) => e.is_baseline && e.professional_role === me?.professional_role);
  const recExercise = ex.data?.find((e) => e.slug === rec.exercise_slug);
  const domains = toDomains(prog.skills), selected = domains.find((d) => d.slug === sel);
  const assessed = prog.skills.filter((s) => s.state !== "not_assessed").sort((x, y) => y.level - x.level);
  const dev = prog.skills.filter((s) => s.state !== "not_assessed" && s.level < 2).length;
  const next = recExercise ?? baseline;
  const first = me?.full_name?.split(" ")[0];
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[680px] flex-col gap-2">
          <div className="lab">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}{me?.professional_role ? ` · ${me.professional_role}` : ""}</div>
          <h1 className="h text-[40px] font-semibold leading-[1.1]">{first ? `${first}, your` : "Your"} intelligence is growing.</h1>
          <p className="text-[15px] leading-relaxed text-fg2">{prog.summary.assessed === 0 ? "Start with a 20-minute baseline to map where you stand." : <>{prog.summary.verified} verified, {prog.summary.provisional} provisional. {rec.skill_slug && <>Next focus: <b className="font-semibold text-fg">{prog.skills.find((s) => s.slug === rec.skill_slug)?.name}</b>.</>}</>}</p>
        </div>
        <div className="flex flex-wrap gap-2"><LinkButton href="/profile" variant="outline">View Passport</LinkButton>{next && <LinkButton href={`/practice/${next.id}`}>{prog.summary.assessed === 0 ? "Begin baseline" : "Continue"}: {next.title.replace("Baseline: ", "")}<ArrowRight className="h-4 w-4" /></LinkButton>}</div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <Stat label="Verified capabilities" value={prog.summary.verified} of={`of ${prog.summary.total} skills`} chip={<span className="chip s-ver self-start">Human-reviewed</span>} />
        <Stat label="Provisional" value={prog.summary.provisional} chip={<span className="chip s-imp self-start">AI-assessed only</span>} />
        <Stat label="Assessed" value={prog.summary.assessed} of={`/ ${prog.summary.total}`} chip={<span className="chip self-start">{a.data?.length ?? 0} assessments</span>} />
        <Stat label="Needs development" value={dev} of="skills" chip={<span className="chip s-imp self-start">Below level 2</span>} />
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-4">
        <Card className="col-span-2 flex min-w-0 flex-col p-0 max-lg:col-span-1">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div><h2 className="h text-lg font-semibold">AI Skills Constellation</h2><p className="mt-0.5 text-[12.5px] text-muted">Hover to trace prerequisites · click a domain for detail</p></div>
            <div role="tablist" aria-label="View" className="flex gap-1 rounded-[10px] border border-line p-[3px]">{(["graph", "list"] as const).map((v) => <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={clsx("h-8 rounded-lg px-3 text-[13px] font-medium", view === v ? "bg-elevated text-fg shadow-[inset_0_0_0_1px_var(--border)]" : "text-fg2")}>{v === "graph" ? "Constellation" : "List"}</button>)}</div>
          </div>
          {view === "graph" ? (
            <div className="relative m-2"><Constellation skills={prog.skills} selected={sel} onSelect={setSel} />
              {selected && <div className="absolute bottom-3 left-3 w-[300px] max-w-[calc(100%-24px)]"><DomainDetail domain={selected} onClose={() => setSel(null)} /></div>}</div>
          ) : (
            <div role="table" aria-label="Skills list" className="pb-2"><div role="row" className="grid grid-cols-[2.2fr_1fr_1.2fr] px-4 py-3 text-xs text-muted"><span role="columnheader">Skill</span><span role="columnheader">Level</span><span role="columnheader">State</span></div>
              {prog.skills.map((s) => <div role="row" key={s.id} className="grid grid-cols-[2.2fr_1fr_1.2fr] items-center border-t border-line px-4 py-3 text-[13.5px] hover:bg-elevated"><Link role="cell" href={`/skills/${s.id}`} className="font-medium hover:underline">{s.name}</Link><span role="cell" className="font-mono">L{s.level}</span><span role="cell"><StateBadge state={s.state} /></span></div>)}</div>
          )}
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3" >
            <div className="lab text-blue">Recommended next</div>
            {rec.skill_slug ? <>
              <div className="h text-lg font-semibold">{recExercise?.title ?? prog.skills.find((s) => s.slug === rec.skill_slug)?.name}</div>
              <p className="text-[13px] leading-relaxed text-fg2">{rec.explanation}</p>
              {recExercise && <LinkButton href={`/practice/${recExercise.id}`}>Start exercise</LinkButton>}</> : <p className="text-sm text-fg2">{rec.explanation}</p>}
          </Card>
          <Card className="flex flex-col gap-2"><div className="lab">Learning path</div>
            {path.data ? <><p className="text-sm text-fg2">{path.data.completed} of {path.data.total} skills at level 2+</p><div className="bar"><div className="h-full bg-cyan" style={{ width: `${(path.data.completed / Math.max(1, path.data.total)) * 100}%` }} /></div><Link href="/paths" className="text-sm text-blue hover:underline">View path</Link></> : <Loading rows={1} />}</Card>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        <Card><h2 className="h text-lg font-semibold">Skill progression</h2>
          {assessed.length === 0 ? <div className="mt-3"><EmptyState title="No skills assessed yet" hint="Complete an exercise to see progression." /></div> : <ul className="mt-3 space-y-3">{assessed.slice(0, 6).map((s) => <li key={s.id} className="flex items-center justify-between gap-3"><Link href={`/skills/${s.id}`} className="text-sm hover:underline">{s.name}</Link><span className="flex items-center gap-3"><LevelBar level={s.level} /><StateBadge state={s.state} /></span></li>)}</ul>}</Card>
        <Card><h2 className="h text-lg font-semibold">Recent assessments</h2>
          {!a.data?.length ? <div className="mt-3"><EmptyState title="No assessments yet" /></div> : <ul className="mt-3 space-y-2.5">{a.data.slice(0, 5).map((x) => <li key={x.id} className="flex items-center justify-between text-sm"><Link href={`/assessments/${x.id}`} className="hover:underline">{new Date(x.created_at).toLocaleDateString()} · {x.level ? LEVEL_NAMES[x.level] : "—"}</Link><StateBadge state={x.status} /></li>)}</ul>}</Card>
      </section>
      <p className="flex items-center gap-2 text-xs text-muted"><ShieldAlert className="h-3.5 w-3.5" />{prog.disclaimer}</p>
    </div>
  );
}
