"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/provider";

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  const t = useT(), path = usePathname();
  const tabs = [["/enterprise", t("Overview")], ["/enterprise/skills", t("Skills intelligence")], ["/enterprise/teams", t("Teams")], ["/enterprise/programs", t("Programs")]] as const;
  const active = (h: string) => (h === "/enterprise" ? path === h : path.startsWith(h));
  return (
    <>
      <nav aria-label={t("Organization sections")} className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map(([h, l]) => <Link key={h} href={h} aria-current={active(h) ? "page" : undefined} className={clsx("-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition", active(h) ? "border-blue text-fg" : "border-transparent text-fg2 hover:text-fg")}>{l}</Link>)}
      </nav>
      {children}
    </>
  );
}
