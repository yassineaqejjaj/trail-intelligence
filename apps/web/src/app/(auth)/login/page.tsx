"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input } from "@/components/ui";
import { api, type User } from "@/lib/api";

const schema = z.object({ email: z.string().email("Enter a valid email"), password: z.string().min(1, "Password required") });

function Form() {
  const router = useRouter(), next = useSearchParams().get("next"), qc = useQueryClient();
  const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(async (v) => {
      setErr("");
      try { const u = await api<User>("/auth/login", { method: "POST", json: v }); qc.setQueryData(["me"], u); router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"); }
      catch (e) { setErr(e instanceof Error ? e.message : "Login failed"); }
    })} className="space-y-4" noValidate>
      <h1 className="font-display text-xl font-semibold">Sign in</h1>
      <Field id="email" label="Email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
      <Field id="password" label="Password" error={errors.password?.message}><Input id="password" type="password" autoComplete="current-password" {...register("password")} /></Field>
      {err && <p role="alert" className="text-sm text-red">{err}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</Button>
      <p className="flex justify-between text-sm text-fg2"><Link href="/forgot-password" className="underline">Forgot password?</Link><Link href="/register" className="underline">Create account</Link></p>
    </form>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
