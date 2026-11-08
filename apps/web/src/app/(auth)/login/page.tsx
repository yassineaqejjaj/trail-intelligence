"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, type User } from "@/lib/api";

function Form() {
  const router = useRouter(), next = useSearchParams().get("next"), qc = useQueryClient();
  const t = useT();
  const schema = useMemo(() => z.object({ email: z.string().email(t("Enter a valid email")), password: z.string().min(1, t("Password required")) }), [t]);
  const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(async (v) => {
      setErr("");
      try { const u = await api<User>("/auth/login", { method: "POST", json: v }); qc.setQueryData(["me"], u); router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"); }
      catch (e) { setErr(e instanceof Error ? e.message : t("Login failed")); }
    })} className="space-y-4" noValidate>
      <h1 className="font-display text-xl font-semibold">{t("Sign in")}</h1>
      <Field id="email" label={t("Email")} error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
      <Field id="password" label={t("Password")} error={errors.password?.message}><Input id="password" type="password" autoComplete="current-password" {...register("password")} /></Field>
      {err && <p role="alert" className="text-sm text-red">{err}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? t("Signing in…") : t("Sign in")}</Button>
      <p className="flex justify-between text-sm text-fg2"><Link href="/forgot-password" className="underline">{t("Forgot password?")}</Link><Link href="/register" className="underline">{t("Create account")}</Link></p>
    </form>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
