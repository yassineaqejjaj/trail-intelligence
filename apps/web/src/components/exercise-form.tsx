"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, Field, Input, Textarea } from "./ui";
import { api, ROLES, type Exercise } from "@/lib/api";
import { useSkills } from "@/lib/hooks";

type Dim = { key: string; name: string; description: string; max_score: number; weight: number };

export function ExerciseForm({ initial }: { initial?: Exercise }) {
  const router = useRouter(), qc = useQueryClient(), skills = useSkills();
  const [title, setTitle] = useState(initial?.title ?? ""), [scenario, setScenario] = useState(initial?.scenario ?? "");
  const [role, setRole] = useState(initial?.professional_role ?? ROLES[0]), [level, setLevel] = useState(initial?.expected_level ?? 2);
  const [objectives, setObjectives] = useState((initial?.objectives ?? []).join("\n")), [status, setStatus] = useState(initial?.status ?? "draft");
  const [sel, setSel] = useState<string[]>(initial?.skills ?? []);
  const [dims, setDims] = useState<Dim[]>((initial?.rubric as Dim[]) ?? [{ key: "quality", name: "Quality", description: "Overall quality and specificity", max_score: 5, weight: 1 }]);
  const [busy, setBusy] = useState(false);
  const upd = (i: number, p: Partial<Dim>) => setDims(dims.map((d, j) => (j === i ? { ...d, ...p } : d)));
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const objs = objectives.split("\n").map((s) => s.trim()).filter(Boolean);
    const body = { title, scenario, professional_role: role, expected_level: level, objectives: objs, checklist: objs, skill_slugs: sel, rubric: dims, status, resources: [] };
    try { if (initial) await api(`/trainer/exercises/${initial.id}`, { method: "PUT", json: body }); else await api("/trainer/exercises", { method: "POST", json: body }); qc.invalidateQueries(); toast.success("Exercise saved"); router.push("/trainer/exercises"); }
    catch (x) { toast.error(x instanceof Error ? x.message : "Failed"); setBusy(false); }
  };
  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <Card className="space-y-3">
        <Field id="t" label="Title"><Input id="t" required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field id="s" label="Scenario"><Textarea id="s" required minLength={10} rows={5} value={scenario} onChange={(e) => setScenario(e.target.value)} /></Field>
        <Field id="o" label="Objectives (one per line; also used as checklist)"><Textarea id="o" rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="r" label="Professional role"><select id="r" value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm">{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
          <Field id="l" label="Expected level (1–5)"><Input id="l" type="number" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} /></Field>
          <Field id="st" label="Publication"><select id="st" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
        </div>
      </Card>
      <Card><h2 className="font-display text-lg">Target skills</h2><div className="mt-2 flex flex-wrap gap-2">{(skills.data ?? []).map((s) => <label key={s.slug} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"><input type="checkbox" checked={sel.includes(s.slug)} onChange={(e) => setSel(e.target.checked ? [...sel, s.slug] : sel.filter((x) => x !== s.slug))} />{s.name}</label>)}</div></Card>
      <Card><div className="flex items-center justify-between"><h2 className="font-display text-lg">Rubric</h2><Button type="button" variant="outline" onClick={() => setDims([...dims, { key: `dim${dims.length + 1}`, name: "", description: "", max_score: 5, weight: 1 }])}>Add dimension</Button></div>
        <p className="mt-1 text-xs text-muted">Changing the rubric creates a new version; past assessments keep the version they used.</p>
        <div className="mt-3 space-y-3">{dims.map((d, i) => <div key={i} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-[1fr_2fr_80px_auto]">
          <Input aria-label="Dimension name" placeholder="Name" required value={d.name} onChange={(e) => upd(i, { name: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || d.key })} />
          <Input aria-label="Dimension description" placeholder="What good looks like" required value={d.description} onChange={(e) => upd(i, { description: e.target.value })} />
          <Input aria-label="Max score" type="number" min={1} max={10} value={d.max_score} onChange={(e) => upd(i, { max_score: Number(e.target.value) })} />
          <Button type="button" variant="ghost" disabled={dims.length === 1} onClick={() => setDims(dims.filter((_, j) => j !== i))}>Remove</Button></div>)}</div></Card>
      <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Create exercise"}</Button>
    </form>
  );
}
