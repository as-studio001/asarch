"use client";

import Image from "next/image";
import { externalLinkProps } from "@/lib/links";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Shared card for the "CASES" bands (replacing the old MORE popups) —
// either a plain link (href) or a trigger for something else, like opening
// the masonry GalleryOverlay (onClick). Used by both the 原型修復 and
// 原型展覽 CASES sections so the two stay visually consistent.
export default function CaseCard({
  label,
  image,
  href,
  onClick,
  widthClass = "w-[26%]",
}: {
  label: string;
  image: string;
  href?: string;
  onClick?: () => void;
  widthClass?: string;
}) {
  const className = `group flex ${widthClass} flex-col items-center`;
  const inner = (
    <>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={`${basePath}/photos/${image}`}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h4
        className="mt-6 text-center text-base text-white"
        style={{
          fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </h4>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`cursor-pointer ${className}`}>
        {inner}
      </button>
    );
  }

  return (
    <a
      href={href ?? "#"}
      {...externalLinkProps(href ?? "#")}
      className={className}
    >
      {inner}
    </a>
  );
}
