import Link from "next/link";
import { getT } from "@/i18n/server";

export async function generateMetadata() { const { t } = await getT(); return { title: t("Terms of use — TRAIL Intelligence") }; }

export default async function Page() {
  const { t } = await getT();
  return (
    <main id="main" className="mx-auto max-w-3xl px-8 py-16">
      <Link href="/" className="text-sm text-blue hover:underline">{t("← TRAIL Intelligence")}</Link>
      <h1 className="h mt-4 text-[36px] font-semibold">{t("Terms of use")}</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-fg2">
        <p className="rounded-lg border border-amber/40 p-3 text-sm text-fg"><b>{t("Draft pending legal review.")}</b></p>
        <p>{t("TRAIL Intelligence provides practice exercises and automated, provisional feedback. Results are learning evidence, not a certification, qualification or employment decision.")}</p>
        <p>{t("Do not submit confidential, personal or third-party data you are not allowed to share. You are responsible for the content you submit. The service is provided as is during the pilot.")}</p>
      </div>
    </main>
  );
}
