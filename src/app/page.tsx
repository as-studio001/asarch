"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ParticleImage from "@/components/originkit/ui/svgparticles";
import RotatingGlobe from "@/components/originkit/ui/RotatingGlobe";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryOverlay from "@/components/GalleryOverlay";
import CaseCard from "@/components/CaseCard";
import { useLanguage } from "@/lib/i18n";
import { useSiteContent } from "@/lib/useSiteContent";
import {
  manifestoHeadlineLines,
  manifestoMotto,
  manifestoParagraphs,
  chapter01Title,
  chapter02Title,
  chapter03Title,
  restoreSliderLabel,
  detailSliderLabel,
  exhibitSliderLabel,
  restoreDescription,
  detailDescription,
  exhibitDescription,
  caseLabels,
} from "@/content/translations";

// Raw asset paths (unlike next/link) aren't auto-prefixed with basePath for
// next/image, so we prepend it ourselves — see next.config.ts.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Coordinates are in the hero photo's own pixel space (3840x2444, matching
// public/photos/hero-panorama.jpg) so they line up with the photo at any
// screen size via the SVG's preserveAspectRatio="xMidYMid slice" (same
// crop-to-fill behavior as the photo's object-cover).

// A flat horizontal line at the brick/white-wall junction — everything below
// it fades; above it (roof + brick) always shows normally.
const FADE_LINE_BASE_Y = 1300;
const ASSET_WIDTH = 3840;
const ASSET_HEIGHT = 2444;
// Raised 4cm from the original line — see FADE_LINE_Y computation below for
// how a physical "cm" is converted into this image's own pixel space.
const FADE_LINE_SHIFT_CM = 4;
const CSS_PX_PER_CM = 96 / 2.54;

// The light beam crossing the wall — traced from a user-annotated reference
// photo (red line marking the beam) converted into this photo's pixel space
// via a scale/offset calibrated by rendering known reference points at the
// same viewport and measuring exactly where they land on screen. Excluded
// from the fade via a mask cutout so it stays fully lit even below the line.
// Shifted +50px right total (+20, then +30 more), and narrowed 10px
// (5px off each edge) per adjustment.
const BEAM_POLYGON =
  "2051,892 2074,962 2102,1031 2126,1101 2152,1170 2178,1240 2206,1309 " +
  "2229,1379 2255,1449 2281,1518 2307,1588 2333,1657 2359,1727 2384,1796 " +
  "2410,1866 2436,1936 2462,2005 2488,2075 2539,2144 2588,2124 2554,2075 " +
  "2526,2005 2503,1936 2475,1866 2447,1796 2421,1727 2395,1657 2367,1588 " +
  "2344,1518 2316,1449 2288,1379 2262,1309 2236,1240 2208,1170 2185,1101 " +
  "2157,1031 2129,962 2103,892";

// Same beam, continuing from the wall onto the floor tiles — same
// annotated-reference trace, split where the beam's path visibly kinks
// (asset y ~2144) at the wall/floor junction. Shifted +50px right / narrowed
// 10px (matching the wall segment), then the floor segment shifted another
// +30px right and 30px up on its own, then its right edge trimmed 10px
// narrower. The two junction anchors (shared with the wall polygon above,
// keeping the weld gapless) were then nudged down independently: left
// anchor +20px, right anchor +15px, then the right anchor another
// +10px down / -5px left.
const FLOOR_BEAM_POLYGON =
  "2539,2144 2613,2184 2719,2253 2828,2323 2970,2414 3073,2414 2923,2323 " +
  "2808,2253 2693,2184 2588,2124";

// How much extra scroll distance (in viewport heights) it takes to fully
// reveal layers 3+4 after the hero pins in place.
const REVEAL_VH = 1;

// Section 4 thumbnail carousel — cycles through all 6 candidate photos;
// the main photo stays fixed regardless.
const RESTORE_THUMBS = [
  "restore-thumb-1.jpg",
  "restore-thumb-2.jpg",
  "restore-thumb-3.jpg",
  "restore-thumb-4.jpg",
  "restore-thumb-5.jpg",
  "restore-thumb-6.jpg",
  "restore-thumb-7.jpg",
  "restore-thumb-8.jpg",
  "restore-thumb-9.jpg",
  "restore-thumb-10.jpg",
  "restore-thumb-11.jpg",
];
const RESTORE_THUMB_INTERVAL_MS = 2000;

// Section 5 (Chapter 02) thumbnail carousel — same template as section 4.
const DETAIL_THUMBS = [
  "detail-thumb-1.jpg",
  "detail-thumb-2.jpg",
  "detail-thumb-3.jpg",
  "detail-thumb-4.jpg",
  "detail-thumb-5.jpg",
  "detail-thumb-6.jpg",
  "detail-thumb-7.jpg",
  "detail-thumb-8.jpg",
  "detail-thumb-9.jpg",
  "detail-thumb-10.jpg",
  "detail-thumb-11.jpg",
  "detail-thumb-12.jpg",
  "detail-thumb-13.jpg",
];
const DETAIL_THUMB_INTERVAL_MS = 2000;

// Section 7 (Chapter 03) thumbnail carousel — same template as section 4/5,
// just with all 9 photos supplied for this chapter instead of 6.
const EXHIBIT_THUMBS = [
  "exhibit-thumb-1.jpg",
  "exhibit-thumb-2.jpg",
  "exhibit-thumb-3.jpg",
  "exhibit-thumb-4.jpg",
  "exhibit-thumb-5.jpg",
  "exhibit-thumb-6.jpg",
  "exhibit-thumb-7.jpg",
  "exhibit-thumb-8.jpg",
];
const EXHIBIT_THUMB_INTERVAL_MS = 2000;

// Section 9 (Chapter 04, 原型數位) thumbnail carousel — same template as
// the other chapters.
const DIGITAL_THUMBS: string[] = [
  "digital-thumb-1.jpg",
  "digital-thumb-2.jpg",
  "digital-thumb-3.jpg",
  "digital-thumb-4.jpg",
];
const DIGITAL_THUMB_INTERVAL_MS = 2000;

