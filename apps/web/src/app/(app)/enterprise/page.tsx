"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, ErrorState, Label, Loading, PageHeader } from "@/components/ui";
import { useI18n } from "@/i18n/provider";
import { api } from "@/lib/api";
import { useOrg, type Analytics } from "@/lib/org";

export default function Enterprise() {
  const { t, fmtNum } = useI18n();
  const org = useOrg();
  const a = useQuery({ queryKey: ["analytics", org.data?.id], enabled: !!org.data, queryFn: () => api<Analytics>(`/organizations/${org.data!.id}/analytics`) });
  if (org.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title={t("No organization")} hint={t("You are not an administrator of any organization.")} />;
  if (a.isError) return <ErrorState error={a.error} retry={() => a.refetch()} />;
  const d = a.data;
  return (
    <>
      <PageHeader title={org.data.name} sub={t("Organization overview")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><Label>{t("Members")}</Label><p className="mt-2 font-display text-3xl">{d ? fmtNum(d.members) : "…"}</p></Card>
        <Card><Label>{t("Sharing aggregates")}</Label><p className="mt-2 font-display text-3xl">{d ? fmtNum(d.consenting_members) : "…"}</p></Card>
      </div>
      <Card className="mt-4 border-blue/40"><Label>{t("Privacy")}</Label><p className="mt-2 text-sm text-fg2">{t("Aggregates need 3+ consenting members. Individual submissions are never shown.")}</p></Card>
    </>
  );
}
