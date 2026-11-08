"use client";
import { ExerciseForm } from "@/components/exercise-form";
import { PageHeader } from "@/components/ui";

export default function NewExercise() {
  return <><PageHeader title="New exercise" sub="Drafts are only visible to you until published." /><ExerciseForm /></>;
}
