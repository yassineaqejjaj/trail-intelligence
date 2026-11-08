"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, Field, Input, Label, Textarea } from "./ui";
import { useT } from "@/i18n/provider";
import { api, type Exercise } from "@/lib/api";
import { useRoles, useSkills } from "@/lib/hooks";

type Dim = { key: string; name: string; description: string; max_score: number; weight: number };
const SELECT = "w-full rounded-[10px] border border-line bg-bg px-3 py-2 text-sm text-fg hover:border-line2";

export function ExerciseForm({ initial }: { initial?: Exercise }) {
  const t = useT(), router = useRouter(), qc = useQueryClient(), skills = useSkills(), roles = useRoles().data ?? [];
  const [title, setTitle] = useState(initial?.title ?? ""), [scenario, setScenario] = useState(initial?.scenario ?? "");
  const [roleSel, setRole] = useState(initial?.professional_role ?? ""), [level, setLevel] = useState(initial?.expected_level ?? 2);
  const role = roleSel || roles[0]?.key || "";
  const [objectives, setObjectives] = useState((initial?.objectives ?? []).join("\n")), [status, setStatus] = useState(initial?.status ?? "draft");
  const [sel, setSel] = useState<string[]>(initial?.skills ?? []);
  const [dims, setDims] = useState<Dim[]>((initial?.rubric as Dim[]) ?? [{ key: "quality", name: t("Quality"), description: t("Overall quality and specificity"), max_score: 5, weight: 1 }]);
  const [busy, setBusy] = useState(false);
  const upd = (i: number, p: Partial<Dim>) => setDims(dims.map((d, j) => (j === i ? { ...d, ...p } : d)));
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const objs = objectives.split("\n").map((s) => s.trim()).filter(Boolean);
    const body = { title, scenario, professional_role: role, expected_level: level, objectives: objs, checklist: objs, skill_slugs: sel, rubric: dims, status, resources: [] };
    try { if (initial) await api(`/trainer/exercises/${initial.id}`, { method: "PUT", json: body }); else await api("/trainer/exercises", { method: "POST", json: body }); qc.invalidateQueries(); toast.success(t("Exercise saved")); router.push("/trainer/exercises"); }
    catch (x) { toast.error(x instanceof Error ? x.message : t("Failed")); setBusy(false); }
  };
  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <Card className="space-y-3">
        <Label>{t("Exercise details")}</Label>
        <p className="text-xs text-muted">{t("Content is shown to learners exactly as written, in a single language.")}</p>
        <Field id="t" label={t("Title")}><Input id="t" required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field id="s" label={t("Scenario")}><Textarea id="s" required minLength={10} rows={5} value={scenario} onChange={(e) => setScenario(e.target.value)} /></Field>
        <Field id="o" label={t("Objectives (one per line; also used as checklist)")}><Textarea id="o" rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="r" label={t("Profession")}><select id="r" value={role} onChange={(e) => setRole(e.target.value)} className={SELECT}>{roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select></Field>
          <Field id="l" label={t("Expected level (1–5)")}><Input id="l" type="number" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} /></Field>
          <Field id="st" label={t("Publication")}><select id="st" value={status} onChange={(e) => setStatus(e.target.value)} className={SELECT}><option value="draft">{t("Draft")}</option><option value="published">{t("Published")}</option><option value="archived">{t("Archived")}</option></select></Field>
        </div>
      </Card>
      <Card><Label>{t("Target skills")}</Label><div className="mt-2 flex flex-wrap gap-2">{(skills.data ?? []).map((s) => <label key={s.slug} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"><input type="checkbox" checked={sel.includes(s.slug)} onChange={(e) => setSel(e.target.checked ? [...sel, s.slug] : sel.filter((x) => x !== s.slug))} />{s.name}</label>)}</div></Card>
      <Card><div className="flex items-center justify-between gap-3"><Label>{t("Rubric")}</Label><Button type="button" variant="outline" onClick={() => setDims([...dims, { key: `dim${dims.length + 1}`, name: "", description: "", max_score: 5, weight: 1 }])}>{t("Add dimension")}</Button></div>
        <p className="mt-1 text-xs text-muted">{t("Changing the rubric creates a new version; past assessments keep the version they used.")}</p>
        <div className="mt-3 space-y-3">{dims.map((d, i) => <div key={i} className="grid gap-2 rounded-[10px] border border-line p-3 sm:grid-cols-[1fr_2fr_80px_auto]">
          <Input aria-label={t("Dimension name")} placeholder={t("Name")} required value={d.name} onChange={(e) => upd(i, { name: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || d.key })} />
          <Input aria-label={t("Dimension description")} placeholder={t("What good looks like")} required value={d.description} onChange={(e) => upd(i, { description: e.target.value })} />
          <Input aria-label={t("Max score")} type="number" min={1} max={10} value={d.max_score} onChange={(e) => upd(i, { max_score: Number(e.target.value) })} />
          <Button type="button" variant="ghost" disabled={dims.length === 1} onClick={() => setDims(dims.filter((_, j) => j !== i))}>{t("Remove")}</Button></div>)}</div></Card>
      <Button type="submit" disabled={busy}>{busy ? t("Saving…") : initial ? t("Save changes") : t("Create exercise")}</Button>
    </form>
  );
}
