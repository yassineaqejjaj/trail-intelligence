"use client";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={`inline-flex items-center gap-1.5 text-fg2 ${className}`}>
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{t("Language")}</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="min-h-9 rounded-[10px] border border-line bg-elevated px-2 text-sm text-fg">
        {LOCALES.map((l) => <option key={l} value={l} lang={l}>{LOCALE_LABEL[l]}</option>)}
      </select>
    </label>
  );
}
