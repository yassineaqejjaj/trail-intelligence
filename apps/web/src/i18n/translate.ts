import type { Locale } from "./config";

export type Dict = { fr: Record<string, string>; ar: Record<string, string> };
export type Vars = Record<string, string | number>;

/** English text is the key. Missing translation → the English key itself. Placeholders: {name}. */
export function translate(dict: Dict, locale: Locale, key: string, vars?: Vars): string {
  const raw = locale === "en" ? key : dict[locale][key] ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : raw;
}
