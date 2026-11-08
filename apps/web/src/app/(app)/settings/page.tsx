"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button, Card, Field, Input, Label, PageHeader } from "@/components/ui";
import { useT } from "@/i18n/provider";
import { api, type User } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useRoleLabel } from "@/lib/hooks";

export default function Settings() {
  const t = useT(), roleLabel = useRoleLabel();
  const me = useMe().data, qc = useQueryClient(), router = useRouter();
  const [name, setName] = useState(me?.full_name ?? ""), [confirm, setConfirm] = useState("");
  const patch = async (body: object) => { try { const u = await api<User>("/users/me", { method: "PATCH", json: body }); qc.setQueryData(["me"], u); toast.success(t("Saved")); } catch (e) { toast.error(e instanceof Error ? e.message : t("Failed")); } };
  const exportData = async () => {
    const d = await api("/users/me/export"); const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "trail-data-export.json"; a.click(); URL.revokeObjectURL(url);
  };
  const del = async () => { try { await api("/users/me", { method: "DELETE" }); qc.clear(); toast.success(t("Account deleted")); router.push("/"); } catch (e) { toast.error(e instanceof Error ? e.message : t("Failed")); } };
  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title={t("Settings")} sub={t("Account, language and privacy")} />
      <Card><Label>{t("Account")}</Label><div className="mt-3 space-y-3"><Field id="name" label={t("Full name")}><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <p className="text-sm text-fg2">{me?.email}{me?.professional_role ? ` · ${roleLabel(me.professional_role)}` : ""}</p><Button onClick={() => patch({ full_name: name })}>{t("Save")}</Button></div></Card>
      <Card><Label>{t("Language")}</Label><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-fg2">{t("Choose the language of the interface and of skills, exercises and feedback.")}</p><LanguageSwitcher /></div></Card>
      <Card><Label>{t("Privacy")}</Label><label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={!!me?.share_with_org} onChange={(e) => patch({ share_with_org: e.target.checked })} />{t("Include my skill levels in anonymous organization aggregates. Administrators never see my submissions or individual assessments.")}</label></Card>
      <Card><Label>{t("Your data")}</Label><p className="mt-2 text-sm text-fg2">{t("Download everything we store about you, or permanently delete your account and its content.")}</p>
        <Button variant="outline" className="mt-3" onClick={exportData}>{t("Export my data")}</Button>
        <div className="mt-5 border-t border-line pt-4"><Field id="del" label={t("Type {word} to confirm account deletion", { word: '"DELETE"' })}><Input id="del" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field><Button variant="danger" className="mt-3" disabled={confirm !== "DELETE"} onClick={del}>{t("Delete account")}</Button></div></Card>
    </div>
  );
}
