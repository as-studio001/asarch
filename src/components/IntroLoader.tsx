"use client";

import { useEffect, useState, type ReactNode } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Every photo the homepage actually renders directly (banners, sliders'
// thumbnails/main photos, CASES cards) — NOT the masonry-gallery-overlay
// photos (ADA建築展/構竹林鐵/台北藝廊展 full sets), which are dozens of
// large images only needed on demand when a card is clicked, not for the
// page to be usably "ready". Blocking on those too would make this loader
// far slower for no visible benefit on first landing. Keep this list in
// sync when new chapters/photos are added — nothing derives it
// automatically from page.tsx.
const PRELOAD_PHOTOS = [
  "hero-panorama.jpg",
  "chapter01.jpg",
  "restore-main.jpg",
  "restore-thumb-1.jpg",
  "restore-thumb-2.jpg",
  "restore-thumb-3.jpg",
  "restore-thumb-4.jpg",
  "restore-thumb-5.jpg",
  "restore-thumb-6.jpg",
  "restore-thumb-7.jpg",
  "restore-thumb-8.jpg",
  "case-restore-xinyi.jpg",
  "case-restore-woodyard.jpg",
  "case-restore-office.jpg",
  "chapter02.jpg",
  "detail-main.jpg",
  "detail-thumb-1.jpg",
  "detail-thumb-2.jpg",
  "detail-thumb-3.jpg",
  "detail-thumb-4.jpg",
  "detail-thumb-5.jpg",
  "detail-thumb-6.jpg",
  "detail-thumb-7.jpg",
  "detail-thumb-8.jpg",
  "detail-thumb-9.jpg",
  "case-detail-joint.jpg",
  "case-detail-material.jpg",
  "case-detail-method.jpg",
  "case-detail-construction.jpg",
  "chapter03.jpg",
  "exhibit-main.jpg",
  "exhibit-thumb-1.jpg",
  "exhibit-thumb-2.jpg",
  "exhibit-thumb-3.jpg",
  "exhibit-thumb-4.jpg",
  "exhibit-thumb-5.jpg",
  "exhibit-thumb-6.jpg",
  "exhibit-thumb-7.jpg",
  "exhibit-thumb-8.jpg",
  "case-exhibit-tnhs.jpg",
  "gallery-ada-1.jpg",
  "case-exhibit-bamboo.jpg",
  "gallery-taipei-1.jpg",
];

// Full-screen loading gate wrapping the whole site: the intro video loops
// (not "plays once then reveals" like the sibling site's version — this
// one is functional, not just decorative) with "加載中..." pinned
// bottom-right, until every photo above has finished loading (or errored —
// a broken image shouldn't hang the site forever).
//
// `children` are rendered (mounted) the entire time, but kept
// visibility:hidden — NOT display:none, which would break the particle
// canvas's ResizeObserver-based sizing — until ready. Earlier this
// component only drew an opaque overlay ON TOP of the page instead of
// actually hiding it, so the page's own animations (hero SVG particles
// assembling, the sticky-scroll reveal) were already running underneath
// from the very first frame; by the time the loader faded out they'd
// already played part of their own intro, which read as the video's loop
// "splitting into two segments" — one default pass, then the loading one.
// Hiding children until `ready` means their effects/animations only start
// once actually revealed.
export default function IntroLoader({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (PRELOAD_PHOTOS.length === 0) {
      setReady(true);
      return;
    }
    let remaining = PRELOAD_PHOTOS.length;
    let cancelled = false;
    const settle = () => {
      remaining -= 1;
      if (remaining <= 0 && !cancelled) setReady(true);
    };
    PRELOAD_PHOTOS.forEach((src) => {
      const img = new window.Image();
      img.onload = settle;
      img.onerror = settle;
      img.src = `${basePath}/photos/${src}`;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setHidden(true), 700);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <>
      {!hidden && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black"
          style={{
            opacity: ready ? 0 : 1,
            pointerEvents: ready ? "none" : "auto",
            transition: "opacity 0.6s ease",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            src={`${basePath}/videos/intro.mp4`}
          />
          <div
            className="absolute right-6 bottom-6 text-xs text-white/80"
            style={{ letterSpacing: "0.1em" }}
          >
            加載中...
          </div>
        </div>
      )}
      <div style={{ visibility: ready ? "visible" : "hidden" }}>{children}</div>
    </>
  );
}
