"use client";
import Link from "next/link";
import { EmptyState, ErrorState, LinkButton, Loading, PageHeader, StateBadge } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { levelName } from "@/lib/api";
import { useAssessments } from "@/lib/hooks";

export default function Assessments() {
  const { t, fmtDate, fmtNum } = useI18n(), q = useAssessments();
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <>
      <PageHeader title={t("Assessments")} sub={t("History of your evaluated submissions")} />
      {!q.data!.length ? <EmptyState title={t("No assessments yet")} hint={t("Submit an exercise to receive evidence-linked feedback.")} action={<LinkButton href="/practice">{t("Open practice lab")}</LinkButton>} /> :
        <ul className="m-0 flex list-none flex-col gap-3 p-0">{q.data!.map((a) => (
          <li key={a.id}><Link href={`/assessments/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-surface p-4 transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
            <div className="flex items-center gap-4"><span className="h inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-elevated font-mono text-sm font-semibold">{a.level ? `L${a.level}` : "—"}</span>
              <div><p className="text-sm font-medium">{fmtDate(a.created_at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p><p className="text-xs text-muted">{a.level ? levelName(t, a.level) : t("No level")}{a.overall_score != null ? ` · ${fmtNum(a.overall_score)}%` : ""}</p></div></div>
            <StateBadge state={a.status} /></Link></li>))}</ul>}
    </>
  );
}
