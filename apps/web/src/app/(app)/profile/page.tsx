"use client";
import Link from "next/link";
import { Card, EmptyState, ErrorState, Label, LevelBar, Loading, StateBadge } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { levelName, type Skill } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useAssessments, useProgress, useRoleLabel } from "@/lib/hooks";

export default function Passport() {
  const { t, fmtDate } = useI18n(), roleLabel = useRoleLabel();
  const me = useMe().data, p = useProgress(), hist = useAssessments();
  if (p.isLoading) return <Loading />;
  if (p.isError) return <ErrorState error={p.error} retry={() => p.refetch()} />;
  const by = new Map<string, Skill[]>();
  p.data!.skills.filter((s) => s.state !== "not_assessed").forEach((s) => by.set(s.domain, [...(by.get(s.domain) ?? []), s]));
  const ver = p.data!.summary.verified, prov = p.data!.summary.provisional;
  const name = me?.full_name || me?.email || "", initials = name.split(/[\s@]+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");
  // Progress over time: levels of past assessments (real history only; these are single-assessment levels, not verified levels).
  const points = (hist.data ?? []).filter((a) => a.level).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)).slice(-12);
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h inline-flex h-16 w-16 items-center justify-center rounded-full border border-line2 bg-elevated text-xl font-semibold">{initials}</span>
          <div><div className="lab">{t("Skills Passport")}</div><h1 className="h mt-1.5 text-[34px] font-semibold leading-tight">{name}</h1>
            <p className="mt-1 text-[15px] text-fg2">{t("{role} · {verified} verified · {provisional} provisional", { role: me?.professional_role ? roleLabel(me.professional_role) : t("Professional"), verified: ver, provisional: prov })}</p></div></div>
        <span className="chip s-ins">{t("Private — visible only to you")}</span></section>
      <Card className="border-amber/40 text-sm text-fg2"><b className="text-fg">{t("Read this as evidence, not a certificate.")}</b> {t("Amber entries come from automated assessments that no human has reviewed. Only green entries were confirmed by a trainer.")}</Card>
      {by.size === 0 ? <EmptyState title={t("No demonstrated skills yet")} hint={t("Complete an exercise to start your passport.")} action={<Link href="/practice" className="text-blue underline">{t("Open the practice lab")}</Link>} /> :
        <div className="grid gap-4 md:grid-cols-2">{[...by.entries()].map(([d, ss]) => <Card key={d}><Label>{t("Domain")}</Label><h2 className="h mt-1 text-lg font-semibold">{d}</h2><ul className="m-0 mt-3 list-none divide-y divide-line p-0">{ss.map((s) => <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><Link href={`/skills/${s.id}`} className="font-medium hover:underline">{s.name}</Link><span className="ms-2 text-xs text-muted">{levelName(t, s.level)}</span></span><span className="flex items-center gap-3"><LevelBar level={s.level} /><StateBadge state={s.state} /></span></li>)}</ul></Card>)}</div>}
      {points.length >= 2 && <Card>
        <Label>{t("Progress over time")}</Label>
        <p className="mt-1 text-[13px] text-fg2">{t("Level reached in each of your recent assessments. These are individual results, not verified levels.")}</p>
        <ul dir="ltr" className="m-0 mt-4 flex h-32 list-none items-end gap-2 p-0">{points.map((a) => (
          <li key={a.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <div title={`${fmtDate(a.created_at)} · ${levelName(t, a.level!)}`} className={a.provisional ? "w-full max-w-9 rounded-t-md bg-blue/50" : "w-full max-w-9 rounded-t-md bg-green"} style={{ height: `${(a.level! / 5) * 100}%` }} />
            <span className="font-mono text-[10.5px] text-muted">L{a.level}</span></li>))}</ul>
        <div dir="ltr" className="mt-1 flex justify-between font-mono text-[11px] text-muted"><span>{fmtDate(points[0].created_at)}</span><span>{fmtDate(points[points.length - 1].created_at)}</span></div>
      </Card>}
      <p className="text-xs text-muted">{p.data!.disclaimer}</p>
    </div>
  );
}
