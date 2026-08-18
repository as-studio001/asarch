"use client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Same 65%-black backdrop as MoreOverlay, holding a 3-column photo grid
// (CSS multi-column: fixed column count/width, each photo scaled to that
// width keeping its own aspect ratio, 5px gaps both directions). Plain
// <img> rather than next/image — the whole point is letting each photo's
// natural aspect ratio set its own height, which next/image's
// width/height-driven layout fights against.
export default function GalleryOverlay({
  open,
  images,
  onClose,
}: {
  open: boolean;
  images: string[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-10"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      {/* Scroll container is separate from the column-layout element on
          purpose: putting max-height + overflow-y directly on a
          column-count element makes the browser add MORE columns
          sideways to fit overflow instead of scrolling vertically within
          the fixed 3. This outer box scrolls; the inner one just grows as
          tall as its 3 columns need. */}
      <div
        className="no-scrollbar max-h-[90vh] w-full max-w-5xl overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ columnCount: 3, columnGap: "5px" }}>
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src + i}
              src={`${basePath}/photos/${src}`}
              alt=""
              className="block w-full"
              style={{ marginBottom: "5px", breakInside: "avoid" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
