"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Label, Loading, PageHeader, Textarea } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, LEVEL_NAMES, type Assessment } from "@/lib/api";

type Item = { assessment: Assessment; exercise_title: string; submission_content: string };

function Review({ item }: { item: Item }) {
  const t = useT(), qc = useQueryClient(), a = item.assessment;
  const [level, setLevel] = useState(a.level ?? 2), [why, setWhy] = useState("");
  const m = useMutation({ mutationFn: () => api(`/trainer/reviews/${a.id}`, { method: "POST", json: { level, justification: why } }), onSuccess: () => { toast.success(t("Review recorded")); qc.invalidateQueries({ queryKey: ["t-rv-list"] }); qc.invalidateQueries({ queryKey: ["t-rv"] }); }, onError: (e) => toast.error(e.message) });
  const flagged = !!a.error;
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-display text-lg">{item.exercise_title}</h2><p className="mt-1 text-xs text-muted">{t("Model {model} · rubric v{n}", { model: a.model, n: a.rubric_version })}</p></div>
        <div className="flex flex-wrap gap-2"><Badge tone="amber">{t("Provisional (AI) · L{n}", { n: a.level ?? 0 })}{a.overall_score != null ? ` · ${a.overall_score}%` : ""}</Badge>{flagged ? <Badge tone="red">{t("Flag: {flag}", { flag: a.error! })}</Badge> : <Badge>{t("No flags")}</Badge>}</div>
      </div>
      <section><Label>{t("Submission")}</Label><pre dir="auto" className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-[10px] border border-line bg-bg p-3 font-mono text-xs">{item.submission_content}</pre></section>
      <section><Label>{t("AI scores")}</Label>
        <div className="mt-2 overflow-x-auto rounded-[10px] border border-line"><table className="w-full text-sm"><caption className="sr-only">{t("AI scores per dimension")}</caption>
          <thead className="border-b border-line text-muted"><tr><th scope="col" className="p-2.5 text-start">{t("Dimension")}</th><th scope="col" className="p-2.5 text-start">{t("Score")}</th><th scope="col" className="p-2.5 text-start">{t("Rationale")}</th></tr></thead>
          <tbody>{a.scores.map((s) => <tr key={s.dimension} className="border-b border-line last:border-0"><td className="p-2.5 font-medium">{s.dimension}</td><td className="p-2.5">{s.score}</td><td className="p-2.5 text-fg2">{s.rationale}</td></tr>)}</tbody></table></div></section>
      <section className="rounded-[10px] border border-line bg-bg p-4">
        <p className="text-sm text-fg2">{t("Your adjusted level and justification become the verified result for this skill. Until you confirm, the AI result stays provisional.")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
          <div><label htmlFor={`lv-${a.id}`} className="text-sm font-medium text-fg2">{t("Adjusted level")}</label><Input id={`lv-${a.id}`} type="number" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} /><p className="mt-1 text-xs text-muted">{t(LEVEL_NAMES[level] ?? "Not Assessed")}</p></div>
          <div><label htmlFor={`jw-${a.id}`} className="text-sm font-medium text-fg2">{t("Justification (required, min. 10 chars)")}</label><Textarea id={`jw-${a.id}`} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} /></div></div>
        <Button className="mt-3" disabled={why.trim().length < 10 || m.isPending} onClick={() => m.mutate()}>{t("Confirm review")}</Button>
      </section>
    </Card>
  );
}

export default function Reviews() {
  const t = useT();
  const q = useQuery({ queryKey: ["t-rv-list"], queryFn: () => api<Item[]>("/trainer/reviews") });
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <>
      <PageHeader title={t("Review queue")} sub={t("Assessments flagged for human review. Your decision and justification are audit-logged.")} />
      {!q.data!.length ? <EmptyState title={t("Queue is empty")} /> : <div className="space-y-4">{q.data!.map((i) => <Review key={i.assessment.id} item={i} />)}</div>}
    </>
  );
}
