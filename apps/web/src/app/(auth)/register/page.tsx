"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, type User } from "@/lib/api";

export default function Register() {
  const router = useRouter(), qc = useQueryClient();
  const t = useT();
  const schema = useMemo(() => z.object({
    full_name: z.string().min(1, t("Name required")).max(200), email: z.string().email(t("Enter a valid email")),
    password: z.string().min(10, t("At least 10 characters")), accept_terms: z.literal(true, { error: t("You must accept to continue") }),
  }), [t]);
  const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(async (v) => {
      setErr("");
      try { const u = await api<User>("/auth/register", { method: "POST", json: v }); qc.setQueryData(["me"], u); router.push("/onboarding"); }
      catch (e) { setErr(e instanceof Error ? e.message : t("Registration failed")); }
    })} className="space-y-4" noValidate>
      <h1 className="font-display text-xl font-semibold">{t("Create your account")}</h1>
      <Field id="name" label={t("Full name")} error={errors.full_name?.message}><Input id="name" autoComplete="name" {...register("full_name")} /></Field>
      <Field id="email" label={t("Email")} error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
      <Field id="password" label={t("Password")} error={errors.password?.message}><Input id="password" type="password" autoComplete="new-password" {...register("password")} /></Field>
      <div><label className="flex items-start gap-2 text-sm text-fg2"><input type="checkbox" className="mt-1" {...register("accept_terms")} /><span>{t("I accept the {terms} and have read the {privacy}. My submissions are processed by an automated AI assessment service.", { terms: "\u0001", privacy: "\u0002" }).split(/(\u0001|\u0002)/).map((x, i) => x === "\u0001" ? <a key={i} href="/terms" className="underline">{t("terms of use")}</a> : x === "\u0002" ? <a key={i} href="/privacy" className="underline">{t("privacy notice")}</a> : x)}</span></label>
        {errors.accept_terms && <p role="alert" className="mt-1 text-xs text-red">{errors.accept_terms.message}</p>}</div>
      {err && <p role="alert" className="text-sm text-red">{err}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? t("Creating…") : t("Create account")}</Button>
      <p className="text-sm text-fg2">{t("Already registered?")} <Link href="/login" className="underline">{t("Sign in")}</Link></p>
    </form>
  );
}
