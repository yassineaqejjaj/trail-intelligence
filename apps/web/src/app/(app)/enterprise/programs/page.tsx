"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, EmptyState, ErrorState, Field, Input, Label, Loading, PageHeader } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api } from "@/lib/api";
import { useSkills } from "@/lib/hooks";
import { useOrg } from "@/lib/org";

export default function Programs() {
  const t = useT(), org = useOrg(), skills = useSkills(), qc = useQueryClient();
  const q = useQuery({ queryKey: ["programs", org.data?.id], enabled: !!org.data, queryFn: () => api<{ id: string; name: string; target_skill_ids: string[] }[]>(`/organizations/${org.data!.id}/programs`) });
  const [name, setName] = useState(""), [sel, setSel] = useState<string[]>([]);
  const create = useMutation({ mutationFn: () => api(`/organizations/${org.data!.id}/programs`, { method: "POST", json: { name, target_skill_slugs: sel } }), onSuccess: () => { toast.success(t("Program created")); setName(""); setSel([]); qc.invalidateQueries({ queryKey: ["programs"] }); }, onError: (e) => toast.error(e.message) });
  if (org.isLoading || q.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title={t("No organization")} />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <>
      <PageHeader title={t("Learning programs")} sub={t("Define target skills for your teams. Assignment and completion tracking are on the roadmap.")} />
      <Card className="mb-4"><Label>{t("New program")}</Label><form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}><Field id="pn" label={t("Program name")}><Input id="pn" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <div className="flex flex-wrap gap-2">{(skills.data ?? []).map((s) => <label key={s.slug} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"><input type="checkbox" checked={sel.includes(s.slug)} onChange={(e) => setSel(e.target.checked ? [...sel, s.slug] : sel.filter((x) => x !== s.slug))} />{s.name}</label>)}</div>
        <Button type="submit" disabled={create.isPending}>{t("Create program")}</Button></form></Card>
      {!q.data!.length ? <EmptyState title={t("No programs yet")} /> : <ul className="space-y-2">{q.data!.map((p) => <li key={p.id}><Card><p className="font-medium">{p.name}</p><p className="text-xs text-muted">{t("{n} target skills", { n: p.target_skill_ids.length })}</p></Card></li>)}</ul>}
    </>
  );
}
