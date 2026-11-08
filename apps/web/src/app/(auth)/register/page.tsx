"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input } from "@/components/ui";
import { api, type User } from "@/lib/api";

const schema = z.object({
  full_name: z.string().min(1, "Name required").max(200), email: z.string().email("Enter a valid email"),
  password: z.string().min(10, "At least 10 characters"), accept_terms: z.literal(true, { error: "You must accept to continue" }),
});

export default function Register() {
  const router = useRouter(), qc = useQueryClient();
  const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(async (v) => {
      setErr("");
      try { const u = await api<User>("/auth/register", { method: "POST", json: v }); qc.setQueryData(["me"], u); router.push("/onboarding"); }
      catch (e) { setErr(e instanceof Error ? e.message : "Registration failed"); }
    })} className="space-y-4" noValidate>
      <h1 className="font-display text-xl font-semibold">Create your account</h1>
      <Field id="name" label="Full name" error={errors.full_name?.message}><Input id="name" autoComplete="name" {...register("full_name")} /></Field>
      <Field id="email" label="Email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
      <Field id="password" label="Password" error={errors.password?.message}><Input id="password" type="password" autoComplete="new-password" {...register("password")} /></Field>
      <div><label className="flex items-start gap-2 text-sm text-fg2"><input type="checkbox" className="mt-1" {...register("accept_terms")} />I accept the <a href="/terms" className="underline">terms of use</a> and have read the <a href="/privacy" className="underline">privacy notice</a>. My submissions are processed by an automated AI assessment service.</label>
        {errors.accept_terms && <p role="alert" className="mt-1 text-xs text-red">{errors.accept_terms.message}</p>}</div>
      {err && <p role="alert" className="text-sm text-red">{err}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create account"}</Button>
      <p className="text-sm text-fg2">Already registered? <Link href="/login" className="underline">Sign in</Link></p>
    </form>
  );
}
