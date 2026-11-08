"use client";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ExerciseForm } from "@/components/exercise-form";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { api, type Exercise } from "@/lib/api";

export default function EditExercise({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useQuery({ queryKey: ["t-ex", id], queryFn: () => api<Exercise[]>("/trainer/exercises").then((l) => l.find((e) => e.id === id)) });
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorState error={q.error ?? new Error("Exercise not found")} />;
  return <><PageHeader title="Edit exercise" /><ExerciseForm initial={q.data} /></>;
}
