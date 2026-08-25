"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { HeroContent } from "@/lib/useSiteContent";

interface HeroTextProps {
  hero: HeroContent | null;
}

// 完全對應「改成後台可視覺化編輯」之前，這裡原本寫死的樣式——後台
// hero.json 讀不到、或某個欄位缺漏，都退回這裡，維持首頁大圖區塊
// 原本的預設外觀，不會空白或跑版。
const DEFAULTS = {
  line1: "原型建築",
  line1Weight: "600",
  line1LetterSpacing: 0.15,
  line2: "AS.Studio",
  line2Weight: "400",
  line2LetterSpacing: 0.3,
  lineGap: 1.25,
  scale: 1,
  offsetX: "1cm",
  offsetY: "-25vh",
} as const;

type HeroValues = {
  line1: string;
  line1Weight: string;
  line1LetterSpacing: number;
  line2: string;
  line2Weight: string;
  line2LetterSpacing: number;
  lineGap: number;
  scale: number;
  offsetX: string;
  offsetY: string;
};

type HeroPatch = Partial<HeroValues>;

function mergeHero(hero: HeroContent | null, override: HeroPatch): HeroValues {
  const base = { ...DEFAULTS } as HeroValues;
  const layer = (source: HeroPatch | HeroContent | null) => {
    if (!source) return;
    (Object.keys(base) as (keyof HeroValues)[]).forEach((key) => {
      const val = (source as HeroPatch)[key];
      if (val !== undefined && val !== null && val !== "") {
        (base as Record<keyof HeroValues, unknown>)[key] = val;
      }
    });
  };
  layer(hero);
  layer(override);
  return base;
}

// 拖曳位置時，不去解析 offsetX/offsetY 這兩個字串本身用的是什麼單位
// （cm、vh、px 都可能），直接讀瀏覽器已經算好的 matrix(...) 拿到目前
// 實際的像素位移，拖曳結束後才把新的絕對像素位置寫回 offsetX/offsetY，
// 這樣不管原本存的是什麼單位都能正確接續拖曳。
function readTranslatePx(el: HTMLElement): { x: number; y: number } {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return { x: 0, y: 0 };
  const match = t.match(/matrix\(([^)]+)\)/);
  if (!match) return { x: 0, y: 0 };
  const parts = match[1].split(",").map((n) => parseFloat(n.trim()));
  if (parts.length < 6) return { x: 0, y: 0 };
  return { x: parts[4] || 0, y: parts[5] || 0 };
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

