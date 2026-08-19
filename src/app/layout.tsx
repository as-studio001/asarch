import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import IntroLoader from "@/components/IntroLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Matches the existing subpage typography convention (from the ASstudio
// prototype): headings use Noto Serif TC weight 600. 300 added for the
// manifesto's lighter-weight subtitle.
const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["300", "600"],
  // "chinese-traditional" isn't a valid next/font subset for this family —
  // CJK glyphs are always included regardless of `subsets`; only additional
  // Latin-script ranges are selectable, which is what's needed here since
  // this font also renders Latin text (English manifesto/chapter copy).
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "原型結構 AS. studio",
  description: "Structure is not a constraint, but a design tool.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IntroLoader />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
