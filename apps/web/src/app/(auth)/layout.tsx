import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/ui";
import { getT } from "@/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getT();
  return (
    <div className="glow relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute end-4 top-4"><LanguageSwitcher /></div>
      <Link href="/" className="mb-6 flex items-center gap-2.5" aria-label={t("TRAIL Intelligence home")}><Logo /><span className="h text-lg font-semibold">TRAIL <span className="font-medium text-fg2">Intelligence</span></span></Link>
      <main id="main" className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-7">{children}</main>
    </div>
  );
}
