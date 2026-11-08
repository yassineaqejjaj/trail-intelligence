"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";
import { api, type User } from "@/lib/api";
import { useMe } from "@/lib/auth";

export default function Settings() {
  const me = useMe().data, qc = useQueryClient(), router = useRouter();
  const [name, setName] = useState(me?.full_name ?? ""), [confirm, setConfirm] = useState("");
  const patch = async (body: object) => { try { const u = await api<User>("/users/me", { method: "PATCH", json: body }); qc.setQueryData(["me"], u); toast.success("Saved"); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } };
  const exportData = async () => {
    const d = await api("/users/me/export"); const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "trail-data-export.json"; a.click(); URL.revokeObjectURL(url);
  };
  const del = async () => { try { await api("/users/me", { method: "DELETE" }); qc.clear(); toast.success("Account deleted"); router.push("/"); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } };
  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Settings" sub="Account and privacy" />
      <Card><h2 className="font-display text-lg">Account</h2><div className="mt-3 space-y-3"><Field id="name" label="Full name"><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></Field><p className="text-sm text-fg2">{me?.email}</p><Button onClick={() => patch({ full_name: name })}>Save</Button></div></Card>
      <Card><h2 className="font-display text-lg">Privacy</h2><label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={!!me?.share_with_org} onChange={(e) => patch({ share_with_org: e.target.checked })} />Include my skill levels in anonymous organization aggregates. Administrators never see my submissions or individual assessments.</label></Card>
      <Card><h2 className="font-display text-lg">Your data</h2><p className="mt-1 text-sm text-fg2">Download everything we store about you, or permanently delete your account and its content.</p>
        <Button variant="outline" className="mt-3" onClick={exportData}>Export my data</Button>
        <div className="mt-5 border-t border-line pt-4"><Field id="del" label='Type "DELETE" to confirm account deletion'><Input id="del" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field><Button variant="danger" className="mt-3" disabled={confirm !== "DELETE"} onClick={del}>Delete account</Button></div></Card>
    </div>
  );
}
