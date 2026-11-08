"use client";
import clsx from "clsx";
import { Award, BarChart3, BookOpenCheck, Building2, ClipboardCheck, FlaskConical, GraduationCap, LayoutDashboard, LogOut, Moon, Network, PanelLeftClose, PanelLeftOpen, Route, Search, Settings, Sun, UserCircle2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { CommandPalette, type Cmd } from "./command-palette";
import { ErrorState, Loading, Logo } from "./ui";

type Item = { href: string; label: string; icon: typeof Award; roles?: string[] };
const NAV: { group: string; items: Item[] }[] = [
  { group: "Learn", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { href: "/skills", label: "Skills graph", icon: Network },
    { href: "/paths", label: "Learning paths", icon: Route }, { href: "/practice", label: "Practice lab", icon: FlaskConical },
    { href: "/assessments", label: "Assessments", icon: ClipboardCheck }, { href: "/profile", label: "Profile", icon: UserCircle2 } ] },
  { group: "Trainer", items: [
    { href: "/trainer", label: "Trainer studio", icon: GraduationCap, roles: ["trainer", "platform_admin"] },
    { href: "/trainer/exercises", label: "Exercises", icon: BookOpenCheck, roles: ["trainer", "platform_admin"] },
    { href: "/trainer/reviews", label: "Review queue", icon: Award, roles: ["trainer", "platform_admin"] } ] },
  { group: "Enterprise", items: [
    { href: "/enterprise", label: "Overview", icon: Building2, roles: ["org_admin", "platform_admin"] },
    { href: "/enterprise/teams", label: "Teams", icon: Users, roles: ["org_admin", "platform_admin"] },
    { href: "/enterprise/skills", label: "Skills intelligence", icon: BarChart3, roles: ["org_admin", "platform_admin"] },
    { href: "/enterprise/programs", label: "Programs", icon: Route, roles: ["org_admin", "platform_admin"] } ] },
];

function flipTheme() {
  const el = document.documentElement;
  const next = el.dataset.theme === "light" ? "dark" : "light";
  el.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
}

export function Shell({ children }: { children: React.ReactNode }) {
  const me = useMe();
  const path = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a persisted UI preference after hydration
  useEffect(() => { try { setCollapsed(localStorage.getItem("nav") === "1"); } catch {} }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    if (me.isSuccess && !me.data) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (me.data && !me.data.onboarding_completed && path !== "/onboarding") router.replace("/onboarding");
  }, [me.isSuccess, me.data, path, router]);

  const toggleTheme = flipTheme;
  const logout = async () => { await api("/auth/logout", { method: "POST" }); qc.clear(); router.push("/"); toast.success("Signed out"); };

  if (me.isError) return <div className="p-8"><ErrorState error={me.error} retry={() => me.refetch()} /></div>;
  if (me.isLoading || !me.data) return <div className="p-8"><Loading /></div>;
  const user = me.data;
  const groups = NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(user.role)) })).filter((g) => g.items.length);
  const cmds: Cmd[] = [...groups.flatMap((g) => g.items.map((i) => ({ label: `Go to ${i.label}`, run: () => router.push(i.href) }))),
    { label: "Go to Settings", run: () => router.push("/settings") }, { label: "Toggle theme", run: toggleTheme }, { label: "Sign out", run: logout }];

  return (
    <div className="flex min-h-screen">
      <nav aria-label="Primary" className={clsx("sticky top-0 flex h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width]", collapsed ? "w-[68px]" : "w-[248px]")}>
        <div className="flex h-16 items-center justify-between px-3">
          <Link href="/dashboard" aria-label="TRAIL Intelligence home" className="flex items-center gap-2.5 px-1"><Logo />{!collapsed && <span className="h text-base font-semibold">TRAIL <span className="font-medium text-fg2">Intelligence</span></span>}</Link>
          <button onClick={() => { setCollapsed(!collapsed); try { localStorage.setItem("nav", collapsed ? "0" : "1"); } catch {} }} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="rounded-md p-1 text-muted hover:text-fg">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-2 py-2">
          {groups.map((g) => (
            <div key={g.group}>{!collapsed && <p className="lab px-2.5 pb-1.5">{g.group}</p>}
              {g.items.map((i) => { const active = path === i.href || (i.href.length > 10 && path.startsWith(i.href + "/")) || (i.href === "/practice" && path.startsWith("/practice"));
                return <Link key={i.href} href={i.href} title={i.label} aria-current={active ? "page" : undefined} className={clsx("flex items-center gap-3 min-h-9 rounded-lg px-2.5 text-[13.5px] font-medium", active ? "bg-elevated text-fg shadow-[inset_0_0_0_1px_var(--border)]" : "text-fg2 hover:bg-elevated hover:text-fg")}>
                  <i.icon className="h-4 w-4 shrink-0" />{!collapsed && i.label}</Link>; })}</div>))}
        </div>
        <div className="space-y-1 border-t border-line p-2">
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-fg2 hover:bg-elevated hover:text-fg" title="Settings"><Settings className="h-4 w-4" />{!collapsed && "Settings"}</Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-fg2 hover:bg-elevated hover:text-fg" title="Sign out"><LogOut className="h-4 w-4" />{!collapsed && "Sign out"}</button>
        </div>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-line bg-bg/85 px-8 backdrop-blur">
          <button onClick={() => setPalette(true)} className="flex min-h-10 w-full max-w-[440px] items-center gap-2 rounded-[10px] border border-line bg-elevated px-3 text-sm text-muted hover:border-line2">
            <Search className="h-4 w-4" /> Search skills, exercises, paths… <span className="ml-auto flex gap-1"><kbd className="kbd">⌘</kbd><kbd className="kbd">K</kbd></span></button>
          <div className="flex-1" />
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-md p-2 text-fg2 hover:bg-elevated"><Sun className="hidden h-4 w-4 [[data-theme=dark]_&]:block" /><Moon className="h-4 w-4 [[data-theme=dark]_&]:hidden" /></button>
          <Link href="/profile" aria-label="Profile and Skills Passport" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line2 bg-elevated text-xs font-semibold" >{(user.full_name || user.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join("")}</Link>
        </header>
        <main id="main" className="rise mx-auto w-full max-w-[1240px] flex-1 p-8">{children}</main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={cmds} />
    </div>
  );
}
