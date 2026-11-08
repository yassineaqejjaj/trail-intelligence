import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LANG_COOKIE, type Locale, isLocale } from "./config";
import { DICT } from "./dict";
import { translate, type Vars } from "./translate";

export async function getLocale(): Promise<Locale> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLocale(c)) return c;
  const al = (await headers()).get("accept-language") ?? "";
  for (const part of al.split(",")) { const code = part.split(";")[0].trim().slice(0, 2).toLowerCase(); if (isLocale(code)) return code; }
  return DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: (key: string, vars?: Vars) => translate(DICT, locale, key, vars) };
}
