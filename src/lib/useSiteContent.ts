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

// SECTION 1（首頁最上方全螢幕大圖）疊在照片上的兩行文字設定——底圖跟
// 光線遮罩效果本身不在這份內容裡，是版型固定的，後台也刻意不開放編輯。
// 後台是用視覺化編輯器（在預覽畫面上直接拖曳位置／拖曳縮放字體，其餘
// 參數用滑塊調）寫這份資料，細節見 HeroText.tsx：offsetX/offsetY 是
// 拖曳結束當下讀到的絕對像素位置（"123.40px" 這種字串）、scale 是拖曳
// 縮放手把算出來的單一縮放倍率（兩行文字一起等比縮放，不是各自的
// 字級）。所有欄位都選填：後台的 hero.json 讀不到，或某個欄位是空的，
// HeroText.tsx 都會退回它自己內建的預設值，不會讓這個區塊跑版或空白。
export interface HeroContent {
  line1?: string;
  line1Weight?: string;
  line1LetterSpacing?: number;
  line2?: string;
  line2Weight?: string;
  line2LetterSpacing?: number;
  lineGap?: number;
  scale?: number;
  offsetX?: string;
  offsetY?: string;
}

export interface SiteContent {
  hero: HeroContent | null;
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

// heroPhoto/mainPhoto/thumbnails (and the hamburger menu's case thumbnails)
// are all full Internal-Pages image URLs. On first paint every one of these
// still shows this repo's own hardcoded /photos/ fallback (see chapterImg()
// in page.tsx) so the homepage is never blank; once this hook's fetch
// resolves, every one of those images gets swapped to the fetched URL —
// which means re-downloading the same photo a second time from scratch.
// Caching the last-fetched result in sessionStorage lets a repeat visit
// (reload, back button, another tab in the same session) start from the
// real CMS content immediately, before the network round trip even
// finishes — the <Image> never renders the local fallback in the first
// place, so there's nothing to swap and nothing to re-download.
function cacheKeyFor(name: string) {
  return `asarch-site-content:${name}`;
}

function readCache<T>(name: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(cacheKeyFor(name));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(name: string, data: T | null) {
  if (typeof window === "undefined" || data == null) return;
  try {
    window.sessionStorage.setItem(cacheKeyFor(name), JSON.stringify(data));
  } catch {
    /* storage full/blocked — caching is a nice-to-have, not fatal */
  }
}

export interface CaseLink {
  label: string;
  href: string;
}

export interface GroupedCaseLink {
  href: string;
  // Full Lang5 label, not the flat single-language string case-links.json
  // itself carries — see the comment on useCaseLinks() below for where
  // this actually comes from.
  label: Lang5;
  // True when this case is the first one belonging to a chapter different
  // from the item right before it — Header uses this to draw a divider
  // between chapters' cases, never before the very first case overall.
  isGroupStart: boolean;
  // "CH {chapter}.{item}" — chapter is 1-indexed position within
  // HAMBURGER_CHAPTERS, item is 1-indexed position within that chapter's
  // own group of cases. Undefined for a case-links.json entry that
  // couldn't be matched to any of the 3 chapters (see the fallback loop
  // below) — there's no chapter number to show for those.
  chNumber?: string;
}

interface CaseLinksContent {
  links: CaseLink[];
}

// Same 3 chapters as admin/index.html's CASE_CARD_CHAPTERS filtered to
// hamburger:true, in the order the divider grouping below should show
// them — 原型數位 is excluded here too (its cases don't go in the
// hamburger menu, same as the admin side).
const HAMBURGER_CHAPTERS = ["chapter-restore", "chapter-exhibit", "chapter-detail", "chapter-digital"];

// Feeds Header's hamburger menu. Not hand-edited in the admin — Internal-
// Pages regenerates content/site/case-links.json straight from whatever
// cases currently exist under content/projects/ every time one is saved or
// deleted (see admin/index.html's regenerateCaseLinksManifest()), so this
// list always mirrors "建築案例" 1:1 with zero extra editing step. That file
// itself is a flat list ordered alphabetically by project slug, each entry
// carrying only a single-language `label` string — it has no notion of
// which chapter a case belongs to, and no per-language text. Both are
// reconstructed here by cross-referencing each of the 3 chapters' own
// `cases` arrays (already fetched elsewhere via useSiteContent, but kept as
// a separate small fetch here too, same reasoning as before: Header
// shouldn't have to pull in all 5 chapter/declaration files just for this)
// — those DO carry a full Lang5 `label` per case, which is what actually
// gets used; case-links.json's own flat label is only a membership/matching
// key, and a last-resort display fallback for an entry that isn't in any
// of the 3 chapters (see the loop after this one).
export function useCaseLinks(): GroupedCaseLink[] | null {
  const [links, setLinks] = useState<GroupedCaseLink[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchJson<CaseLinksContent>("case-links"),
      ...HAMBURGER_CHAPTERS.map((name) => fetchJson<ChapterContent>(name)),
    ]).then(([data, ...chapters]) => {
      if (cancelled || !data?.links?.length) return;
      const byHref = new Map(data.links.map((l) => [l.href, l]));
      const used = new Set<string>();
      const result: GroupedCaseLink[] = [];
      chapters.forEach((chapter, chapterIdx) => {
        let groupStarted = false;
        let itemIdx = 0;
        (chapter?.cases || []).forEach((c) => {
          if (!byHref.has(c.href) || used.has(c.href)) return;
          used.add(c.href);
          itemIdx += 1;
          result.push({
            href: c.href,
            label: c.label,
            isGroupStart: result.length > 0 && !groupStarted,
            chNumber: `CH ${chapterIdx + 1}.${itemIdx}`,
          });
          groupStarted = true;
        });
      });
      // Anything in case-links.json not accounted for by the 3 chapters
      // above (shouldn't normally happen — that file is itself derived
      // from these same chapters — but surface it instead of silently
      // dropping a menu entry if the two ever fall out of sync). No Lang5
      // data available for these, so the same flat string repeats across
      // every language rather than leaving some languages blank.
      data.links.forEach((l) => {
        if (used.has(l.href)) return;
        const flat: Lang5 = { "zh-Hant": l.label, "zh-Hans": l.label, en: l.label, ja: l.label, ko: l.label };
        result.push({ href: l.href, label: flat, isGroupStart: result.length > 0 });
      });
      setLinks(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return links;
}

export interface ExtraChapter {
  slug: string;
  content: ChapterContent;
}

interface ExtraChaptersIndex {
  chapters: string[];
}

// 除了首頁那 4 個手工調校捲動效果的固定章節之外，之後在 Internal-Pages
// 後台新增的章節都走這份清單——後台存檔時會把 content/site/extra-
// chapters.json 更新成目前所有自訂章節的檔名，這裡抓這份索引、再逐一
// 抓每個章節自己的 JSON。新章節統一用 GenericChapterSection 這個簡化
// 版型顯示，不會有原本 4 個章節那種客製化捲動效果（那是手工調校、
// 沒辦法變成「後台自己新增就好」的模板）。
export function useExtraChapters(): ExtraChapter[] {
  const [chapters, setChapters] = useState<ExtraChapter[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchJson<ExtraChaptersIndex>("extra-chapters").then(async (index) => {
      if (cancelled || !index?.chapters?.length) return;
      const results = await Promise.all(
        index.chapters.map(async (slug) => {
          const content = await fetchJson<ChapterContent>(slug);
          return content ? { slug, content } : null;
        })
      );
      if (!cancelled) {
        setChapters(results.filter((c): c is ExtraChapter => c !== null));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return chapters;
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({
    hero: null,
    declaration: null,
    restore: null,
    detail: null,
    exhibit: null,
    digital: null,
  });

  useEffect(() => {
    let cancelled = false;
    const cached = readCache<SiteContent>("all-chapters");
    if (cached) setContent(cached);
    Promise.all([
      fetchJson<HeroContent>("hero"),
      fetchJson<DeclarationContent>("declaration"),
      fetchJson<ChapterContent>("chapter-restore"),
      fetchJson<ChapterContent>("chapter-detail"),
      fetchJson<ChapterContent>("chapter-exhibit"),
      fetchJson<ChapterContent>("chapter-digital"),
    ]).then(([hero, declaration, restore, detail, exhibit, digital]) => {
      if (cancelled) return;
      const next = { hero, declaration, restore, detail, exhibit, digital };
      setContent(next);
      writeCache("all-chapters", next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
