"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Five languages requested: the original Traditional Chinese content plus
// AI-translated Simplified Chinese / English / Japanese / Korean — matching
// the reduced language set (dropping French/Spanish) used on the sibling
// AS studio homepage's language switcher. "zh-Hant" is the original text
// already written directly into each section, not a translated copy.
export type LangCode = "zh-Hant" | "zh-Hans" | "en" | "ja" | "ko";

export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "zh-Hant", label: "中文（繁體）" },
  { code: "zh-Hans", label: "中文（简体）" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>("zh-Hant");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
