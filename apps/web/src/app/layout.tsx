import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { dirOf } from "@/i18n/config";
import { getT } from "@/i18n/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: "TRAIL Intelligence — Learn AI. Apply AI. Lead with AI.",
  description: "Measure, develop and demonstrate practical AI capabilities.",
};

const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t||'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  return (
    <html lang={locale} dir={dirOf(locale)} data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${grotesk.variable} ${jb.variable} ${arabic.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-blue focus:px-3 focus:py-2 focus:text-white">{t("Skip to content")}</a>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
