"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { api, ROLES, type User } from "@/lib/api";
import { useSkills } from "@/lib/hooks";
import clsx from "clsx";

export default function Onboarding() {
  const router = useRouter(), qc = useQueryClient(), skills = useSkills();
  const [step, setStep] = useState(0), [role, setRole] = useState(""), [objs, setObjs] = useState<string[]>([]), [share, setShare] = useState(false), [busy, setBusy] = useState(false);
  const domains = Array.from(new Map((skills.data ?? []).map((s) => [s.domain_slug, s.domain])).entries());
  const finish = async () => {
    setBusy(true);
    try { const u = await api<User>("/users/me/onboarding", { method: "POST", json: { professional_role: role, objectives: objs, share_with_org: share } }); qc.setQueryData(["me"], u); qc.invalidateQueries({ queryKey: ["progress"] }); toast.success("Profile ready"); router.push("/dashboard"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 font-mono text-xs text-muted">Step {step + 1} of 3</p>
      <div className="mb-6 h-1 rounded-full bg-line"><div className="h-1 rounded-full bg-blue transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      {step === 0 && <Card><h1 className="font-display text-xl font-semibold">What is your professional role?</h1><p className="mb-4 text-sm text-fg2">We use it to choose your baseline exercise.</p>
        <div role="radiogroup" aria-label="Professional role" className="grid gap-2">{ROLES.map((r) => <button key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={clsx("rounded-lg border p-3 text-left text-sm", role === r ? "border-blue bg-elevated" : "border-line hover:bg-elevated")}>{r}</button>)}</div>
        <Button className="mt-5" disabled={!role} onClick={() => setStep(1)}>Continue</Button></Card>}
      {step === 1 && <Card><h1 className="font-display text-xl font-semibold">What do you want to develop?</h1><p className="mb-4 text-sm text-fg2">Pick the AI domains that matter most. These steer your recommendations.</p>
        <div className="flex flex-wrap gap-2">{domains.map(([slug, name]) => { const on = objs.includes(slug); return <button key={slug} aria-pressed={on} onClick={() => setObjs(on ? objs.filter((x) => x !== slug) : [...objs, slug])} className={clsx("rounded-full border px-3 py-1.5 text-sm", on ? "border-blue bg-elevated text-fg" : "border-line text-fg2 hover:bg-elevated")}>{name}</button>; })}</div>
        <div className="mt-5 flex gap-2"><Button variant="outline" onClick={() => setStep(0)}>Back</Button><Button onClick={() => setStep(2)}>Continue</Button></div></Card>}
      {step === 2 && <Card><h1 className="font-display text-xl font-semibold">Privacy</h1>
        <p className="mt-2 text-sm text-fg2">Your submissions and results are private to you. If you belong to an organization, you can choose to contribute to anonymous team-level aggregates. Individual results are never shown to administrators. You can change this and export or delete your data in Settings.</p>
        <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={share} onChange={(e) => setShare(e.target.checked)} />Include my skill levels in anonymous organization aggregates</label>
        <div className="mt-5 flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={finish} disabled={busy}>{busy ? "Saving…" : "Finish"}</Button></div></Card>}
    </div>
  );
}
