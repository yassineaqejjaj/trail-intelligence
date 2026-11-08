import Link from "next/link";
import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="glow flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-6 flex items-center gap-2.5"><Logo /><span className="h text-lg font-semibold">TRAIL <span className="font-medium text-fg2">Intelligence</span></span></Link>
      <main id="main" className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-7">{children}</main>
    </div>
  );
}
