"use client";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, type User } from "@/lib/api";
import { useRoles, useSkills } from "@/lib/hooks";

const Tick = ({ on, round }: { on: boolean; round?: boolean }) => (
  <span aria-hidden="true" className={clsx("inline-flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px]", round ? "rounded-full" : "rounded-md", on ? "border-blue bg-blue text-on" : "border-line2")}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
);

export default function Onboarding() {
  const t = useT(), router = useRouter(), qc = useQueryClient(), skills = useSkills(), roles = useRoles();
  const [step, setStep] = useState(0), [role, setRole] = useState(""), [objs, setObjs] = useState<string[]>([]), [share, setShare] = useState(false), [busy, setBusy] = useState(false);
  const domains = Array.from(new Map((skills.data ?? []).map((s) => [s.domain_slug, s.domain])).entries());
  const steps = [t("Role"), t("Objectives"), t("Privacy")];
  const finish = async () => {
    setBusy(true);
    try { const u = await api<User>("/users/me/onboarding", { method: "POST", json: { professional_role: role, objectives: objs, share_with_org: share } }); qc.setQueryData(["me"], u); qc.invalidateQueries({ queryKey: ["progress"] }); toast.success(t("Profile ready")); router.push("/dashboard"); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("Failed")); setBusy(false); }
  };
  const heading = [t("What is your professional role?"), t("What do you want to develop?"), t("Privacy")][step];
  const sub = [t("We use it to choose your baseline exercise."), t("Pick the AI domains that matter most. These steer your recommendations."), ""][step];
  return (
    <div className="mx-auto max-w-4xl">
      <ol aria-label={t("Onboarding progress")} className="mb-8 flex flex-wrap items-center gap-2">
        {steps.map((n, i) => (
          <li key={n} aria-current={i === step ? "step" : undefined} className={clsx("flex items-center gap-2 text-[12.5px]", i === step ? "text-fg" : i < step ? "text-fg2" : "text-muted")}>
            <span className={clsx("inline-flex h-[22px] w-[22px] items-center justify-center rounded-full font-mono text-[11px]", i < step ? "bg-green text-on" : i === step ? "bg-blue text-on" : "border border-line2")}>{i < step ? "✓" : i + 1}</span>
            <span>{n}</span>
            {i < steps.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-line2" />}
          </li>))}
      </ol>
      <div className="mb-6">
        <div className="lab">{t("Step {n} of {total}", { n: step + 1, total: 3 })}</div>
        <h1 className="h mt-2 text-[32px] font-semibold leading-tight">{heading}</h1>
        {sub && <p className="mt-2 max-w-xl text-[15px] text-fg2">{sub}</p>}
      </div>
      {step === 0 && <>
        <div role="radiogroup" aria-label={t("Professional role")} className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
          {(roles.data ?? []).map((r) => { const on = role === r.key; return (
            <button key={r.key} type="button" role="radio" aria-checked={on} onClick={() => setRole(r.key)} className={clsx("flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-start text-[14.5px] font-medium", on ? "border-blue bg-blue/10 shadow-[inset_0_0_0_1px_var(--blue)]" : "border-line bg-surface hover:border-line2")}>
              <Tick on={on} round />{r.label}</button>); })}
        </div>
        <Button className="mt-6" disabled={!role} onClick={() => setStep(1)}>{t("Continue")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" /></Button></>}
      {step === 1 && <>
        <div role="group" aria-label={t("AI domains")} className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">{domains.map(([slug, name]) => { const on = objs.includes(slug); return (
          <button key={slug} type="button" aria-pressed={on} onClick={() => setObjs(on ? objs.filter((x) => x !== slug) : [...objs, slug])} className={clsx("flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-start text-[14.5px] font-medium", on ? "border-blue bg-blue/10 shadow-[inset_0_0_0_1px_var(--blue)]" : "border-line bg-surface hover:border-line2")}><Tick on={on} />{name}</button>); })}</div>
        <div className="mt-6 flex gap-2"><Button variant="ghost" onClick={() => setStep(0)}>{t("Back")}</Button><Button onClick={() => setStep(2)}>{t("Continue")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" /></Button></div></>}
      {step === 2 && <Card className="max-w-2xl p-6">
        <p className="text-sm leading-relaxed text-fg2">{t("Your submissions and results are private to you. If you belong to an organization, you can choose to contribute to anonymous team-level aggregates. Individual results are never shown to administrators. You can change this and export or delete your data in Settings.")}</p>
        <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={share} onChange={(e) => setShare(e.target.checked)} />{t("Include my skill levels in anonymous organization aggregates")}</label>
        <div className="mt-6 flex gap-2"><Button variant="ghost" onClick={() => setStep(1)}>{t("Back")}</Button><Button onClick={finish} disabled={busy}>{busy ? t("Saving…") : t("Finish")}</Button></div></Card>}
    </div>
  );
}