// ADA建築展 masonry-gallery photos.
const ADA_GALLERY = [
  "gallery-ada-1.jpg",
  "gallery-ada-2.jpg",
  "gallery-ada-3.jpg",
  "gallery-ada-4.jpg",
  "gallery-ada-5.jpg",
  "gallery-ada-6.jpg",
  "gallery-ada-7.jpg",
  "gallery-ada-8.jpg",
  "gallery-ada-9.jpg",
  "gallery-ada-10.jpg",
  "gallery-ada-11.jpg",
  "gallery-ada-12.jpg",
  "gallery-ada-13.jpg",
];

// 構竹林鐵 masonry-gallery photos.
const BAMBOO_GALLERY = Array.from(
  { length: 26 },
  (_, i) => `gallery-bamboo-${i + 1}.jpg`
);

// 台北藝廊展 masonry-gallery photos.
const TAIPEI_GALLERY = Array.from(
  { length: 23 },
  (_, i) => `gallery-taipei-${i + 1}.jpg`
);

// Section 4.5 case cards (replaces the old restore "MORE" popup — cases
// now get their own section instead of a modal). Images are placeholders
// (reusing existing thumbnails) until real per-case photos are supplied.
const RESTORE_CASES = [
  {
    key: "restore-xinyi",
    href: "https://as-studio001.github.io/Internal-Pages/",
    image: "case-restore-xinyi.jpg",
  },
  {
    key: "restore-woodyard",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=582351",
    image: "case-restore-woodyard.jpg",
  },
  {
    key: "restore-office",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=506003",
    image: "case-restore-office.jpg",
  },
];

// Section 7.5 case cards (same treatment as RESTORE_CASES/Section 4.5, now
// applied to 原型展覽). Three of the five open the masonry GalleryOverlay
// instead of linking out — same split the old exhibit MORE popup had.
const EXHIBIT_CASES = [
  {
    key: "exhibit-tnhs",
    href: "https://www.tnhs.com.tw/",
    image: "case-exhibit-tnhs.jpg",
  },
  {
    key: "exhibit-ada",
    gallery: ADA_GALLERY,
    image: "gallery-ada-1.jpg",
  },
  {
    key: "exhibit-bamboo",
    gallery: BAMBOO_GALLERY,
    image: "case-exhibit-bamboo.jpg",
  },
  {
    key: "exhibit-taipei",
    gallery: TAIPEI_GALLERY,
    image: "gallery-taipei-1.jpg",
  },
  // 台南建築三年展 cancelled for now — drop back in with `{ key:
  // "exhibit-triennial", href: "https://asas2026.wixsite.com/mysite/...",
  // image: "..." }` (plus a matching entry in caseLabels) if it comes back.
];

// Section 5.5 case cards (same treatment as RESTORE_CASES/EXHIBIT_CASES —
// this replaces the last remaining MORE popup, so MoreOverlay/MORE_LINKS/
// openMore are gone now). Links still placeholders pending real ones.
const DETAIL_CASES = [
  {
    key: "detail-proto1",
    href: "https://asstudio029.wixsite.com/ashouse1",
    image: "case-detail-proto1.jpg",
  },
  {
    key: "detail-yizai",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=609194",
    image: "case-detail-yizai.jpg",
  },
];

// Section 9.5 case cards (same treatment as the other chapters' CASES
// bands). Unlike its EXHIBIT_CASES entry, "構竹林鐵" here links straight
// out rather than opening BAMBOO_GALLERY, per explicit request.
const DIGITAL_CASES = [
  {
    key: "digital-woodyard",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=582351",
    image: "case-digital-woodyard.jpg",
  },
  {
    key: "digital-bamboo",
    href: "https://astaiwan.wixsite.com/bamboo-newfield",
    image: "case-digital-bamboo.jpg",
  },
  {
    key: "digital-future",
    href: "https://www.as-structure.com/",
    image: "case-digital-future.jpg",
  },
  {
    key: "digital-proto1",
    href: "https://asstudio029.wixsite.com/ashouse1",
    image: "case-digital-proto1.jpg",
  },
  {
    key: "digital-xinyi",
    href: "https://asas2026.wixsite.com/mysite/%E6%96%B0%E7%94%9F%E5%A0%B4%E5%9F%9F",
    image: "case-digital-xinyi.jpg",
  },
];

// Chapter photo parallax (shared by Chapter 01 and 02): max vertical drift
// (px) and how much of the section's distance from viewport-center
// converts into that drift.
const CHAPTER01_PARALLAX_MAX_PX = 28;
const CHAPTER01_PARALLAX_FACTOR = 0.08;


