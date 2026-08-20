"use client";

import { useEffect, useState } from "react";
import type { LangCode } from "@/lib/i18n";

// The "主網站內容" CMS collection lives in the Internal-Pages repo (it
// already has a working Decap CMS + Netlify Identity setup; asarch doesn't
// need its own). Editors change the declaration/chapter text and case
// cards there; this hook just fetches the published JSON at runtime, same
// way Internal-Pages' own render.js fetches content/projects/<slug>.json.
// Falls back to whatever the caller already has (the existing hardcoded
// copy in translations.ts/page.tsx) until the fetch resolves, and forever
// if it fails — so a network hiccup never blanks the homepage.
const SITE_CONTENT_BASE = "https://as-studio001.github.io/Internal-Pages/content/site";

export type Lang5 = Record<LangCode, string>;

export interface SiteCase {
  image: string;
  href: string;
  label: Lang5;
}

export interface ChapterContent {
  title: Lang5;
  description: Lang5;
  cases?: SiteCase[];
  heroPhoto?: string;
  mainPhoto?: string;
  thumbnails?: string[];
}

export interface DeclarationContent {
  headline: Lang5[];
  paragraphs: Lang5[];
}

export interface SiteContent {
  declaration: DeclarationContent | null;
  restore: ChapterContent | null;
  detail: ChapterContent | null;
  exhibit: ChapterContent | null;
  digital: ChapterContent | null;
}

async function fetchJson<T>(name: string): Promise<T | null> {
  try {
    const res = await fetch(`${SITE_CONTENT_BASE}/${name}.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({
    declaration: null,
    restore: null,
    detail: null,
    exhibit: null,
    digital: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchJson<DeclarationContent>("declaration"),
      fetchJson<ChapterContent>("chapter-restore"),
      fetchJson<ChapterContent>("chapter-detail"),
      fetchJson<ChapterContent>("chapter-exhibit"),
      fetchJson<ChapterContent>("chapter-digital"),
    ]).then(([declaration, restore, detail, exhibit, digital]) => {
      if (cancelled) return;
      setContent({ declaration, restore, detail, exhibit, digital });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
