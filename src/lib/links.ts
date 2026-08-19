// Links to the "Internal-Pages" sibling site (case-detail subpages, e.g.
// 台南硓𥑮石．芳宅) should navigate in the same tab — so the browser's
// back button returns here — even though it's technically a different
// GitHub Pages URL. Everything else (mashup.com.tw, as-structure.com,
// tnhs.com.tw, wixsite.com, ...) is a genuinely external site and keeps
// opening in a new tab.
export function isInternalPagesLink(href: string): boolean {
  return href.includes("as-studio001.github.io/Internal-Pages");
}

// Spread onto an <a> for hrefs that should open in a new tab — every real
// external link except in-page "#" anchors and Internal-Pages subpages.
export function externalLinkProps(href: string) {
  if (href.startsWith("#") || isInternalPagesLink(href)) return {};
  return { target: "_blank", rel: "noopener noreferrer" } as const;
}
