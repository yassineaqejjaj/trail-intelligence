import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { LinkButton, Logo } from "@/components/ui";

const PROBLEMS = [["01", "Completion ≠ capability", "A finished course says nothing about whether someone can scope an agent safely."], ["02", "Generic content", "The same videos for a PM, a designer and an engineer — none of them practise their real work."], ["03", "No evidence", "Certificates without artefacts. Leaders can't see where their teams actually stand."], ["04", "Stale fast", "AI practice changes monthly. Static curricula don't adapt to the learner or the field."]];
const LOOP = [["Assess", "A 20-minute baseline in your role maps where you stand."], ["Practice", "Realistic scenarios that end in an artefact, not a quiz."], ["Evaluate", "Scored against a public rubric with evidence quoted from your work."], ["Improve", "Recommendations explain why a skill is next."], ["Prove", "Human review turns provisional evidence into verified skills."]];
const FAQ = [["Is the AI score a certification?", "No. Automatic results are provisional evidence. Only a human reviewer can verify a skill, and the product labels the difference everywhere."], ["Who sees my submissions?", "Only you and the reviewers assigned to them. Organizations see aggregates from people who opted in, and never for groups smaller than 3."], ["Can I export or delete my data?", "Yes — both are in Settings."]];

function Section({ id, label, title, children }: { id?: string; label: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="mx-auto w-full max-w-[1200px] px-8 py-20"><div className="lab">{label}</div><h2 className="h mt-3 max-w-3xl text-[44px] font-semibold leading-[1.05]">{title}</h2><div className="mt-10">{children}</div></section>;
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-8 py-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="TRAIL Intelligence home"><Logo /><span className="h text-base font-semibold">TRAIL <span className="font-medium text-fg2">Intelligence</span></span></Link>
          <nav aria-label="Site" className="ml-6 hidden gap-1 text-sm md:flex">{[["How it works", "#how"], ["Practice", "#practice"], ["For teams", "#teams"], ["For trainers", "#trainers"], ["Pricing", "#pricing"]].map(([l, h]) => <a key={h} href={h} className="rounded-lg px-3 py-2 text-fg2 hover:bg-elevated hover:text-fg">{l}</a>)}</nav>
          <div className="ml-auto flex gap-2"><LinkButton href="/login" variant="ghost">Sign in</LinkButton><LinkButton href="/register">Assess your AI skills</LinkButton></div>
        </div>
      </header>
      <main id="main">
        <section className="relative overflow-hidden" style={{ background: "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--blue) 18%, transparent), transparent 70%)" }}>
          <div className="mx-auto max-w-[1200px] px-8 pb-24 pt-24">
            <div className="lab text-cyan">TRAIL Academy · Training Roadmap for Applied Intelligence &amp; Leadership</div>
            <h1 className="h mt-5 max-w-[980px] text-[clamp(44px,8vw,84px)] font-semibold leading-[0.98]">Learn AI. Apply AI. <span className="text-blue">Lead with AI.</span></h1>
            <p className="mt-6 max-w-[620px] text-lg leading-relaxed text-fg2">Build real-world AI capabilities through personalized practice, intelligent assessment, and measurable progress. Don&apos;t just learn AI — prove what you can do with it.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><LinkButton href="/register">Assess your AI skills <ArrowRight className="h-4 w-4" /></LinkButton><LinkButton href="#how" variant="outline">See how it works</LinkButton><span className="text-[13px] text-muted">20-minute baseline · free during pilot</span></div>
          </div>
        </section>

        <Section label="The problem" title="AI training measures what you watched. Not what you can do.">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">{PROBLEMS.map(([n, t, d]) => <div key={n} className="rounded-[14px] border border-line bg-surface p-6"><span className="font-mono text-xs text-muted">{n}</span><h3 className="h mt-2 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-fg2">{d}</p></div>)}</div>
        </Section>

        <Section id="how" label="How TRAIL works" title="Five actions. One loop. Real evidence.">
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">{LOOP.map(([t, d], i) => <li key={t} className="rounded-[14px] border border-line bg-surface p-5"><span className="font-mono text-xs text-cyan">0{i + 1}</span><h3 className="h mt-2 text-xl font-semibold">{t}</h3><p className="mt-2 text-[13.5px] leading-relaxed text-fg2">{d}</p></li>)}</ol>
        </Section>

        <Section id="practice" label="Personalized practice" title="Exercises that look like your actual job.">
          <div className="grid gap-4 md:grid-cols-3">{[["Product Managers", "Scope an AI feature, define success metrics and fallbacks."], ["UX/UI Designers", "Design uncertainty states and trust patterns."], ["Software Developers", "Review AI-generated code, design context and guardrails."]].map(([t, d]) => <div key={t} className="rounded-[14px] border border-line bg-surface p-6"><h3 className="h text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-fg2">{d}</p></div>)}</div>
          <p className="mt-4 text-sm text-fg2">Every exercise ends in an artefact assessed against a versioned rubric. Results quote the evidence from your own text.</p>
        </Section>

        <Section id="teams" label="For enterprise leaders" title="Know your organization's real AI maturity.">
          <ul className="grid max-w-3xl gap-3 text-[15px]">{["Capability aggregates by domain for members who opt in", "Programs that define target skills for your teams", "Privacy by default: consent-based, minimum group size of 3, no individual submissions shown to administrators"].map((x) => <li key={x} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green" />{x}</li>)}</ul>
        </Section>

        <Section id="trainers" label="For trainers" title="Design practice. Keep humans in the verdict.">
          <p className="max-w-2xl text-[15px] leading-relaxed text-fg2">Build scenarios and versioned rubrics in the Trainer Studio, and review every score the AI flags — with your adjustments and reasons on record.</p>
        </Section>

        <Section id="pricing" label="Pricing" title="Start free. Prove more as you grow.">
          <div className="grid gap-4 md:grid-cols-3">{[["Explorer", "Free", "Baseline assessment, skills constellation, practice lab.", "Assess your AI skills", "/register", true], ["Professional", "Pricing to be announced", "Adaptive paths, human-reviewed verification.", "Join the pilot", "/register", false], ["Teams & Enterprise", "Contact us", "Skills intelligence, programs, trainer studio.", "Talk to us", "/register", false]].map(([n, p, d, c, h, hi]) => <div key={n as string} className={`flex flex-col gap-3 rounded-[14px] border bg-surface p-6 ${hi ? "border-blue/50" : "border-line"}`}><h3 className="h text-lg font-semibold">{n as string}</h3><div className="h text-2xl font-semibold">{p as string}</div><p className="flex-1 text-sm text-fg2">{d as string}</p><LinkButton href={h as string} variant={hi ? "primary" : "outline"}>{c as string}</LinkButton></div>)}</div>
          <p className="mt-3 text-xs text-muted">Indicative only. No payments are processed in this pilot.</p>
        </Section>

        <Section id="faq" label="FAQ" title="Questions, answered plainly.">
          <div className="max-w-3xl divide-y divide-line rounded-[14px] border border-line bg-surface">{FAQ.map(([q, a]) => <details key={q} className="group p-5"><summary className="cursor-pointer text-[15px] font-medium">{q}</summary><p className="mt-2 text-sm leading-relaxed text-fg2">{a}</p></details>)}</div>
        </Section>

        <section className="mx-auto max-w-[1200px] px-8 pb-24"><div className="rounded-2xl border border-line bg-surface p-10 text-center"><h2 className="h text-[40px] font-semibold leading-tight">Don&apos;t just learn AI.<br /><span className="text-blue">Prove what you can do with it.</span></h2><div className="mt-6 flex justify-center gap-3"><LinkButton href="/register">Assess your AI skills</LinkButton><LinkButton href="/login" variant="outline">Sign in</LinkButton></div></div></section>
      </main>
      <footer className="border-t border-line"><div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 px-8 py-8 text-sm text-muted"><span>© 2026 TRAIL Academy · Learn AI. Apply AI. Lead with AI.</span><span className="flex gap-4"><Link href="/privacy" className="hover:text-fg">Privacy</Link><Link href="/terms" className="hover:text-fg">Terms</Link><Link href="/methodology" className="hover:text-fg">Assessment methodology</Link></span></div></footer>
    </div>
  );
}
