"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, ErrorState, Loading, StateBadge } from "@/components/ui";
import { INTL_TAG } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { api, type Assessment, type Exercise, type Submission } from "@/lib/api";
import { useSkills } from "@/lib/hooks";

const MAX = 20000;

export default function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ex = useQuery({ queryKey: ["exercise", id], queryFn: () => api<Exercise>(`/exercises/${id}`) });
  const subs = useQuery({ queryKey: ["subs", id], queryFn: () => api<Submission[]>(`/submissions?exercise_id=${id}`), gcTime: 0 });
  if (ex.isLoading || subs.isLoading) return <Loading rows={4} />;
  if (ex.isError) return <ErrorState error={ex.error} retry={() => ex.refetch()} />;
  return <Lab ex={ex.data!} initial={subs.data?.[0] ?? null} />;
}

function Lab({ ex: exercise, initial }: { ex: Exercise; initial: Submission | null }) {
  const { t, locale, fmtNum } = useI18n(), router = useRouter(), qc = useQueryClient(), skillsQ = useSkills();
  const ex = { data: exercise };
  // Checklist state is keyed by item INDEX (text is localised and may change); legacy text-keyed drafts are migrated.
  const [content, setContent] = useState(initial?.content ?? ""), [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const old = initial?.checklist_state ?? {}, out: Record<string, boolean> = {};
    exercise.checklist.forEach((c, i) => { const v = old[String(i)] ?? old[c]; if (v) out[String(i)] = true; });
    return out;
  });
  const [sub, setSub] = useState<Submission | null>(initial), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [evaluating, setEvaluating] = useState(false), [saved, setSaved] = useState<Date | null>(null);
  // Guard against accidental loss of unsaved work.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = useCallback(async (submit = false) => {
    if (!ex.data) return null;
    setSaving(true);
    try {
      const s = await api<Submission>("/submissions", { method: "POST", json: { exercise_id: ex.data.id, content, checklist_state: checks, submit } });
      setSub(s); setDirty(false); setSaved(new Date()); return s;
    } catch (e) { toast.error(e instanceof Error ? t("Save failed: {message}", { message: e.message }) : t("Save failed")); return null; }
    finally { setSaving(false); }
  }, [ex.data, content, checks, t]);

  // Autosave drafts 2s after the last edit.
  useEffect(() => {
    if (!dirty || evaluating) return;
    const t = setTimeout(() => { save(false); }, 2000);
    return () => clearTimeout(t);
  }, [dirty, content, checks, evaluating, save]);

  const submit = async () => {
    if (content.trim().length === 0) return toast.error(t("Write your response first"));
    if (!confirm(t("Submit for evaluation? You can start a revision afterwards."))) return;
    const s = await save(true); if (!s) return;
    setEvaluating(true);
    try {
      let a = await api<Assessment>("/assessments", { method: "POST", json: { submission_id: s.id } });
      for (let i = 0; i < 60 && (a.status === "queued" || a.status === "running"); i++) { await new Promise((r) => setTimeout(r, 1500)); a = await api<Assessment>(`/assessments/${a.id}`); }
      qc.invalidateQueries();
      toast.success(t("Evaluation finished")); router.push(`/assessments/${a.id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : t("Evaluation failed")); setEvaluating(false); }
  };

  const e = ex.data;
  const locked = evaluating || sub?.status === "evaluating";
  const done = e.checklist.filter((_, i) => checks[String(i)]).length;
  const skillName = (slug: string) => skillsQ.data?.find((x) => x.slug === slug)?.name ?? slug;
  return (
    <div className="-m-8 flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-5 py-2.5">
        <Link href="/practice" aria-label={t("Exit to practice list")} className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-fg2 hover:bg-elevated"><ChevronLeft className="h-[18px] w-[18px] rtl:rotate-180" /></Link>
        <div className="min-w-0"><div className="flex items-center gap-2"><span className="lab text-cyan">{t("Practice Lab")}</span><span className="chip s-rev" style={{ height: 20, fontSize: 11 }}>{e.is_baseline ? t("Baseline") : t("Assessed exercise")}</span>{sub && <StateBadge state={sub.status} />}</div>
          <h1 className="h truncate text-[17px] font-semibold">{e.title}</h1></div>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted" aria-live="polite">{saving ? t("Saving…") : dirty ? t("Unsaved changes") : saved ? t("Saved {time}", { time: saved.toLocaleTimeString(INTL_TAG[locale]) }) : ""}</span>
          <Button variant="outline" className="min-h-9" disabled={!dirty || saving || locked} onClick={() => save(false).then((s) => s && toast.success(t("Draft saved")))}><Save className="h-4 w-4" />{t("Save draft")}</Button>
          <Button className="min-h-9" disabled={locked || saving} onClick={submit}>{locked ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Evaluating…")}</> : <><Send className="h-4 w-4" />{sub?.status === "evaluated" ? t("Submit revision") : t("Submit for assessment")}</>}</Button>
        </div>
      </header>
      <div className="flex flex-1 flex-wrap">
        <aside aria-label={t("Brief")} className="flex max-w-[330px] flex-1 basis-[300px] flex-col gap-5 overflow-auto border-e border-line bg-surface p-5">
          <section className="flex flex-col gap-2"><div className="lab">{t("Scenario")}</div><p className="text-sm leading-relaxed">{e.scenario}</p></section>
          <section className="flex flex-col gap-2"><div className="lab">{t("Objectives")}</div><ol className="m-0 list-decimal space-y-1 ps-[18px] text-[13px] leading-[1.7] text-fg2">{e.objectives.map((o) => <li key={o}>{o}</li>)}</ol></section>
          <section className="flex flex-col gap-2"><div className="lab">{t("Resources")}</div>{e.resources.map((r, i) => <div key={i} className="flex justify-between rounded-[10px] border border-line px-3 py-2.5 text-[13px]"><span>{r.title}</span>{r.note && <span className="font-mono text-[11.5px] text-muted">{r.note}</span>}</div>)}</section>
          <section className="flex flex-col gap-2"><div className="lab">{t("Assessment criteria · rubric v{version}", { version: e.rubric_version })}</div>{e.rubric.map((r) => <div key={r.key} title={r.description} className="flex justify-between border-b border-line py-1.5 text-[13px]"><span className="text-fg2">{r.name}</span><span className="font-mono text-xs">0–{r.max_score}</span></div>)}</section>
        </aside>
        <section aria-label={t("Editor")} className="flex min-w-0 flex-[999_1_520px] flex-col">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2 text-xs text-muted"><span>{t("Outline:")}</span>{e.objectives.map((o) => <span key={o} className="chip" style={{ height: 22, fontSize: 11.5 }}>{o.split(" ").slice(0, 3).join(" ")}</span>)}<span className="ms-auto font-mono">{t("{words} words · {chars} / {max}", { words: fmtNum(content.trim() ? content.trim().split(/\s+/).length : 0), chars: fmtNum(content.length), max: fmtNum(MAX) })}</span></div>
          <label htmlFor="editor" className="sr-only">{t("Your response")}</label>
          <textarea id="editor" dir="auto" value={content} disabled={locked} onChange={(ev) => { setContent(ev.target.value.slice(0, MAX)); setDirty(true); }} spellCheck={false} placeholder={t("Write your structured response here. Treat it as you would a real work deliverable.")} className="min-h-[420px] w-full flex-1 resize-none border-0 bg-bg p-6 font-mono text-[13.5px] leading-[1.75] text-fg outline-none focus-visible:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--blue)_50%,transparent)]" />
          {sub?.status === "evaluated" && <p className="border-t border-line px-5 py-2 text-xs text-fg2">{t("This content was already evaluated. Editing and submitting creates a new revision.")}</p>}
        </section>
        <aside aria-label={t("Progress and help")} className="flex max-w-[300px] flex-1 basis-[260px] flex-col gap-5 border-s border-line bg-surface p-5">
          <section className="flex flex-col gap-2"><div className="lab">{t("Target skills")}</div><div className="flex flex-wrap gap-1.5">{e.skills.map((s) => <span key={s} className="chip s-rev">{skillName(s)}</span>)}</div></section>
          <section className="flex flex-col gap-2"><div className="lab">{t("Checklist ({done}/{total})", { done, total: e.checklist.length })}</div><div className="bar"><div className="h-full bg-cyan" style={{ width: `${(done / Math.max(1, e.checklist.length)) * 100}%` }} /></div>
            <ul className="space-y-1">{e.checklist.map((c, i) => <li key={i}><label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 text-[13px] leading-snug hover:bg-elevated"><input type="checkbox" className="mt-0.5" checked={!!checks[String(i)]} disabled={locked} onChange={(ev) => { setChecks({ ...checks, [String(i)]: ev.target.checked }); setDirty(true); }} />{c}</label></li>)}</ul></section>
          <section className="flex flex-col gap-2"><div className="lab">{t("Contextual help")}</div><p className="text-[13px] leading-relaxed text-fg2">{t("Be concrete: quote numbers, name risks, state decisions. Evidence in your text is what gets assessed. The result is provisional and may be sent to a human reviewer.")}</p><span className="chip s-imp self-start">{t("No AI coach in this release")}</span></section>
        </aside>
      </div>
    </div>
  );
}
