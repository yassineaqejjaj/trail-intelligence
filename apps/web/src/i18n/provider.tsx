"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { INTL_TAG, LANG_COOKIE, type Locale, dirOf } from "./config";
import { DICT } from "./dict";
import { translate, type Vars } from "./translate";

type Ctx = { locale: Locale; dir: "ltr" | "rtl"; t: (key: string, vars?: Vars) => string; setLocale: (l: Locale) => void; fmtDate: (d: string | Date, o?: Intl.DateTimeFormatOptions) => string; fmtNum: (n: number) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter(), qc = useQueryClient();
  const setLocale = useCallback((l: Locale) => {
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    // Persist on the account too (best effort; ignored when signed out).
    fetch("/api/v1/users/me", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json", "X-Lang": l }, body: JSON.stringify({ locale: l }) }).catch(() => {});
    qc.invalidateQueries(); // API content is localised server-side: refetch everything
    router.refresh();
  }, [router, qc]);
  const value = useMemo<Ctx>(() => ({
    locale, dir: dirOf(locale), setLocale,
    t: (key, vars) => translate(DICT, locale, key, vars),
    fmtDate: (d, o) => new Date(d).toLocaleDateString(INTL_TAG[locale], o),
    fmtNum: (n) => new Intl.NumberFormat(INTL_TAG[locale]).format(n),
  }), [locale, setLocale]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside I18nProvider");
  return c;
}
export const useT = () => useI18n().t;
