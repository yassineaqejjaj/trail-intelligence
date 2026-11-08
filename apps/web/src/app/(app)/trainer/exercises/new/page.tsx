"use client";
import { ExerciseForm } from "@/components/exercise-form";
import { PageHeader } from "@/components/ui";
import { useT } from "@/i18n/provider";

export default function NewExercise() {
  const t = useT();
  return <><PageHeader title={t("New exercise")} sub={t("Drafts are only visible to you until published.")} /><ExerciseForm /></>;
}
