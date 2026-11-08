export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LANG_COOKIE = "lang";
export const LOCALE_LABEL: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };
export const dirOf = (l: Locale): "ltr" | "rtl" => (l === "ar" ? "rtl" : "ltr");
export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// BCP-47 tags for Intl formatting (Latin digits for Arabic keep numbers consistent with the data)
export const INTL_TAG: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-u-nu-latn" };
