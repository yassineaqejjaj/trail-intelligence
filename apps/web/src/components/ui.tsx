import clsx from "clsx";
import { AlertTriangle, Inbox } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

export function Button({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "danger" }) {
  return <button {...p} className={clsx("inline-flex items-center justify-center gap-2 min-h-10 rounded-[10px] border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "border-blue bg-blue text-on hover:brightness-110",
    variant === "outline" && "border-line bg-elevated text-fg hover:border-line2",
    variant === "ghost" && "border-transparent text-fg2 hover:bg-elevated hover:text-fg",
    variant === "danger" && "border-red bg-red text-white hover:brightness-110", className)} />;
}
export function LinkButton({ href, children, variant = "primary", className }: { href: string; children: ReactNode; variant?: "primary" | "outline" | "ghost"; className?: string }) {
  return <Link href={href} className={clsx("inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition",
    variant === "primary" && "border-blue bg-blue text-on hover:brightness-110", variant === "outline" && "border-line bg-elevated text-fg hover:border-line2", variant === "ghost" && "border-transparent text-fg2 hover:text-fg hover:bg-elevated", className)}>{children}</Link>;
}
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("rounded-[14px] border border-line bg-surface p-5", className)}>{children}</div>;
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} {...p} className={clsx("w-full rounded-[10px] border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted hover:border-line2", className)} />;
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} {...p} className={clsx("w-full rounded-[10px] border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted hover:border-line2", className)} />;
});
export function Field({ label, error, children, id }: { label: string; error?: string; children: ReactNode; id: string }) {
  return <div className="space-y-1.5"><label htmlFor={id} className="text-sm font-medium text-fg2">{label}</label>{children}{error && <p role="alert" className="text-xs text-red">{error}</p>}</div>;
}
export function Badge({ tone = "default", children }: { tone?: "default" | "green" | "amber" | "blue" | "red" | "cyan"; children: ReactNode }) {
  const c = { default: "", green: "s-ver", amber: "s-imp", blue: "s-rev", red: "s-red", cyan: "s-lrn" }[tone];
  return <span className={clsx("chip", c)}>{children}</span>;
}
export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={clsx("animate-pulse rounded-lg bg-elevated", className)} />;
export function Loading({ rows = 3 }: { rows?: number }) {
  return <div role="status" aria-label="Loading" className="space-y-3">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;
}
export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line p-10 text-center"><Inbox className="h-6 w-6 text-muted" /><p className="font-medium">{title}</p>{hint && <p className="text-sm text-fg2">{hint}</p>}{action}</div>;
}
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" className="flex items-center gap-3 rounded-xl border border-red/40 p-4 text-sm"><AlertTriangle className="h-4 w-4 text-red" /><span className="flex-1">{error instanceof Error ? error.message : "Something went wrong"}</span>{retry && <Button variant="outline" onClick={retry}>Retry</Button>}</div>;
}
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="h text-[28px] font-semibold leading-tight">{title}</h1>{sub && <p className="mt-1 text-sm text-fg2">{sub}</p>}</div>{actions}</div>;
}
export function StateBadge({ state }: { state: string }) {
  // Chip vocabulary from the design: Verified · Needs improvement · Insufficient evidence · Pending human review.
  const m: Record<string, [string, string]> = {
    verified: ["s-ver", "Verified"], provisional: ["s-imp", "Provisional"], not_assessed: ["s-ins", "Not assessed"],
    completed: ["s-rev", "Completed · provisional"], pending_human_review: ["s-rev", "Pending human review"], insufficient_evidence: ["s-ins", "Insufficient evidence"], failed: ["s-red", "Failed"],
    queued: ["", "Queued"], running: ["s-lrn", "Evaluating…"], draft: ["", "Draft"], submitted: ["s-rev", "Submitted"], evaluating: ["s-lrn", "Evaluating…"], evaluated: ["s-ver", "Evaluated"], published: ["s-ver", "Published"], archived: ["s-ins", "Archived"] };
  const [cls, label] = m[state] ?? ["", state];
  return <span className={clsx("chip", cls)}>{label}</span>;
}
export function Logo({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true"><rect x="0.5" y="0.5" width="35" height="35" rx="10" fill="var(--elevated)" stroke="var(--border)" /><path d="M9 26 L17 18 L27 10" stroke="var(--blue)" strokeWidth="2" fill="none" strokeLinecap="round" /><circle cx="9" cy="26" r="3" fill="var(--cyan)" /><circle cx="17" cy="18" r="3" fill="var(--blue)" /><circle cx="27" cy="10" r="3.5" fill="var(--green)" /></svg>;
}
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("lab", className)}>{children}</div>;
}
export function LevelBar({ level }: { level: number }) {
  return <div className="flex gap-1" role="img" aria-label={`Level ${level} of 5`}>{[1, 2, 3, 4, 5].map((i) => <span key={i} className={clsx("h-1.5 w-5 rounded-full", i <= level ? "bg-blue" : "bg-line")} />)}</div>;
}
