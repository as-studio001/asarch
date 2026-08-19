// Any subpage published through GitHub (asarch's own GitHub Pages family —
// confirmed by "Server: GitHub.com" response headers, not just by domain
// guesswork) should navigate in the same tab, so the browser's back button
// returns here: as-studio001.github.io/* (e.g. Internal-Pages) and
// as-structure.com (a custom domain that's still GitHub Pages under the
// hood). Genuinely external sites — mashup.com.tw, tnhs.com.tw, wixsite.com,
// anything not part of this GitHub-published family — keep opening in a
// new tab as before.
const GITHUB_PUBLISHED_HOSTS = ["as-studio001.github.io", "as-structure.com"];

export function isGithubPublishedLink(href: string): boolean {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return GITHUB_PUBLISHED_HOSTS.includes(host);
  } catch {
    return false; // not a full URL (e.g. a "#anchor") — handled separately
  }
}

// Spread onto an <a> for hrefs that should open in a new tab — every real
// external link, except in-page "#" anchors and GitHub-published subpages.
export function externalLinkProps(href: string) {
  if (href.startsWith("#") || isGithubPublishedLink(href)) return {};
  return { target: "_blank", rel: "noopener noreferrer" } as const;
}
