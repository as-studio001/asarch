"use client";

// href = plain external link (opens in a new tab once it's a real URL).
// gallery = list of photo filenames (under /photos) — clicking opens the
// masonry GalleryOverlay with these instead of navigating anywhere.
export type MoreLink = { label: string; href?: string; gallery?: string[] };

// Full-screen 65%-black backdrop behind a row of white-outline pill
// buttons, centered on screen. Triggered by each chapter's "MORE" button.
// Clicking the backdrop (anywhere outside the buttons) closes it.
export default function MoreOverlay({
  open,
  links,
  onClose,
  onOpenGallery,
}: {
  open: boolean;
  links: MoreLink[];
  onClose: () => void;
  onOpenGallery: (images: string[]) => void;
}) {
  if (!open) return null;
  const buttonClass =
    "rounded-lg border border-white px-8 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black";
  const buttonStyle = { letterSpacing: "0.1em" };
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-wrap items-center justify-center gap-6 px-6"
        onClick={(e) => e.stopPropagation()}
      >
        {links.map((l) =>
          l.gallery ? (
            <button
              key={l.label}
              type="button"
              onClick={() => onOpenGallery(l.gallery!)}
              className={`cursor-pointer ${buttonClass}`}
              style={buttonStyle}
            >
              {l.label}
            </button>
          ) : (
            <a
              key={l.label}
              href={l.href ?? "#"}
              {...(l.href && l.href !== "#"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={buttonClass}
              style={buttonStyle}
            >
              {l.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}
