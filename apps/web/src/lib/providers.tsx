"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/provider";
import type { Locale } from "@/i18n/config";

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } }));
  return (
    <QueryClientProvider client={qc}>
    <I18nProvider locale={locale}>
      {children}
      <Toaster theme="system" position="bottom-right" toastOptions={{ style: { background: "var(--elevated)", color: "var(--text)", border: "1px solid var(--border)" } }} />
    </I18nProvider>
    </QueryClientProvider>
  );
}