export default function Home() {
  const { lang } = useLanguage();
  // 主網站宣言／章節文字／案例卡片可以在 Internal-Pages 的後台編輯，
  // 這裡在瀏覽器端抓取最新內容；抓不到（離線、還沒設定過）就 fallback
  // 回原本寫死在 translations.ts/page.tsx 裡的文字，畫面永遠不會空白。
  const siteContent = useSiteContent();
  const declarationHeadline = (i: 0 | 1) =>
    siteContent.declaration?.headline?.[i]?.[lang] ?? manifestoHeadlineLines[lang][i];
  const declarationParagraph = (i: 0 | 1 | 2 | 3) =>
    siteContent.declaration?.paragraphs?.[i]?.[lang] ?? manifestoParagraphs[lang][i];
  const restoreDesc = siteContent.restore?.description?.[lang] ?? restoreDescription[lang];
  const detailDesc = siteContent.detail?.description?.[lang] ?? detailDescription[lang];
  const exhibitDesc = siteContent.exhibit?.description?.[lang] ?? exhibitDescription[lang];
  const digitalDesc =
    siteContent.digital?.description?.[lang] ??
    "原型數位不是單純用數位工具，而是重新思考建築如何進入數位時代。從 BIM、參數化設計、AI、數位製造到資訊整合，我們將技術轉化為設計思考與工作方法。數位不是取代人的創意，而是讓想法更快被驗證、更精準地被實現。從設計圖面到資料庫、從模型到現場，我們全面使用Archicad、Rhino 試圖讓圖說與設計無縫接軌、甚至讓結構也同時一併完成。";
  const restoreCaseItems =
    siteContent.restore?.cases && siteContent.restore.cases.length
      ? siteContent.restore.cases.map((c) => ({
          key: c.href,
          image: c.image,
          href: c.href,
          label: c.label[lang] ?? c.label["zh-Hant"],
        }))
      : RESTORE_CASES.map((c) => ({ key: c.key, image: c.image, href: c.href, label: caseLabels[c.key][lang] }));
  const detailCaseItems =
    siteContent.detail?.cases && siteContent.detail.cases.length
      ? siteContent.detail.cases.map((c) => ({
          key: c.href,
          image: c.image,
          href: c.href,
          label: c.label[lang] ?? c.label["zh-Hant"],
        }))
      : DETAIL_CASES.map((c) => ({ key: c.key, image: c.image, href: c.href, label: caseLabels[c.key][lang] }));
  const digitalCaseItems =
    siteContent.digital?.cases && siteContent.digital.cases.length
      ? siteContent.digital.cases.map((c) => ({
          key: c.href,
          image: c.image,
          href: c.href,
          label: c.label[lang] ?? c.label["zh-Hant"],
        }))
      : DIGITAL_CASES.map((c) => ({ key: c.key, image: c.image, href: c.href, label: caseLabels[c.key][lang] }));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const particleWrapRef = useRef<HTMLDivElement>(null);
  const chapter01Ref = useRef<HTMLElement>(null);
  const [chapter01Offset, setChapter01Offset] = useState(0);
  const chapter02Ref = useRef<HTMLElement>(null);
  const [chapter02Offset, setChapter02Offset] = useState(0);
  const chapter03Ref = useRef<HTMLElement>(null);
  const [chapter03Offset, setChapter03Offset] = useState(0);
  const chapter04Ref = useRef<HTMLElement>(null);
  const [chapter04Offset, setChapter04Offset] = useState(0);
  const [restoreThumbIndex, setRestoreThumbIndex] = useState(0);
  const [detailThumbIndex, setDetailThumbIndex] = useState(0);
  const [exhibitThumbIndex, setExhibitThumbIndex] = useState(0);
  const [digitalThumbIndex, setDigitalThumbIndex] = useState(0);
  const [openGallery, setOpenGallery] = useState<string[] | null>(null);
  // Drives the hero particle effect's density/contrast boost below (see
  // the ParticleImage usage) — same lg (1024px) cutover used everywhere
  // else on the page for the mobile/tablet-safe layout. Starts false
  // (matches desktop) so SSR/first paint don't flash the boosted values.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  // 0 = just landed (only roof/beam + wall-above-boundary visible, rest
  // hidden under the fade), 1 = fully scrolled through (photo fully lit —
  // plants/furniture/glass wall/floor revealed).
  const [revealProgress, setRevealProgress] = useState(0);
  const [fadeLineY, setFadeLineY] = useState(FADE_LINE_BASE_Y);

  // The fade line's "move up 4cm" is a physical on-screen amount, so it has
  // to be converted from CSS px into the photo's own pixel space at the
  // photo's actual rendered scale — which depends on viewport size. This
  // photo (3840x2444, aspect ~1.57) is narrower than essentially every real
  // monitor/TV, so object-cover always scales it to match the viewport
  // WIDTH (cropping top/bottom) rather than the height — verified by
  // rendering known reference points and measuring where they land.
  useEffect(() => {
    const update = () => {
      const assetPxPerCssPx = ASSET_WIDTH / window.innerWidth;
      const shiftAssetPx = FADE_LINE_SHIFT_CM * CSS_PX_PER_CM * assetPxPerCssPx;
      setFadeLineY(FADE_LINE_BASE_Y - shiftAssetPx);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fadePath = `M 0,${fadeLineY} L 3840,${fadeLineY} L 3840,${ASSET_HEIGHT} L 0,${ASSET_HEIGHT} Z`;

  // Drives the layer reveal: the wrapper is REVEAL_VH taller than the
  // viewport, and the hero section is `sticky` so it stays pinned while
  // that extra height scrolls past. Progress = how far through that extra
  // distance we've scrolled.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const scrollableDistance = wrapper.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) {
        setRevealProgress(1);
        return;
      }
      const scrolled = -wrapper.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, scrolled / scrollableDistance));
      setRevealProgress(p);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Chapter 01 photo: a gentle parallax sway as the section scrolls through
  // the viewport. Offset is proportional to how far the section's center
  // sits from the viewport's center, clamped to a small max range so it
  // just drifts within its current spot rather than travelling far.
  useEffect(() => {
    const el = chapter01Ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = sectionCenter - viewportCenter;
      const offset = Math.max(
        -CHAPTER01_PARALLAX_MAX_PX,
        Math.min(CHAPTER01_PARALLAX_MAX_PX, distance * CHAPTER01_PARALLAX_FACTOR)
      );
      setChapter01Offset(offset);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Chapter 02 photo: same parallax sway as Chapter 01.
  useEffect(() => {
    const el = chapter02Ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = sectionCenter - viewportCenter;
      const offset = Math.max(
        -CHAPTER01_PARALLAX_MAX_PX,
        Math.min(CHAPTER01_PARALLAX_MAX_PX, distance * CHAPTER01_PARALLAX_FACTOR)
      );
      setChapter02Offset(offset);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Chapter 03 photo: same parallax sway as Chapter 01/02.
  useEffect(() => {
    const el = chapter03Ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = sectionCenter - viewportCenter;
      const offset = Math.max(
        -CHAPTER01_PARALLAX_MAX_PX,
        Math.min(CHAPTER01_PARALLAX_MAX_PX, distance * CHAPTER01_PARALLAX_FACTOR)
      );
      setChapter03Offset(offset);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Chapter 04 photo: same parallax sway as Chapter 01/02/03.
  useEffect(() => {
    const el = chapter04Ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = sectionCenter - viewportCenter;
      const offset = Math.max(
        -CHAPTER01_PARALLAX_MAX_PX,
        Math.min(CHAPTER01_PARALLAX_MAX_PX, distance * CHAPTER01_PARALLAX_FACTOR)
      );
      setChapter04Offset(offset);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Section 4 thumbnail: auto-advances every 2s; the prev/next arrows also
  // just move this same index, restarting the timer so it doesn't double up.
  useEffect(() => {
    const id = setInterval(() => {
      setRestoreThumbIndex((i) => (i + 1) % RESTORE_THUMBS.length);
    }, RESTORE_THUMB_INTERVAL_MS);
    return () => clearInterval(id);
  }, [restoreThumbIndex]);

  // Section 5 thumbnail: same auto-advance/nav pattern as section 4.
  useEffect(() => {
    const id = setInterval(() => {
      setDetailThumbIndex((i) => (i + 1) % DETAIL_THUMBS.length);
    }, DETAIL_THUMB_INTERVAL_MS);
    return () => clearInterval(id);
  }, [detailThumbIndex]);

  // Section 7 thumbnail: same auto-advance/nav pattern as section 4/5.
  useEffect(() => {
    const id = setInterval(() => {
      setExhibitThumbIndex((i) => (i + 1) % EXHIBIT_THUMBS.length);
    }, EXHIBIT_THUMB_INTERVAL_MS);
    return () => clearInterval(id);
  }, [exhibitThumbIndex]);

  const showPrevExhibitThumb = () =>
    setExhibitThumbIndex(
      (i) => (i - 1 + EXHIBIT_THUMBS.length) % EXHIBIT_THUMBS.length
    );
  const showNextExhibitThumb = () =>
    setExhibitThumbIndex((i) => (i + 1) % EXHIBIT_THUMBS.length);

  // Section 9 thumbnail: same auto-advance/nav pattern as the other
  // chapters. Length guards kept even now that DIGITAL_THUMBS is populated
  // — harmless, and they protect against a future modulo-by-zero if it's
  // ever emptied again.
  useEffect(() => {
    if (DIGITAL_THUMBS.length === 0) return;
    const id = setInterval(() => {
      setDigitalThumbIndex((i) => (i + 1) % DIGITAL_THUMBS.length);
    }, DIGITAL_THUMB_INTERVAL_MS);
    return () => clearInterval(id);
  }, [digitalThumbIndex]);

  const showPrevDigitalThumb = () => {
    if (DIGITAL_THUMBS.length === 0) return;
    setDigitalThumbIndex(
      (i) => (i - 1 + DIGITAL_THUMBS.length) % DIGITAL_THUMBS.length
    );
  };
  const showNextDigitalThumb = () => {
    if (DIGITAL_THUMBS.length === 0) return;
    setDigitalThumbIndex((i) => (i + 1) % DIGITAL_THUMBS.length);
  };

  const showPrevDetailThumb = () =>
    setDetailThumbIndex(
      (i) => (i - 1 + DETAIL_THUMBS.length) % DETAIL_THUMBS.length
    );
  const showNextDetailThumb = () =>
    setDetailThumbIndex((i) => (i + 1) % DETAIL_THUMBS.length);

  // Escape closes the photo gallery overlay, same as clicking the backdrop.
  useEffect(() => {
    if (!openGallery) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGallery(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openGallery]);

  const showPrevRestoreThumb = () =>
    setRestoreThumbIndex(
      (i) => (i - 1 + RESTORE_THUMBS.length) % RESTORE_THUMBS.length
    );
  const showNextRestoreThumb = () =>
    setRestoreThumbIndex((i) => (i + 1) % RESTORE_THUMBS.length);

  return (
    <>
    <Header />
    <div ref={wrapperRef} className="relative" style={{ height: `${100 + REVEAL_VH * 100}vh` }}>
      <section
        ref={sectionRef}
        className="sticky top-0 w-full h-screen overflow-hidden bg-black"
      >
        {/* Full-screen background photo — layers 1-4 (roof+beam, wall,
            plants/furniture/glass wall/outdoor, floor) are all baked into
            this one photo. The fade overlay below hides/reveals layers 3-4
            as the user scrolls, rather than these being separate image
            assets. */}
        <Image
          src={`${basePath}/photos/hero-panorama.jpg`}
          alt="原型建築全景"
          fill
          priority
          className="object-cover"
        />

        {/* Layer 2's own boundary fade (brick -> white wall) stays at full
            strength regardless of scroll — only the overall reveal of what's
            further below (layers 3-4) responds to revealProgress. */}
        <svg
          viewBox="0 0 3840 2444"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: 1 - revealProgress }}
        >
          <defs>
            <linearGradient
              id="heroFade"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={fadeLineY}
              x2="0"
              y2={fadeLineY + 980}
            >
              <stop offset="0" stopColor="black" stopOpacity="0" />
              <stop offset="0.25" stopColor="black" stopOpacity="0.22" />
              <stop offset="0.55" stopColor="black" stopOpacity="0.65" />
              <stop offset="0.8" stopColor="black" stopOpacity="0.92" />
              <stop offset="1" stopColor="black" stopOpacity="1" />
            </linearGradient>
            {/* Softens the line so the fade reads as a gradual dissolve
                rather than a hard-edged cut. */}
            <filter id="fadeEdgeSoften" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="45" />
            </filter>
            <filter id="beamCoreSoften" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="beamHaloSoften" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <mask id="heroFadeBeamCutout">
              <rect x="0" y="0" width="3840" height="2444" fill="white" />
              {/* Wide, faint halo first — softly reduces the fade in a broad
                  glow around the beam, like light scattering off the wall,
                  instead of the beam looking cut out of the dark. */}
              <polygon
                points={BEAM_POLYGON}
                fill="black"
                fillOpacity="0.55"
                filter="url(#beamHaloSoften)"
              />
              <polygon
                points={FLOOR_BEAM_POLYGON}
                fill="black"
                fillOpacity="0.55"
                filter="url(#beamHaloSoften)"
              />
              {/* Tighter core keeps the beam itself fully unfaded. */}
              <polygon points={BEAM_POLYGON} fill="black" filter="url(#beamCoreSoften)" />
              <polygon points={FLOOR_BEAM_POLYGON} fill="black" filter="url(#beamCoreSoften)" />
            </mask>
          </defs>
          <path
            d={fadePath}
            fill="url(#heroFade)"
            filter="url(#fadeEdgeSoften)"
            mask="url(#heroFadeBeamCutout)"
          />
        </svg>

        {/* SVG particle effect — 150% of the original half-size box, scaled
            from its top-left corner (kept fixed) growing right/down. The
            translateY can't stay a self-referential "-50%" (that's 50% of
            the element's OWN height, so it'd shift when height grows from
            h-1/2 to h-3/4) — replaced with the equivalent fixed "-25vh"
            (50% of the *original* h-1/2 box, computed against the h-screen
            parent) so the top edge lands in the exact same place. */}
        <div
          ref={particleWrapRef}
          className="absolute top-1/2 left-0 h-3/4 w-3/4"
          style={{ transform: "translate(1cm, calc(-25vh - 1cm))" }}
        >
          <ParticleImage
            width="100%"
            height="100%"
            hoverAreaScale={1.2}
            // Particles stay permanently assembled into the image instead
            // of roaming/scattering when the cursor leaves — hoverEnabled
            // only gates the assemble/scatter animation state, not the
            // repulsion "push away from cursor" effect (repulsionEnabled,
            // untouched below), so that sliding interactivity is unaffected.
            hoverEnabled={false}
            backgroundColor="transparent"
            // gapPerWidth scales the sampling gap with the canvas's own
            // CSS width (h-3/4 w-3/4 of the viewport), so particle density
            // relative to the rendered "原型 X 建築" text stays constant
            // regardless of screen size, instead of a fixed absolute gap
            // making wider screens read progressively denser/finer and
            // narrower ones progressively sparser (see gapPerWidth's
            // comment in svgparticles.tsx). 600 is calibrated so a ~1600px
            // viewport (this effect's box ≈ 1200px wide) lands on the same
            // gap the old fixed-gap desktop default used. minGap=1 just
            // floors it so extremely narrow screens never hit gap 0.
            particleCount={180}
            minGap={1}
            gapPerWidth={600}
            // Particles are drawn at the source image pixel's own alpha
            // (soft/anti-aliased edges read as partially transparent),
            // which left the white particles looking dim rather than
            // bright white — boosted across both mobile and desktop.
            alphaBoost={1.6}
            dropShadowFilter={
              isMobile
                ? "drop-shadow(0 0 1.5px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(0,0,0,0.85)) drop-shadow(0 0 6px rgba(0,0,0,0.5))"
                : undefined
            }
            imageConfig={{
              image: `${basePath}/originkit/banner.png`,
              mode: "fit",
              scale: 5,
              sizeUnit: "%",
              widthPct: 100,
              heightPct: 100,
            }}
          />
        </div>

        {/* Bottom-edge vignette — fades the last 4cm of the screen to
            black, independent of scroll, sitting above everything else
            (photo, wall fade, particles, beam) so the beam fades here too. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "4cm",
            background: "linear-gradient(to bottom, transparent, black)",
          }}
        />
      </section>
    </div>

    {/* Manifesto — matches the existing subpage type convention: Noto Serif
        TC for both lines now (headline weight 600, subtitle weight 300 —
        same family, lighter weight instead of the sans stack). */}
    <section className="flex items-center justify-center bg-black px-6 py-32 text-center sm:py-40">
      <div style={{ marginTop: "5cm" }}>
        <h2
          className="text-[1.5rem] leading-snug font-semibold text-white sm:text-[2.4rem]"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: "0.02em",
          }}
        >
          {declarationHeadline(0)}
          <br />
          {declarationHeadline(1)}
        </h2>
        <p
          className="mt-4 text-base text-white sm:text-lg"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            fontWeight: 300,
            letterSpacing: "0.06em",
            opacity: 0.55,
          }}
        >
          Structure is not a constraint, but a design tool.
        </p>
        <div
          className="mx-auto mt-10 max-w-2xl text-[1.05rem] leading-relaxed text-white sm:text-[1.2rem]"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            fontWeight: 300,
            letterSpacing: "0.04em",
            opacity: 0.75,
          }}
        >
          <p>{declarationParagraph(0)}</p>
          <p className="mt-4">{declarationParagraph(1)}</p>
          <p className="mt-4">
            {declarationParagraph(2)}
            <span className="ml-6">{manifestoMotto}</span>
          </p>
          <p className="mt-4">{declarationParagraph(3)}</p>
        </div>
      </div>
    </section>

    {/* Chapter 01 — photo fills the left ~72% of the screen, a solid black
        column holds the chapter label + title on the right, and a small
        page number sits in the bottom-right corner. Photo keeps its native
        aspect ratio (3200x1923) at 70vw wide instead of being cropped to
        fill the section height, and the title is allowed to overlap its
        edge. */}
    <section
      ref={chapter01Ref}
      className="relative flex w-full items-start overflow-hidden bg-black lg:h-screen lg:items-center"
    >
      <div
        // Below lg (1024px): fills the section edge-to-edge (h-full/w-full
        // make aspect-ratio a no-op — both dimensions are already
        // definite), so the photo covers the phone/tablet screen like a
        // normal full-bleed hero. At lg+: the original desktop sizing.
        // Below lg: width-driven — w-full + the aspect-ratio below (never
        // overridden by an explicit height here) scales the photo to the
        // screen's width with no cropping and no stretch. At lg+: the
        // original desktop sizing.
        className="relative w-full lg:w-[calc(83.20vh+40vw)]"
        style={{
          // Same photo, sized so its black top/bottom margin is exactly
          // half of the old 80vw-wide version: newWidth = 50vh*(imgW/imgH)
          // + 40vw (derived from halving "50vh - 24.04vw", the old margin).
          aspectRatio: "3200 / 1923",
          transform: `translateY(${chapter01Offset}px)`,
        }}
      >
        <Image
          src={`${basePath}/photos/chapter01.jpg`}
          alt="原型修復"
          fill
          className="object-cover"
        />
      </div>
      <div
        // Below lg: a safe bottom-left overlay with no fixed-cm math, so
        // it can never get pushed off a narrow screen. At lg+: the
        // original desktop position (right-anchored + 6cm nudge).
        className="absolute inset-x-6 bottom-10 z-10 flex flex-col items-start text-left lg:inset-x-auto lg:top-1/2 lg:right-[25%] lg:bottom-auto lg:translate-x-[6cm] lg:-translate-y-1/2"
      >
        <span
          className="text-xs text-white/60 sm:text-sm"
          style={{ letterSpacing: "0.3em" }}
        >
          CHAPTER
        </span>
        <h2
          className="mt-4 text-4xl leading-tight font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] whitespace-nowrap sm:text-6xl"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: "0.15em",
          }}
        >
          {chapter01Title[lang]}
        </h2>
      </div>
    </section>

    {/* Section 4 — featured-work slider layout (reference screenshot
        2026-08-06 145455). Left column: thumbnail carousel (cycles through
        all 6 candidate photos, auto-advancing every 2s or via the arrows),
        title, description. Right: the main photo, fixed (never changes),
        kept at its own native aspect ratio rather than cropped. Title/copy
        text are still placeholders pending real copy.
        Deliberately NOT h-screen (per explicit request, demo for 原型修復
        only) — sized to its own content like Section 4.5/CASES below it,
        otherwise the leftover dead space from forcing full-viewport height
        made the visual gap to CASES ~12.5cm instead of the intended 1cm
        (CASES's own top padding supplies that 1cm now that this section
        no longer pads out the rest of the screen). */}
    <section className="flex w-full flex-col items-start gap-10 bg-black px-[6%] pt-[9vh] lg:flex-row lg:gap-[8%]">
      <div className="flex w-full flex-col lg:w-[26%]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/10">
          {RESTORE_THUMBS.map((src, i) => (
            <Image
              key={src}
              src={`${basePath}/photos/${src}`}
              alt={`原型修復 縮圖 ${i + 1}`}
              fill
              className="object-cover transition-opacity duration-700"
              style={{ opacity: i === restoreThumbIndex ? 1 : 0 }}
              priority={i === 0}
            />
          ))}
        </div>
        <h3
          className="mt-8 text-lg text-white"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
        >
          {restoreSliderLabel[lang]}｜Restoration
        </h3>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-white/70">
          {restoreDesc}
        </p>
        <div className="mt-8 flex items-center gap-6 text-white/60">
          <button
            type="button"
            aria-label="上一張"
            onClick={showPrevRestoreThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一張"
            onClick={showNextRestoreThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fixed photo — kept at its native ratio (2600x1231) rather than
          cropped to a fixed box. Width scaled up so the photo's right edge
          sits exactly as far from the screen's right edge (6vw) as the
          thumbnail's left edge sits from the screen's left edge (6vw):
          section padding 6vw + left col 26%*88vw + gap 8%*88vw = 35.92vw
          left edge, so width = (100 - 6) - 35.92 = 58.08vw. */}
      <div className="flex w-full flex-col items-start lg:w-[58.08vw]">
        <div className="relative w-full" style={{ aspectRatio: "2600 / 1231" }}>
          <Image
            src={`${basePath}/photos/restore-main.jpg`}
            alt="原型修復"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>

    {/* Section 4.5 — replaces the old restore "MORE" popup: cases now get
        their own band instead of a modal, per explicit request. Demo for
        原型修復 only for now — same treatment to be applied to 原型細部/
        原型展覽 once this is approved. Deliberately NOT h-screen like the
        other bands — its content is much shorter than 100vh, and forcing
        full-viewport height left a huge dead gap below the cards before
        the next section; sized to its own content instead, with a fixed
        1cm gap to the sections above/below. */}
    <section className="flex w-full flex-col items-center gap-16 bg-black px-[6%] py-[1cm]">
      <span className="text-xs text-white/60" style={{ letterSpacing: "0.3em" }}>
        CASES
      </span>
      <div className="flex w-full flex-wrap items-start justify-center gap-x-[4%] gap-y-10">
        {restoreCaseItems.map((c) => (
          <CaseCard
            key={c.key}
            label={c.label}
            image={c.image}
            href={c.href}
            widthClass="w-[42%] lg:w-[26%]"
          />
        ))}
      </div>
    </section>

    {/* Chapter 02 — same template as Chapter 01, just swapping the photo,
        chapter number, and title. */}
    <section
      ref={chapter02Ref}
      className="relative flex w-full items-start overflow-hidden bg-black lg:h-screen lg:items-center"
    >
      <div
        // Below lg: width-driven — w-full + the aspect-ratio below (never
        // overridden by an explicit height here) scales the photo to the
        // screen's width with no cropping and no stretch. At lg+: the
        // original desktop sizing.
        className="relative w-full lg:w-[calc(83.20vh+40vw)]"
        style={{
          // Matched to Chapter 01's exact width (rather than its own
          // halved-margin width) since this photo read as too wide/full
          // otherwise — same formula as Chapter 01, aspect ratio here just
          // makes it render shorter instead.
          aspectRatio: "2263 / 1273",
          transform: `translateY(${chapter02Offset}px)`,
        }}
      >
        <Image
          src={`${basePath}/photos/chapter02.jpg`}
          alt="原型細部"
          fill
          className="object-cover"
        />
      </div>
      <div
        // Below lg: same safe bottom-left overlay as the other chapters.
        // At lg+: the original position — translate-y combines the old
        // "-50% translateY(10px)" two-step inline transform into one
        // calc() so it can live in a plain (breakpoint-gated) utility class.
        className="absolute inset-x-6 bottom-10 z-10 flex flex-col items-start text-left lg:inset-x-auto lg:top-1/2 lg:right-[25%] lg:bottom-auto lg:translate-x-[6cm] lg:translate-y-[calc(-50%+10px)]"
      >
        <span
          className="text-xs text-white/60 sm:text-sm"
          style={{ letterSpacing: "0.3em" }}
        >
          CHAPTER
        </span>
        <h2
          className="mt-4 text-4xl leading-tight font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] whitespace-nowrap sm:text-6xl"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: "0.15em",
          }}
        >
          {chapter02Title[lang]}
        </h2>
      </div>
    </section>

    {/* Section 5 — same featured-work slider template as section 4.
        Deliberately NOT h-screen (matching Section 4/7's demo) — sized to
        its own content so Section 5.5/CASES sits a clean 1cm below it. */}
    <section className="flex w-full flex-col items-start gap-10 bg-black px-[6%] pt-[9vh] lg:flex-row lg:gap-[8%]">
      <div className="flex w-full flex-col lg:w-[26%]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/10">
          {DETAIL_THUMBS.map((src, i) => (
            <Image
              key={src}
              src={`${basePath}/photos/${src}`}
              alt={`原型細部 縮圖 ${i + 1}`}
              fill
              className="object-cover transition-opacity duration-700"
              style={{ opacity: i === detailThumbIndex ? 1 : 0 }}
            />
          ))}
        </div>
        <h3
          className="mt-8 text-lg text-white"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
        >
          {detailSliderLabel[lang]}｜Detail
        </h3>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-white/70">
          {detailDesc}
        </p>
        <div className="mt-8 flex items-center gap-6 text-white/60">
          <button
            type="button"
            aria-label="上一張"
            onClick={showPrevDetailThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一張"
            onClick={showNextDetailThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fixed photo, native ratio (2600x1235), same 58.08vw width formula
          as section 4 (layout proportions are identical). */}
      <div className="flex w-full flex-col items-start lg:w-[58.08vw]">
        <div className="relative w-full" style={{ aspectRatio: "2600 / 1235" }}>
          <Image
            src={`${basePath}/photos/detail-main.jpg`}
            alt="原型細部"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>

    {/* Section 5.5 — replaces the old detail "MORE" popup, same treatment
        as Section 4.5/7.5. */}
    <section className="flex w-full flex-col items-center gap-16 bg-black px-[6%] py-[1cm]">
      <span className="text-xs text-white/60" style={{ letterSpacing: "0.3em" }}>
        CASES
      </span>
      <div className="flex w-full flex-wrap items-start justify-center gap-x-[4%] gap-y-10">
        {detailCaseItems.map((c) => (
          <CaseCard
            key={c.key}
            label={c.label}
            image={c.image}
            href={c.href}
            widthClass="w-[42%] lg:w-[26%]"
          />
        ))}
      </div>
    </section>

    {/* Chapter 03 — same template as Chapter 01/02, just swapping the photo,
        chapter number, and title. */}
    <section
      ref={chapter03Ref}
      className="relative flex w-full items-start overflow-hidden bg-black lg:h-screen lg:items-center"
    >
      <div
        // Below lg: width-driven — w-full + the aspect-ratio below (never
        // overridden by an explicit height here) scales the photo to the
        // screen's width with no cropping and no stretch. At lg+: the
        // original desktop sizing.
        className="relative w-full lg:w-[calc(83.20vh+40vw)]"
        style={{
          // Same Chapter 01/02 width formula; aspect ratio here (4608x3072,
          // a native 3:2 photo rather than a pre-cropped wide banner) just
          // makes it render taller instead.
          aspectRatio: "4608 / 3072",
          transform: `translateY(${chapter03Offset}px)`,
        }}
      >
        <Image
          src={`${basePath}/photos/chapter03.jpg`}
          alt="原型展覽"
          fill
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-x-6 bottom-10 z-10 flex flex-col items-start text-left lg:inset-x-auto lg:top-1/2 lg:right-[25%] lg:bottom-auto lg:translate-x-[6cm] lg:-translate-y-1/2"
      >
        <span
          className="text-xs text-white/60 sm:text-sm"
          style={{ letterSpacing: "0.3em" }}
        >
          CHAPTER
        </span>
        <h2
          className="mt-4 text-4xl leading-tight font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] whitespace-nowrap sm:text-6xl"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: "0.15em",
          }}
        >
          {chapter03Title[lang]}
        </h2>
      </div>
    </section>

    {/* Section 7 — same featured-work slider template as section 4/5.
        Deliberately NOT h-screen (matching Section 4's demo) — sized to
        its own content so the following CASES band sits a clean 1cm
        below it instead of leaving forced full-viewport dead space. */}
    <section className="flex w-full flex-col items-start gap-10 bg-black px-[6%] pt-[9vh] lg:flex-row lg:gap-[8%]">
      <div className="flex w-full flex-col lg:w-[26%]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/10">
          {EXHIBIT_THUMBS.map((src, i) => (
            <Image
              key={src}
              src={`${basePath}/photos/${src}`}
              alt={`原型展覽 縮圖 ${i + 1}`}
              fill
              className="object-cover transition-opacity duration-700"
              style={{ opacity: i === exhibitThumbIndex ? 1 : 0 }}
            />
          ))}
        </div>
        <h3
          className="mt-8 text-lg text-white"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
        >
          {exhibitSliderLabel[lang]}｜Exhibition
        </h3>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-white/70">
          {exhibitDesc}
        </p>
        <div className="mt-8 flex items-center gap-6 text-white/60">
          <button
            type="button"
            aria-label="上一張"
            onClick={showPrevExhibitThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一張"
            onClick={showNextExhibitThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fixed photo — IMG_2779, cropped to the same 2600x1231 size as the
          原型修復/原型細部 main photos above, same 58.08vw width formula. */}
      <div className="flex w-full flex-col items-start lg:w-[58.08vw]">
        <div className="relative w-full" style={{ aspectRatio: "2600 / 1231" }}>
          <Image
            src={`${basePath}/photos/exhibit-main.jpg`}
            alt="原型展覽"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>

    {/* Section 7.5 — replaces the old exhibit "MORE" popup, same treatment
        as Section 4.5. Cards that open a gallery use CaseCard's onClick
        form; the two plain links use its href form. id targeted by the
        header hamburger menu's ADA建築展/構竹林鐵/台北藝廊展 entries,
        which just scroll here (the actual gallery still opens via clicking
        the card itself, not from the header). */}
    <section id="cases-exhibit" className="flex w-full flex-col items-center gap-16 bg-black px-[6%] py-[1cm]">
      <span className="text-xs text-white/60" style={{ letterSpacing: "0.3em" }}>
        CASES
      </span>
      <div className="flex w-full flex-wrap items-start justify-center gap-x-[2%] gap-y-10">
        {EXHIBIT_CASES.map((c) => (
          <CaseCard
            key={c.key}
            label={caseLabels[c.key][lang]}
            image={c.image}
            href={c.href}
            onClick={c.gallery ? () => setOpenGallery(c.gallery) : undefined}
            widthClass="w-[42%] lg:w-[20%]"
          />
        ))}
      </div>
    </section>

    {/* Chapter 04 — same template as Chapter 01/02/03. Title is hardcoded
        (not wired into the translations.ts i18n system yet, unlike the
        other three chapters). No photo yet, per explicit request — left
        blank (bg-white/10, same "empty" convention as the thumbnail boxes
        elsewhere) rather than standing in with a reused photo. Swap in a
        real <Image> once one is supplied; aspect ratio here is a
        placeholder guess (matches Chapter 01/02/03's width formula) and
        may need adjusting for the real photo's actual ratio. */}
    <section
      ref={chapter04Ref}
      className="relative flex w-full items-start overflow-hidden bg-black lg:h-screen lg:items-center"
    >
      <div
        className="relative flex h-full w-full items-center justify-center lg:h-auto lg:w-[calc(83.20vh+40vw)]"
        style={{
          aspectRatio: "3200 / 1923",
          transform: `translateY(${chapter04Offset}px)`,
        }}
      >
        {/* Ported from the main site's mobile-dark-mode rotating globe
            widget (see RotatingGlobe.tsx) — drag to rotate only, no
            zoom/search/click, per explicit request. Below lg: sized off
            its own width (safely bounded by the phone/tablet screen) so a
            tall narrow viewport can't blow it up past the screen edges.
            At lg+: the original height-driven sizing, capped to the
            banner's own height so it fits centered inside this
            wider-than-tall box. */}
        <RotatingGlobe className="aspect-square w-full lg:h-full lg:w-auto lg:translate-x-[-2cm]" />
      </div>
      <div
        className="absolute inset-x-6 bottom-10 z-10 flex flex-col items-start text-left lg:inset-x-auto lg:top-1/2 lg:right-[25%] lg:bottom-auto lg:translate-x-[6cm] lg:-translate-y-1/2"
      >
        <span
          className="text-xs text-white/60 sm:text-sm"
          style={{ letterSpacing: "0.3em" }}
        >
          CHAPTER
        </span>
        <h2
          className="mt-4 text-4xl leading-tight font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] whitespace-nowrap sm:text-6xl"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: "0.15em",
          }}
        >
          原型數位
        </h2>
      </div>
    </section>

    {/* Section 9 — same featured-work slider template as the other
        chapters. Deliberately NOT h-screen, same reasoning as Section 4/5/7. */}
    <section className="flex w-full flex-col items-start gap-10 bg-black px-[6%] pt-[9vh] lg:flex-row lg:gap-[8%]">
      <div className="flex w-full flex-col lg:w-[26%]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/10">
          {DIGITAL_THUMBS.map((src, i) => (
            <Image
              key={src}
              src={`${basePath}/photos/${src}`}
              alt={`原型數位 縮圖 ${i + 1}`}
              fill
              className="object-cover transition-opacity duration-700"
              style={{ opacity: i === digitalThumbIndex ? 1 : 0 }}
            />
          ))}
        </div>
        <h3
          className="mt-8 text-lg text-white"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
        >
          原型數位｜Digital
        </h3>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-white/70">
          {digitalDesc}
        </p>
        <div className="mt-8 flex items-center gap-6 text-white/60">
          <button
            type="button"
            aria-label="上一張"
            onClick={showPrevDigitalThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一張"
            onClick={showNextDigitalThumb}
            className="cursor-pointer transition-colors hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start lg:w-[58.08vw]">
        <div className="relative w-full" style={{ aspectRatio: "2600 / 1231" }}>
          <Image
            src={`${basePath}/photos/digital-main.jpg`}
            alt="原型數位"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>

    {/* Section 9.5 — same treatment as Section 4.5/5.5/7.5. */}
    <section className="flex w-full flex-col items-center gap-16 bg-black px-[6%] py-[1cm]">
      <span className="text-xs text-white/60" style={{ letterSpacing: "0.3em" }}>
        CASES
      </span>
      <div className="flex w-full flex-wrap items-start justify-center gap-x-[4%] gap-y-10">
        {digitalCaseItems.map((c) => (
          <CaseCard
            key={c.key}
            label={c.label}
            image={c.image}
            href={c.href}
            widthClass="w-[42%] lg:w-[16%]"
          />
        ))}
      </div>
    </section>

    <Footer />

    <GalleryOverlay
      open={openGallery !== null}
      images={openGallery ?? []}
      onClose={() => setOpenGallery(null)}
    />
    </>
  );
}
