// Mirrors the footer from the original AS studio homepage
// (原型教學轉code/design_handoff_architecture_site/建築事務所首頁.dc.html),
// desktop layout only (no mobile collapsed-into-a-button variant), and
// fixed to the "dark mode" colors the same way Header.tsx is — no
// dark/light toggle on this site. Contact details are proper
// nouns/numbers, so they're left untranslated like the CHAPTER label.
const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/AS.structure",
    path: "M18 2h-3a6 6 0 0 0-6 6v4h-2v4h2v6h4v-6h3l1-4h-4V8a2 2 0 0 1 2-2h1Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/as.futuregroup?igsh=MTRsZXV2dmhnaGdqOQ%3D%3D",
    rect: true,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@%E9%99%B3%E5%86%A0%E5%B8%86-z9v",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    fill: true,
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "oklch(0.12 0 0)",
        padding: "80px 40px",
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-start justify-between">
        <div className="text-left">
          <p className="mb-2 text-sm" style={{ color: "oklch(0.7 0 0)" }}>
            電話：06-2905293
          </p>
          <p className="mb-2 text-sm" style={{ color: "oklch(0.7 0 0)" }}>
            傳真：06-2905493
          </p>
          <p className="text-sm" style={{ color: "oklch(0.7 0 0)" }}>
            電郵：
            <a
              href="mailto:as.studio001@gmail.com"
              className="transition-opacity hover:opacity-70"
              style={{ color: "oklch(0.7 0 0)" }}
            >
              as.studio001@gmail.com
            </a>
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm" style={{ color: "oklch(0.7 0 0)" }}>
            台南市東區中華東路三段44巷7號1樓
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: "oklch(0.25 0 0)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={s.fill ? "currentColor" : "none"}
                stroke={s.fill ? undefined : "currentColor"}
                strokeWidth={s.fill ? undefined : 2}
                strokeLinecap={s.fill ? undefined : "round"}
                strokeLinejoin={s.fill ? undefined : "round"}
                style={{ color: "oklch(0.95 0 0)" }}
              >
                {s.rect ? (
                  <>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <circle cx="17.5" cy="6.5" r="1.5" />
                  </>
                ) : (
                  <path d={s.path} />
                )}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
