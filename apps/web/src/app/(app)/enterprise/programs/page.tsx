"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, EmptyState, ErrorState, Field, Input, Loading, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { useSkills } from "@/lib/hooks";
import { useOrg } from "@/lib/org";

export default function Programs() {
  const org = useOrg(), skills = useSkills(), qc = useQueryClient();
  const q = useQuery({ queryKey: ["programs", org.data?.id], enabled: !!org.data, queryFn: () => api<{ id: string; name: string; target_skill_ids: string[] }[]>(`/organizations/${org.data!.id}/programs`) });
  const [name, setName] = useState(""), [sel, setSel] = useState<string[]>([]);
  const create = useMutation({ mutationFn: () => api(`/organizations/${org.data!.id}/programs`, { method: "POST", json: { name, target_skill_slugs: sel } }), onSuccess: () => { toast.success("Program created"); setName(""); setSel([]); qc.invalidateQueries({ queryKey: ["programs"] }); }, onError: (e) => toast.error(e.message) });
  if (org.isLoading || q.isLoading) return <Loading />;
  if (!org.data) return <EmptyState title="No organization" />;
  if (q.isError) return <ErrorState error={q.error} />;
  return (
    <>
      <PageHeader title="Learning programs" sub="Define target skills for your teams. Assignment and completion tracking are on the roadmap." />
      <Card className="mb-4"><form className="space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}><Field id="pn" label="Program name"><Input id="pn" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <div className="flex flex-wrap gap-2">{(skills.data ?? []).map((s) => <label key={s.slug} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"><input type="checkbox" checked={sel.includes(s.slug)} onChange={(e) => setSel(e.target.checked ? [...sel, s.slug] : sel.filter((x) => x !== s.slug))} />{s.name}</label>)}</div>
        <Button type="submit" disabled={create.isPending}>Create program</Button></form></Card>
      {!q.data!.length ? <EmptyState title="No programs yet" /> : <ul className="space-y-2">{q.data!.map((p) => <li key={p.id}><Card><p className="font-medium">{p.name}</p><p className="text-xs text-muted">{p.target_skill_ids.length} target skills</p></Card></li>)}</ul>}
    </>
  );
}
