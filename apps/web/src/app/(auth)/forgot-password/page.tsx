"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api } from "@/lib/api";

export default function Forgot() {
  const t = useT();
  const [email, setEmail] = useState(""), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  if (done) return <div className="space-y-3"><h1 className="font-display text-xl font-semibold">{t("Check your inbox")}</h1><p className="text-sm text-fg2">{t("If an account exists for that address, a reset link has been sent. It expires in 30 minutes.")}</p><Link href="/login" className="text-sm underline">{t("Back to sign in")}</Link></div>;
  return (
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await api("/auth/forgot-password", { method: "POST", json: { email } }); } catch {} setDone(true); }}>
      <h1 className="font-display text-xl font-semibold">{t("Reset password")}</h1>
      <Field id="email" label={t("Email")}><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Button type="submit" className="w-full" disabled={busy}>{t("Send reset link")}</Button>
    </form>
  );
}
