"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api } from "@/lib/api";

function Form() {
  const token = useSearchParams().get("token") ?? "", router = useRouter(), t = useT();
  const [pw, setPw] = useState(""), [err, setErr] = useState("");
  return (
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setErr("");
      try { await api("/auth/reset-password", { method: "POST", json: { token, password: pw } }); toast.success(t("Password updated")); router.push("/login"); } catch (x) { setErr(x instanceof Error ? x.message : t("Failed")); } }}>
      <h1 className="font-display text-xl font-semibold">{t("Choose a new password")}</h1>
      <Field id="pw" label={t("New password (min. 10 characters)")}><Input id="pw" type="password" minLength={10} required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      {err && <p role="alert" className="text-sm text-red">{err}</p>}
      <Button type="submit" className="w-full" disabled={!token}>{t("Update password")}</Button>
      <Link href="/login" className="text-sm underline">{t("Back to sign in")}</Link>
    </form>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
