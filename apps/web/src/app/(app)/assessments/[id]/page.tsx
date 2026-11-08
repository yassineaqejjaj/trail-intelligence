"use client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { Button, Card, ErrorState, Label, LinkButton, Loading, StateBadge } from "@/components/ui";
import { api, LEVEL_NAMES, type Assessment, type Exercise } from "@/lib/api";
import { useExercises, useProgress } from "@/lib/hooks";

const THRESH = [25, 50, 75, 90]; // level bands (% of weighted score) — see app/ai/assessment.py level_from_fraction

export default function AssessmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useQuery({ queryKey: ["assessment", id], queryFn: () => api<Assessment>(`/assessments/${id}`), refetchInterval: (s) => (["queued", "running"].includes(s.state.data?.status ?? "") ? 2000 : false) });
  const exs = useExercises(), prog = useProgress();
  const sub = useQuery({ queryKey: ["sub", q.data?.submission_id], enabled: !!q.data, queryFn: () => api<{ exercise_id: string }>(`/submissions/${q.data!.submission_id}`) });
  const [step, setStep] = useState(4);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => { const t = timers.current; return () => t.forEach(clearTimeout); }, []);
  const replay = () => { timers.current.forEach(clearTimeout); setStep(0); timers.current = [1, 2, 3, 4].map((i) => setTimeout(() => setStep(i), 250 + i * 550)); };
  const rv = (n: number) => ({ opacity: step >= n ? 1 : 0, transform: step >= n ? "none" : "translateY(12px)", transition: "opacity .32s cubic-bezier(.2,.8,.2,1), transform .32s cubic-bezier(.2,.8,.2,1)" });

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const a = q.data!;
  const ex: Exercise | undefined = exs.data?.find((e) => e.id === sub.data?.exercise_id);
  const dim = (k: string) => ex?.rubric.find((r) => r.key === k);
  const reviewed = !a.provisional;
  const pct = a.overall_score ?? 0;
  const tone = reviewed ? "var(--green)" : a.status === "pending_human_review" ? "var(--blue)" : "var(--amber)";
  const chip = reviewed ? ["s-ver", "Verified · human-reviewed"] : a.status === "pending_human_review" ? ["s-rev", "Pending human review"] : a.status === "insufficient_evidence" ? ["s-ins", "Insufficient evidence"] : a.status === "failed" ? ["s-red", "Evaluation failed"] : ["s-imp", "Provisional · AI-assessed"];
  const skillNames = ex ? ex.skills.map((s) => prog.data?.skills.find((x) => x.slug === s)?.name ?? s) : [];
  const rec = prog.data?.recommendation, recEx = exs.data?.find((e) => e.slug === rec?.exercise_slug);
  const strong = a.scores.filter((s) => (s.score / (dim(s.dimension)?.max_score ?? 5)) >= 0.6).length;

  return (
    <div className="-m-2 flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
        <Link href="/assessments" aria-label="Back to assessments" className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-fg2 hover:bg-elevated"><ChevronLeft className="h-[18px] w-[18px]" /></Link>
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[13.5px] text-muted"><Link href="/assessments" className="text-fg2">Assessments</Link><span>/</span><span className="text-fg">{ex?.title ?? "Result"}</span></nav>
        <div className="ml-auto flex items-center gap-2"><span className="font-mono text-xs text-muted">{new Date(a.created_at).toLocaleString()}</span><Button variant="ghost" onClick={replay}><RotateCcw className="h-4 w-4" />Replay reveal</Button></div>
      </div>

      {a.status === "failed" && <ErrorState error={new Error(`Evaluation failed (${a.error}). No score was recorded. You can resubmit.`)} />}

      <section style={rv(1)} aria-live="polite" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-7 lg:col-span-2" >
          <div className="flex flex-wrap items-center justify-between gap-2"><Label>1 · Outcome</Label><span className={`chip ${chip[0]}`}>{chip[1]}</span></div>
          {a.level ? <h1 className="h text-[38px] font-semibold leading-[1.1]">{skillNames[0] ?? "Skill"} {reviewed ? "confirmed" : "provisionally"} at <span style={{ color: tone }}>Level {a.level}</span>.</h1>
            : <h1 className="h text-[38px] font-semibold leading-[1.1]">{a.status === "insufficient_evidence" ? "Not enough evidence to assess." : a.status === "queued" || a.status === "running" ? "Evaluating…" : "No level awarded."}</h1>}
          <p className="max-w-[640px] text-[15px] leading-relaxed text-fg2">{a.level ? `${LEVEL_NAMES[a.level]}. ` : ""}{a.status === "pending_human_review" ? (a.error?.includes("injection") ? "Your text contained instructions aimed at the grader, so a person reviews it. " : "A trainer will confirm this level. ") : ""}{reviewed ? a.review_note : "Automatic assessments are provisional and are not a certified measure of competency until a reviewer validates them."}</p>
          {a.overall_score != null && <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[12.5px] text-muted"><span>Overall score</span><span className="font-mono">{pct} / 100</span></div>
            <div className="relative h-7" role="img" aria-label={`Score ${pct} out of 100. Level bands start at ${THRESH.join(", ")}.`}>
              <div className="absolute inset-x-0 inset-y-[11px] rounded-[3px] bg-elevated" />
              <div className="absolute inset-y-[11px] left-0 rounded-[3px]" style={{ width: `${pct}%`, background: `color-mix(in srgb, ${tone} 35%, transparent)` }} />
              <div className="absolute inset-y-0.5 w-[3px] rounded-sm" style={{ left: `${Math.min(pct, 99)}%`, background: tone }} />
              {THRESH.map((t) => <div key={t} className="absolute inset-y-0 border-l-[1.5px] border-dashed border-line2" style={{ left: `${t}%` }} />)}
            </div>
            <div className="flex justify-between font-mono text-[11.5px] text-muted"><span>0</span>{THRESH.map((t, i) => <span key={t}>L{i + 2} · {t}</span>)}<span>100</span></div></div>}
        </Card>
        <Card className="flex flex-col gap-3.5 p-6"><Label>Evaluation status</Label>
          {[{ t: "AI evaluation", d: `${a.model || "—"} · prompt ${a.prompt_version || "—"} · rubric v${a.rubric_version}`, done: ["completed", "pending_human_review", "insufficient_evidence"].includes(a.status) },
            { t: "Human review", d: reviewed ? "Reviewed — level confirmed by a trainer" : a.status === "pending_human_review" ? "In the trainer queue" : "Not requested", done: reviewed },
            { t: "Added to Passport", d: reviewed ? "Verified evidence" : a.level ? "Recorded as provisional" : "Nothing recorded", done: !!a.level }].map((s, i) => (
            <div key={s.t} className="flex items-start gap-2.5 text-[13px]"><span className={`inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${s.done ? "bg-green text-on" : "border-[1.5px] border-blue text-[11px] font-bold text-blue"}`}>{s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}</span><div><div className="font-semibold">{s.t}</div><div className="text-fg2">{s.d}</div></div></div>))}
          <p className="mt-auto text-xs leading-relaxed text-muted">Disagree? Revise and resubmit; a trainer can re-score with the same rubric.</p>
        </Card>
      </section>

      {a.scores.length > 0 && <>
        <Card className="flex flex-col gap-4 p-6" >
          <div style={rv(2)} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><Label>2 · Evaluation dimensions</Label><h2 className="h mt-1.5 text-xl font-semibold">{strong} of {a.scores.length} dimensions strong{a.scores.length - strong > 0 ? `, ${a.scores.length - strong} to improve` : ""}</h2></div>
              <div className="flex flex-wrap gap-2"><span className="chip s-ver">Strong</span><span className="chip s-imp">Needs improvement</span><span className="chip s-ins">Insufficient evidence</span><span className="chip s-rev">Pending human review</span></div></div>
            <div role="table" aria-label="Score by dimension">
              <div role="row" className="grid grid-cols-[2fr_.6fr_3fr_1.4fr] gap-4 border-b border-line py-2 text-xs text-muted"><span role="columnheader">Dimension</span><span role="columnheader">Score</span><span role="columnheader">Score</span><span role="columnheader">Status</span></div>
              {a.scores.map((s) => { const d = dim(s.dimension), max = d?.max_score ?? 5, f = (s.score / max) * 100, good = f >= 60;
                return <div role="row" key={s.dimension} className="grid grid-cols-[2fr_.6fr_3fr_1.4fr] items-center gap-4 border-b border-line py-3.5 text-sm">
                  <span role="cell"><span className="font-medium">{d?.name ?? s.dimension}</span><span className="mt-0.5 block text-xs text-muted">{s.rationale}</span></span>
                  <span role="cell" className="font-mono font-medium">{s.score}/{max}</span>
                  <span role="cell" className="relative h-5" aria-hidden="true"><span className="absolute inset-x-0 inset-y-2 rounded-[3px] bg-elevated" /><span className="absolute inset-y-[5px] left-0 rounded" style={{ width: `${f}%`, background: `color-mix(in srgb, ${good ? "var(--green)" : "var(--amber)"} 40%, transparent)` }} /><span className="absolute inset-y-0.5 w-[3px] rounded-sm" style={{ left: `${Math.min(f, 99)}%`, background: good ? "var(--green)" : "var(--amber)" }} /><span className="absolute inset-y-0 border-l-[1.5px] border-dashed border-line2" style={{ left: "60%" }} /></span>
                  <span role="cell"><span className={`chip ${a.status === "pending_human_review" ? "s-rev" : good ? "s-ver" : "s-imp"}`}>{a.status === "pending_human_review" ? "Pending human review" : good ? "Strong" : "Needs improvement"}</span></span></div>; })}
            </div>
          </div>
        </Card>

        <section style={rv(3)} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="flex flex-col gap-3.5 p-6 lg:col-span-2"><Label>3 · Supporting evidence</Label>
            {a.evidence.length === 0 ? <p className="text-sm text-fg2">No quoted evidence was returned.</p> : a.evidence.map((e, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-line"><div className="flex justify-between bg-elevated px-3.5 py-2.5 text-[12.5px]"><span className="font-mono text-fg2">Your submission</span><span className="chip s-ver" style={{ height: 20, fontSize: 11 }}>{dim(e.dimension)?.name ?? e.dimension}</span></div>
                <blockquote className="m-0 border-l-[3px] border-green p-3.5 font-mono text-[12.5px] leading-[1.7]">“{e.quote}”</blockquote>
                {e.comment && <div className="border-t border-line px-3.5 py-2.5 text-[13px] leading-relaxed text-fg2"><b className="font-semibold text-fg">Evaluator:</b> {e.comment}</div>}</div>))}
          </Card>
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-2.5 p-5"><Label className="text-green">Strengths</Label><ul className="m-0 list-disc space-y-1 pl-[18px] text-[13.5px] leading-relaxed text-fg2">{a.strengths.map((s) => <li key={s}>{s}</li>)}</ul></Card>
            <Card className="flex flex-col gap-2.5 p-5"><Label className="text-amber">Improvement opportunities</Label><ul className="m-0 list-disc space-y-1 pl-[18px] text-[13.5px] leading-relaxed text-fg2">{a.improvements.map((s) => <li key={s}>{s}</li>)}</ul></Card>
          </div>
        </section>
      </>}

      <section style={rv(4)} className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        <Card className="flex flex-col gap-3.5 border-blue/40 p-6"><Label className="text-blue">4 · Recommended next action</Label>
          <div className="h text-xl font-semibold">{a.next_actions[0] ?? recEx?.title ?? "Keep practising"}</div>
          {rec && <p className="text-[13.5px] leading-relaxed text-fg2">{rec.explanation}</p>}
          <div className="flex flex-wrap gap-2">{recEx && <LinkButton href={`/practice/${recEx.id}`}>Start exercise</LinkButton>}{sub.data && <LinkButton href={`/practice/${sub.data.exercise_id}`} variant="outline">Revise &amp; resubmit</LinkButton>}<LinkButton href="/dashboard" variant="ghost">Dashboard</LinkButton></div></Card>
        <Card className="flex flex-col gap-2.5 p-6"><Label>Methodology</Label><p className="text-[13px] leading-relaxed text-fg2">Scored against <b className="font-semibold text-fg">rubric v{a.rubric_version}</b> by <span className="font-mono">{a.model || "—"}</span> (prompt {a.prompt_version || "—"}). {a.model.startsWith("mock") ? "This environment uses a keyword heuristic, not a calibrated model. " : ""}Scores are provisional evidence, not a verdict: this evaluator has not been calibrated against expert-reviewed data, and level confirmation requires a human reviewer.</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted"><StateBadge state={a.status} /><span className="font-mono">{a.id}</span></div></Card>
      </section>
    </div>
  );
}
