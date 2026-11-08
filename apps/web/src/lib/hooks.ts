"use client";
import { useQuery } from "@tanstack/react-query";
import { api, type Assessment, type Exercise, type Progress, type Skill, type Submission } from "./api";

export const useProgress = () => useQuery({ queryKey: ["progress"], queryFn: () => api<Progress>("/progress/me") });
export const useSkills = () => useQuery({ queryKey: ["skills"], queryFn: () => api<Skill[]>("/skills") });
export const useExercises = () => useQuery({ queryKey: ["exercises"], queryFn: () => api<Exercise[]>("/exercises") });
export const useAssessments = () => useQuery({ queryKey: ["assessments"], queryFn: () => api<Assessment[]>("/assessments") });
export const useSubmissions = () => useQuery({ queryKey: ["submissions"], queryFn: () => api<Submission[]>("/submissions") });
export type PathData = { steps: { skill: Skill; exercises: string[]; complete: boolean }[]; completed: number; total: number; next: string | null };
export const usePath = () => useQuery({ queryKey: ["path"], queryFn: () => api<PathData>("/learning-paths/me") });
