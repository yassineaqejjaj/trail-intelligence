"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } }));
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster theme="system" position="bottom-right" toastOptions={{ style: { background: "var(--elevated)", color: "var(--text)", border: "1px solid var(--border)" } }} />
    </QueryClientProvider>
  );
}
