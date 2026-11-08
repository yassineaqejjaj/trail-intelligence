"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, EmptyState, ErrorState, Input, Loading, PageHeader, Textarea } from "@/components/ui";
import { api, LEVEL_NAMES, type Assessment } from "@/lib/api";

type Item = { assessment: Assessment; exercise_title: string; submission_content: string };

function Review({ item }: { item: Item }) {
  const qc = useQueryClient(), a = item.assessment;
  const [level, setLevel] = useState(a.level ?? 2), [why, setWhy] = useState("");
  const m = useMutation({ mutationFn: () => api(`/trainer/reviews/${a.id}`, { method: "POST", json: { level, justification: why } }), onSuccess: () => { toast.success("Review recorded"); qc.invalidateQueries({ queryKey: ["t-rv-list"] }); }, onError: (e) => toast.error(e.message) });
  return (
    <Card className="space-y-3">
      <div><h2 className="font-display text-lg">{item.exercise_title}</h2><p className="text-xs text-muted">AI level L{a.level} ({a.overall_score}%) · flags: {a.error ?? "none"} · model {a.model}</p></div>
      <details open><summary className="cursor-pointer text-sm font-medium">Submission</summary><pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-bg p-3 font-mono text-xs">{item.submission_content}</pre></details>
      <details><summary className="cursor-pointer text-sm font-medium">AI scores</summary><ul className="mt-2 text-sm text-fg2">{a.scores.map((s) => <li key={s.dimension}>{s.dimension}: {s.score} — {s.rationale}</li>)}</ul></details>
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <div><label htmlFor={`lv-${a.id}`} className="text-sm text-fg2">Adjusted level</label><Input id={`lv-${a.id}`} type="number" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} /><p className="mt-1 text-xs text-muted">{LEVEL_NAMES[level]}</p></div>
        <div><label htmlFor={`jw-${a.id}`} className="text-sm text-fg2">Justification (required, min. 10 chars)</label><Textarea id={`jw-${a.id}`} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} /></div></div>
      <Button disabled={why.trim().length < 10 || m.isPending} onClick={() => m.mutate()}>Confirm review</Button>
    </Card>
  );
}

export default function Reviews() {
  const q = useQuery({ queryKey: ["t-rv-list"], queryFn: () => api<Item[]>("/trainer/reviews") });
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <>
      <PageHeader title="Review queue" sub="Assessments flagged for human review. Your decision and justification are audit-logged." />
      {!q.data!.length ? <EmptyState title="Queue is empty" /> : <div className="space-y-4">{q.data!.map((i) => <Review key={i.assessment.id} item={i} />)}</div>}
    </>
  );
}