// 這個元件只負責 SECTION 1（首頁最上方全螢幕大圖）疊在照片上的兩行
// 文字（原型建築／AS.Studio）——底圖照片跟上面的光線遮罩效果是
// page.tsx 自己畫的，不歸這個元件管，後台也刻意不開放編輯那兩塊。
//
// 一般訪客：只是照 hero（來自 content/site/hero.json，讀不到就用
// DEFAULTS）把文字畫出來，沒有任何額外的事件監聽，效能/風險都是零。
//
// 後台的視覺化編輯器 iframe（網址帶 ?preview=1）：額外會做兩件事——
// 1) 監聽 postMessage 收後台滑塊送來的即時預覽值（粗細/內容/字距/
//    行距），疊在 hero 上面即時重繪；
// 2) 掛上拖曳事件，讓使用者直接在畫面上拖動文字改位置、拖右下角的
//    圓點手把改縮放，放開滑鼠那一刻才把結果 postMessage 回後台存進
//    ed.item，後台按下「儲存並發布」才會真的寫進 hero.json——這個
//    元件本身完全不知道怎麼寫 GitHub。
export default function HeroText({ hero }: HeroTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);
  const [override, setOverride] = useState<HeroPatch>({});
  const [visible, setVisible] = useState(false);

  // Fade the hero text in over 5s instead of a hard cut-in. Skipped in the
  // admin's preview iframe — that needs the text visible immediately so it
  // can be dragged/scaled right away, not waiting on a fade timer.
  //
  // The fade only starts once the page has fully appeared — not from the
  // moment this component mounts/hydrates, which can happen while the hero
  // photo, fonts, etc. are still loading. window's "load" event fires only
  // after every resource on the page has finished, so that's what starts
  // the timer; if the page is already fully loaded by the time this effect
  // runs (fast repeat visits), start right away instead of waiting for an
  // event that already fired.
  useEffect(() => {
    if (preview) {
      setVisible(true);
      return;
    }
    let rafId: number | null = null;
    function start() {
      // rAF so the opacity:0 state is definitely painted at least once
      // before flipping to 1 — otherwise the browser can coalesce both
      // values into a single frame and skip the transition entirely.
      rafId = requestAnimationFrame(() => setVisible(true));
    }
    if (document.readyState === "complete") {
      start();
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }
    window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [preview]);

  useEffect(() => {
    // 這個網站是靜態匯出（next.config.ts 的 output: "export"），prerender
    // 階段在 Node 裡跑、沒有 window，一定要等瀏覽器掛載後才能讀網址參數
    // ——先固定渲染成 false（跟 prerender 出來的 HTML 一致，不會 hydration
    // mismatch），掛載後這個 effect 再讀真正的網址、視需要切成預覽模式。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(new URLSearchParams(window.location.search).get("preview") === "1");
  }, []);

  useEffect(() => {
    if (!preview) return;
    function onMessage(e: MessageEvent) {
      const data = e.data as { type?: string; patch?: HeroPatch } | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "hero-preview-set" && data.patch) {
        setOverride((prev) => ({ ...prev, ...data.patch }));
      } else if (data.type === "hero-preview-reset") {
        setOverride({});
      }
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "hero-preview-ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  // 上一步／下一步的歷史紀錄本身存在後台（父頁面）那邊，不是這裡——
  // 但如果焦點剛好還留在這個 iframe 裡（例如剛拖完文字、還沒點回外層
  // 面板），keydown 事件出不了這個 iframe 的 document，父頁面自己的
  // Ctrl+Z/Y 監聽收不到，所以這裡也要攔一次，攔到了只是轉發、不在這裡
  // 處理實際的復原邏輯。
  useEffect(() => {
    if (!preview) return;
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key ? e.key.toLowerCase() : "";
      const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && key === "z";
      const isRedo = (e.ctrlKey || e.metaKey) && (key === "y" || (key === "z" && e.shiftKey));
      if (!isUndo && !isRedo) return;
      e.preventDefault();
      window.parent.postMessage({ type: isUndo ? "hero-preview-undo" : "hero-preview-redo" }, "*");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  const v = mergeHero(hero, override);

  function handlePositionPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!preview || !wrapRef.current) return;
    e.preventDefault();
    const el = wrapRef.current;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // 少數瀏覽器不支援 pointer capture 也沒關係，下面用 window 監聽
      // move/up，拖曳照樣能正常運作。
    }
    const start = readTranslatePx(el);
    const startX = e.clientX;
    const startY = e.clientY;
    let lastX = start.x;
    let lastY = start.y;

    function onMove(ev: PointerEvent) {
      lastX = start.x + (ev.clientX - startX);
      lastY = start.y + (ev.clientY - startY);
      el.style.transform = `translate(${lastX}px, ${lastY}px)`;
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const patch: HeroPatch = { offsetX: `${lastX.toFixed(1)}px`, offsetY: `${lastY.toFixed(1)}px` };
      setOverride((prev) => ({ ...prev, ...patch }));
      window.parent.postMessage({ type: "hero-preview-change", patch }, "*");
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleScalePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!preview || !wrapRef.current || !textRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const handle = e.currentTarget;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // 同上，不支援也沒關係。
    }
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startDist = Math.max(1, Math.hypot(e.clientX - cx, e.clientY - cy));
    const startScale = v.scale;
    const textEl = textRef.current;
    let lastScale = startScale;

    function onMove(ev: PointerEvent) {
      const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      lastScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * (dist / startDist)));
      textEl.style.transform = `scale(${lastScale})`;
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const patch: HeroPatch = { scale: Math.round(lastScale * 100) / 100 };
      setOverride((prev) => ({ ...prev, ...patch }));
      window.parent.postMessage({ type: "hero-preview-change", patch }, "*");
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={wrapRef}
      className="absolute top-1/2 left-0 flex h-3/4 w-3/4 items-center justify-center"
      style={{
        transform: `translate(${v.offsetX}, ${v.offsetY})`,
        touchAction: preview ? "none" : undefined,
        cursor: preview ? "move" : undefined,
        opacity: visible ? 1 : 0,
        // Starts blurred and sharpens as it fades in, per explicit
        // request — same 5s timing as the opacity fade below.
        filter: visible ? "blur(0px)" : "blur(14px)",
        // Only opacity/filter animate — leaving transform out of this
        // keeps dragging (which sets el.style.transform imperatively, see
        // handlePositionPointerDown) instant instead of laggy. 5s per
        // explicit request for a slow fade, timed from window "load"
        // above rather than from mount.
        transition: preview ? undefined : "opacity 5s ease-out, filter 5s ease-out",
      }}
      onPointerDown={handlePositionPointerDown}
    >
      <div
        ref={textRef}
        className="text-center"
        style={{
          transform: `scale(${v.scale})`,
          position: "relative",
          outline: preview ? "1px dashed rgba(255,255,255,0.6)" : undefined,
          outlineOffset: preview ? "8px" : undefined,
        }}
      >
        <h2
          className="text-[2.7rem] text-white sm:text-[4.5rem] lg:text-[5.4rem]"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: `${v.line1LetterSpacing}em`,
            fontWeight: v.line1Weight,
          }}
        >
          {v.line1}
        </h2>
        <p
          className="text-[0.9rem] text-white/60 sm:text-[1.2rem]"
          style={{
            marginTop: `${v.lineGap}rem`,
            letterSpacing: `${v.line2LetterSpacing}em`,
            fontWeight: v.line2Weight,
          }}
        >
          {v.line2}
        </p>
        {preview && (
          <div
            role="button"
            aria-label="拖曳縮放首頁文字"
            title="拖曳縮放文字大小"
            onPointerDown={handleScalePointerDown}
            style={{
              position: "absolute",
              right: -28,
              bottom: -28,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#fff",
              border: "2px solid #201f1d",
              cursor: "nwse-resize",
              touchAction: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}
