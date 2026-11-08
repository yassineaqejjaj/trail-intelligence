import Link from "next/link";

export const metadata = { title: "Assessment methodology — TRAIL Intelligence" };

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-8 py-16">
      <Link href="/" className="text-sm text-blue hover:underline">← TRAIL Intelligence</Link>
      <h1 className="h mt-4 text-[36px] font-semibold">Assessment methodology</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-fg2">
        <p>Each exercise has a versioned rubric of weighted dimensions. A submission is scored per dimension by an automated evaluator; the output must pass validation (schema, scores within bounds, quoted evidence that really appears in your text) or the assessment fails rather than guessing.</p>
        <p>The overall level is computed by the platform from the weighted score, not chosen by the model. Automatic results are capped at Level 3 and marked provisional. Levels 4–5, suspected prompt-injection, and low-confidence results go to a human trainer; only a trainer review marks a skill as verified.</p>
        <p>The evaluator has not yet been calibrated against expert-labelled data. Treat scores as feedback, not as a verdict.</p>
      </div>
    </main>
  );
}
