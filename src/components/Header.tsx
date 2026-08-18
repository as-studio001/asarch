"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

// Mirrors the header from the original AS studio homepage
// (原型教學轉code/design_handoff_architecture_site/建築事務所首頁.dc.html),
// minus the search box, mobile layout, and dark/light-mode toggle per
// explicit request — this site only ever renders the "dark mode" look
// (white text), so those values are just hardcoded instead of branching on
// isDarkMode/isMobile like the original. The header element itself still
// has no background of its own — only the left (menu+logo) and right
// (nav pill) groups have their own glassmorphism boxes behind them.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const MATERIAL_LINKS = [
  { label: "原型首頁", href: "https://www.as-structure.com/" },
  {
    label: "信義街咾咕石‧芳宅",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=622507",
  },
  {
    label: "嘉義實驗木場",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=582351",
  },
  {
    label: "原型事務所",
    href: "https://www.mashup.com.tw/as%20studio/?page=product_shop&p_id=506003",
  },
  { label: "好感空間展", href: "https://www.tnhs.com.tw/" },
  // These three open a photo-gallery overlay (not a plain link) when
  // clicked on the page itself — from the header they just scroll to the
  // exhibit CASES band, where the actual gallery card can be clicked.
  { label: "ADA建築展", href: "#cases-exhibit" },
  { label: "構竹林鐵", href: "#cases-exhibit" },
  { label: "台北藝廊展", href: "#cases-exhibit" },
];

export default function Header() {
  const [showMaterialMenu, setShowMaterialMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { lang, setLang } = useLanguage();

  // Same click-outside-closes behavior as the original (document listener
  // checking closest("[data-menu-box]") / closest("[data-lang-menu-box]")).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-box]")) setShowMaterialMenu(false);
      if (!target.closest("[data-lang-menu-box]")) setShowLanguageMenu(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-[1000] flex items-center justify-between"
      style={{ padding: "24px 40px" }}
    >
      <div
        className="flex items-center gap-5 rounded-lg backdrop-blur-md"
        style={{
          padding: "16px 24px",
          backgroundColor: "oklch(0.15 0 0 / 0.15)",
        }}
      >
        <div data-menu-box className="relative">
          <button
            type="button"
            aria-label="材料選單"
            onClick={() => setShowMaterialMenu((v) => !v)}
            className="flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px]"
          >
            <span className="block h-[2px] w-[22px] bg-white" />
            <span className="block h-[2px] w-[22px] bg-white" />
            <span className="block h-[2px] w-[22px] bg-white" />
          </button>
          {showMaterialMenu && (
            <div
              data-menu-box
              className="absolute top-full left-0 mt-2 w-40 overflow-hidden rounded-lg border shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              style={{
                backgroundColor: "oklch(0.12 0 0)",
                borderColor: "oklch(0.25 0 0)",
              }}
            >
              {MATERIAL_LINKS.map((m, i) => (
                <a
                  key={m.label}
                  href={m.href}
                  {...(m.href.startsWith("#")
                    ? { onClick: () => setShowMaterialMenu(false) }
                    : { target: "_blank", rel: "noreferrer" })}
                  className="block px-4 py-3 text-sm text-white transition-colors hover:bg-white/10"
                  style={
                    i < MATERIAL_LINKS.length - 1
                      ? { borderBottom: "1px solid oklch(0.2 0 0)" }
                      : undefined
                  }
                >
                  {m.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <a href="https://www.mashup.com.tw/as%20studio/" className="flex items-center gap-3">
          <Image
            src={`${basePath}/favicon-logo.png`}
            alt="原型結構 as.studio"
            width={256}
            height={256}
            className="h-9 w-9"
            priority
          />
          <span
            className="text-base text-white"
            style={{
              fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
              letterSpacing: "0.1em",
            }}
          >
            原型建築
          </span>
        </a>
      </div>

      <div
        className="flex items-center rounded-lg"
        style={{
          gap: "32px",
          padding: "16px 24px",
          backgroundColor: "oklch(0.15 0 0 / 0.15)",
        }}
      >
        <div data-lang-menu-box className="relative">
          <button
            type="button"
            aria-label="切換語言"
            onClick={() => setShowLanguageMenu((v) => !v)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          {showLanguageMenu && (
            <div
              data-lang-menu-box
              className="absolute top-full right-0 mt-2 min-w-[140px] overflow-hidden rounded-lg border shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              style={{
                backgroundColor: "oklch(0.12 0 0)",
                borderColor: "oklch(0.25 0 0)",
              }}
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setShowLanguageMenu(false);
                  }}
                  className="block w-full px-3.5 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10"
                  style={{ fontWeight: lang === l.code ? 700 : 400 }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
