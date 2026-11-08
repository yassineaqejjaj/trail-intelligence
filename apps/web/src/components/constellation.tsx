"use client";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Skill } from "@/lib/api";
import { useT } from "@/i18n/provider";
import { StateBadge, stateLabel } from "./ui";

// Fixed layout on a 1000×560 canvas, one node per AI domain.
const POS: Record<string, [number, number]> = {
  "ai-foundations": [80, 290], "prompt-engineering": [260, 170], "ai-assisted-development": [450, 60], "context-engineering": [450, 200],
  rag: [640, 150], "agentic-ai": [850, 150], "ai-evaluation": [640, 300], "ai-product-discovery": [260, 340],
  "ai-product-delivery": [450, 380], "responsible-ai": [260, 480], "ai-economics": [450, 500],
};

export type DomainNode = { slug: string; name: string; level: number; state: Skill["state"]; skills: Skill[] };

export function toDomains(skills: Skill[]): DomainNode[] {
  const m = new Map<string, DomainNode>();
  for (const s of skills) {
    const d = m.get(s.domain_slug) ?? { slug: s.domain_slug, name: s.domain, level: 0, state: "not_assessed" as Skill["state"], skills: [] };
    d.skills.push(s);
    if (s.level > d.level) d.level = s.level;
    if (s.state === "verified") d.state = "verified";
    else if (s.state === "provisional" && d.state !== "verified") d.state = "provisional";
    m.set(s.domain_slug, d);
  }
  return [...m.values()];
}

export function Constellation({ skills, selected, onSelect, height = 440 }: { skills: Skill[]; selected?: string | null; onSelect?: (slug: string | null) => void; height?: number }) {
  const t = useT();
  const domains = useMemo(() => toDomains(skills), [skills]);
  const edges = useMemo(() => {
    const dom = new Map(skills.map((s) => [s.slug, s.domain_slug]));
    const set = new Set<string>();
    skills.forEach((s) => s.prerequisites.forEach((p) => { const a = dom.get(p)!, b = s.domain_slug; if (a !== b) set.add(`${a}>${b}`); }));
    return [...set].map((k) => k.split(">") as [string, string]);
  }, [skills]);
  const [hover, setHover] = useState<string | null>(null);
  const focus = hover ?? selected ?? null;
  const related = new Set<string>(focus ? [focus] : []);
  if (focus) edges.forEach(([a, b]) => { if (a === focus || b === focus) { related.add(a); related.add(b); } });

  return (
    <div dir="ltr" role="group" aria-label={t("AI skills constellation")} className="relative overflow-hidden rounded-[10px]" style={{ height, background: "radial-gradient(ellipse at 40% 45%, color-mix(in srgb, var(--blue) 7%, transparent), transparent 65%)" }}>
      <svg viewBox="0 0 1000 560" preserveAspectRatio="none" width="100%" height="100%" className="absolute inset-0" aria-hidden="true">
        {edges.map(([a, b]) => { const [x1, y1] = POS[a] ?? [0, 0], [x2, y2] = POS[b] ?? [0, 0]; const on = focus && (a === focus || b === focus);
          return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? "var(--blue)" : "var(--border2)"} strokeWidth={on ? 2 : 1.2} strokeOpacity={focus && !on ? 0.25 : 0.9} vectorEffect="non-scaling-stroke" />; })}
      </svg>
      {domains.map((d) => {
        const [x, y] = POS[d.slug] ?? [500, 280];
        const dim = focus && !related.has(d.slug);
        const size = 22 + d.level * 4;
        const ring = d.state === "verified" ? { background: "var(--green)" } : d.state === "provisional" ? { border: "2px solid var(--blue)", background: "linear-gradient(90deg, var(--blue) 50%, transparent 50%)" } : { border: "1.5px dashed var(--border2)" };
        return (
          <button key={d.slug} type="button" aria-label={t("{name}, level {level}, {state}", { name: d.name, level: d.level, state: stateLabel(t, d.state) })} aria-pressed={selected === d.slug}
            onMouseEnter={() => setHover(d.slug)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d.slug)} onBlur={() => setHover(null)}
            onClick={() => onSelect?.(selected === d.slug ? null : d.slug)}
            className={clsx("absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl p-1 transition-opacity", dim && "opacity-35")} style={{ left: `${x / 10}%`, top: `${(y / 560) * 100}%` }}>
            <span className="flex items-center justify-center rounded-full transition-transform hover:scale-110" style={{ width: size, height: size, ...ring }} />
            <span className={clsx("whitespace-nowrap text-xs", selected === d.slug ? "font-semibold text-fg" : "text-fg2")}>{d.name}</span>
          </button>
        );
      })}
      <div className="absolute bottom-3 end-3 hidden flex-wrap gap-3 rounded-[10px] border border-line px-3 py-2 text-[11.5px] text-fg2 md:flex" style={{ background: "color-mix(in srgb, var(--surface) 85%, transparent)" }}>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-line2" />{t("Not assessed")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-blue" style={{ background: "linear-gradient(90deg, var(--blue) 50%, transparent 50%)" }} />{t("Provisional (AI only)")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green" />{t("Verified by a human")}</span>
      </div>
    </div>
  );
}

export function DomainDetail({ domain, onClose }: { domain: DomainNode; onClose: () => void }) {
  const t = useT();
  return (
    <div className="rounded-[14px] border border-line bg-elevated p-4 shadow-xl">
      <div className="flex items-center justify-between"><StateBadge state={domain.state} /><button type="button" onClick={onClose} aria-label={t("Close detail")} className="rounded-md px-2 text-fg2 hover:text-fg">✕</button></div>
      <p className="h mt-2 text-[17px] font-semibold">{domain.name} <span className="font-mono text-[13px] text-muted">L{domain.level}</span></p>
      <ul className="mt-2 space-y-1.5 text-[12.5px] text-fg2">{domain.skills.map((s) => <li key={s.id} className="flex justify-between gap-3"><Link href={`/skills/${s.id}`} className="hover:text-fg hover:underline">{s.name}</Link><span className="font-mono">L{s.level}</span></li>)}</ul>
    </div>
  );
}
