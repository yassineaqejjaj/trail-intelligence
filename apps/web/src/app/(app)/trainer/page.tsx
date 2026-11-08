"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, ErrorState, LinkButton, Loading, PageHeader } from "@/components/ui";
import { api, type Exercise } from "@/lib/api";

export default function Trainer() {
  const ex = useQuery({ queryKey: ["t-ex"], queryFn: () => api<Exercise[]>("/trainer/exercises") });
  const rv = useQuery({ queryKey: ["t-rv"], queryFn: () => api<unknown[]>("/trainer/reviews") });
  if (ex.isLoading || rv.isLoading) return <Loading />;
  if (ex.isError) return <ErrorState error={ex.error} />;
  return (
    <>
      <PageHeader title="Trainer studio" actions={<LinkButton href="/trainer/exercises/new">New exercise</LinkButton>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-fg2">Exercises</p><p className="font-display text-3xl">{ex.data?.length}</p></Card>
        <Card><p className="text-sm text-fg2">Published</p><p className="font-display text-3xl">{ex.data?.filter((e) => e.status === "published").length}</p></Card>
        <Card><p className="text-sm text-fg2">Awaiting review</p><p className="font-display text-3xl text-amber">{rv.data?.length ?? 0}</p><LinkButton href="/trainer/reviews" variant="outline" className="mt-2">Open queue</LinkButton></Card>
      </div>
    </>
  );
}
