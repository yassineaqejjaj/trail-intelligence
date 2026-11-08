"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, ErrorState, Label, LinkButton, Loading, PageHeader } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, type Exercise } from "@/lib/api";

export default function Trainer() {
  const t = useT();
  const ex = useQuery({ queryKey: ["t-ex"], queryFn: () => api<Exercise[]>("/trainer/exercises") });
  const rv = useQuery({ queryKey: ["t-rv"], queryFn: () => api<unknown[]>("/trainer/reviews") });
  if (ex.isLoading || rv.isLoading) return <Loading />;
  if (ex.isError) return <ErrorState error={ex.error} retry={() => ex.refetch()} />;
  const list = ex.data ?? [], pub = list.filter((e) => e.status === "published").length, drafts = list.filter((e) => e.status === "draft").length;
  return (
    <>
      <PageHeader title={t("Trainer studio")} sub={t("Author exercises, version rubrics and review flagged assessments.")} actions={<LinkButton href="/trainer/exercises/new">{t("New exercise")}</LinkButton>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><Label>{t("Exercises")}</Label><p className="mt-2 font-display text-3xl">{list.length}</p></Card>
        <Card><Label>{t("Published")}</Label><p className="mt-2 font-display text-3xl">{pub}</p></Card>
        <Card><Label>{t("Drafts")}</Label><p className="mt-2 font-display text-3xl">{drafts}</p></Card>
        <Card><Label>{t("Awaiting review")}</Label><p className="mt-2 font-display text-3xl text-amber">{rv.data?.length ?? 0}</p></Card>
      </div>
      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-medium">{t("Review queue")}</p><p className="text-sm text-fg2">{t("Assessments flagged for human review. Your decision and justification are audit-logged.")}</p></div>
        <LinkButton href="/trainer/reviews" variant="outline">{t("Open queue")}</LinkButton>
      </Card>
    </>
  );
}
