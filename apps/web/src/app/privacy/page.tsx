import Link from "next/link";
import { getT } from "@/i18n/server";

export async function generateMetadata() { const { t } = await getT(); return { title: t("Privacy notice — TRAIL Intelligence") }; }

export default async function Page() {
  const { t } = await getT();
  return (
    <main id="main" className="mx-auto max-w-3xl px-8 py-16">
      <Link href="/" className="text-sm text-blue hover:underline">{t("← TRAIL Intelligence")}</Link>
      <h1 className="h mt-4 text-[36px] font-semibold">{t("Privacy notice")}</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-fg2">
        <p className="rounded-lg border border-amber/40 p-3 text-sm text-fg"><b>{t("Draft pending legal review.")}</b> {t("This notice describes how the product actually works. It has not been reviewed by counsel; the operator must complete controller identity and contact details before a public launch.")}</p>
        <h2 className="h text-xl font-semibold text-fg">{t("What we process")}</h2>
        <p>{t("Account data (email, name, professional role, objectives), your exercise submissions, the resulting assessments and skill evidence, and minimal product events (for example “exercise submitted”). We do not use advertising trackers.")}</p>
        <h2 className="h text-xl font-semibold text-fg">{t("Why")}</h2>
        <p>{t("To provide the service you asked for: assessing your submissions, showing your skills profile and recommending next exercises. Submissions are sent to an automated assessment service, and may be read by a human trainer when review is needed.")}</p>
        <h2 className="h text-xl font-semibold text-fg">{t("Who sees it")}</h2>
        <p>{t("You, and trainers reviewing flagged assessments. If you belong to an organization and opt in, only anonymous aggregates (never fewer than 3 people) are visible to its administrators. Your submissions are never shown to them.")}</p>
        <h2 className="h text-xl font-semibold text-fg">{t("Your rights")}</h2>
        <p>{t("In Settings you can export all your data and permanently delete your account. Reset tokens and analytics events are purged on a schedule.")}</p>
        <h2 className="h text-xl font-semibold text-fg">{t("Subprocessors")}</h2>
        <p>{t("Hosting (Vercel, Railway), transactional email, and the AI assessment provider when one is configured. The list must be kept current by the operator.")}</p>
      </div>
    </main>
  );
}
