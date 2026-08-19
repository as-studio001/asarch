// Per explicit request, every link on the site now navigates in the same
// tab — no more target="_blank" split between GitHub-published and truly
// external sites. externalLinkProps is kept as a no-op passthrough (same
// signature, `href` unused) rather than deleting it and updating every
// call site, so the distinction is easy to bring back later if that
// changes again.
export function isGithubPublishedLink(_href: string): boolean {
  return true;
}

export function externalLinkProps(_href: string) {
  return {};
}
