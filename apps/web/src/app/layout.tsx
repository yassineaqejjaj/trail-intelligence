import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "TRAIL Intelligence — Learn AI. Apply AI. Lead with AI.",
  description: "Measure, develop and demonstrate practical AI capabilities.",
};

const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t||'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${grotesk.variable} ${jb.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-blue focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
