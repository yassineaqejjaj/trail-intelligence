export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// Same-origin: Next rewrites /api/v1/* to the Railway API, so the session cookie is first-party.
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const lang = typeof document !== "undefined" ? /(?:^|; )lang=(\w+)/.exec(document.cookie)?.[1] : undefined;
  const res = await fetch(`/api/v1${path}`, {
    credentials: "include",
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(lang ? { "X-Lang": lang } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data?.detail;
    throw new ApiError(res.status, typeof d === "string" ? d : Array.isArray(d) ? d.map((x: { msg: string }) => x.msg).join("; ") : "Request failed");
  }
  return data as T;
}

export type User = { id: string; email: string; full_name: string; role: "learner" | "trainer" | "org_admin" | "platform_admin"; professional_role: string | null; objectives: string[]; onboarding_completed: boolean; share_with_org: boolean };
export type Skill = { id: string; slug: string; name: string; description: string; domain: string; domain_slug: string; levels: Record<string, string>; criteria: string[]; prerequisites: string[]; level: number; state: "not_assessed" | "provisional" | "verified"; framework_version: string };
export type Exercise = { id: string; slug: string; title: string; scenario: string; objectives: string[]; resources: { title: string; note?: string }[]; checklist: string[]; professional_role: string; is_baseline: boolean; expected_level: number; status: string; skills: string[]; rubric: { key: string; name: string; description: string; max_score: number; weight?: number }[]; rubric_version: number };
export type Submission = { id: string; exercise_id: string; content: string; checklist_state: Record<string, boolean>; status: "draft" | "submitted" | "evaluating" | "evaluated"; updated_at: string; submitted_at: string | null };
export type Assessment = { id: string; submission_id: string; status: "queued" | "running" | "completed" | "insufficient_evidence" | "pending_human_review" | "failed"; provisional: boolean; rubric_version: number; prompt_version: string; model: string; scores: { dimension: string; score: number; rationale: string }[]; overall_score: number | null; level: number | null; evidence: { dimension: string; quote: string; comment: string }[]; strengths: string[]; improvements: string[]; next_actions: string[]; error: string | null; review_note: string | null; created_at: string };
export type Progress = { skills: Skill[]; summary: { assessed: number; total: number; verified: number; provisional: number }; recommendation: { skill_slug: string | null; exercise_slug: string | null; exercise_id: string | null; explanation: string }; disclaimer: string };

export const LEVEL_NAMES = ["Not Assessed", "Awareness", "Assisted Practitioner", "Autonomous Practitioner", "Advanced Practitioner", "Expert / Mentor"];
export type Role = { key: string; label: string };
