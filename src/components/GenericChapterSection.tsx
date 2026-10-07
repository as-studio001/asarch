"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import CaseCard from "@/components/CaseCard";
import type { ChapterContent } from "@/lib/useSiteContent";

// 之後在 Internal-Pages 後台新增的章節都走這個共用、簡化版的版型
// （標題／論述文字／頂部大圖／輪播縮圖／案例卡片），不是原本前 4 個
// 章節那種每個都手工調校捲動效果／像素座標的客製化版面——那種精雕
// 細琢的程度沒辦法變成「後台自己新增就好」的制式模板，所以新章節統一
// 用這個乾淨、跟整站黑白調性一致的簡化版型，之後真的想要更講究的
// 客製效果，再另外個別手工做。
export default function GenericChapterSection({ content }: { content: ChapterContent }) {
  const { lang } = useLanguage();
  const title = content.title?.[lang] ?? content.title?.["zh-Hant"] ?? "";
  const description = content.description?.[lang] ?? content.description?.["zh-Hant"] ?? "";
  const cases = content.cases ?? [];
  const thumbnails = content.thumbnails ?? [];

  return (
    <section className="flex w-full flex-col items-center gap-10 bg-black px-[6%] py-[8vh]">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-xs text-white/60" style={{ letterSpacing: "0.3em" }}>
          CHAPTER
        </span>
        <h2
          className="text-4xl leading-tight font-semibold text-white sm:text-6xl"
          style={{
            fontFamily: "var(--font-noto-serif-tc), 'Source Han Serif TC', serif",
            letterSpacing: "0.15em",
          }}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed text-white/70">
            {description}
          </p>
        ) : null}
      </div>

      {content.heroPhoto ? (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <Image src={content.heroPhoto} alt={title} fill priority={false} loading="lazy" className="object-cover" /> //加入懶載入，加速初次載入速度
        </div>
      ) : null}

      {thumbnails.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {thumbnails.map((src, i) => (
            <div key={src + i} className="relative overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
              <Image src={src} alt={`${title} ${i + 1}`} fill loading="lazy" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {cases.length > 0 ? (
        <>
          <span className="mt-6 text-xs text-white/60" style={{ letterSpacing: "0.3em" }}>
            CASES
          </span>
          <div className="flex w-full flex-wrap items-start justify-center gap-x-[4%] gap-y-10">
            {cases.map((c) => (
              <CaseCard
                key={c.href}
                label={c.label[lang] ?? c.label["zh-Hant"]}
                image={c.image}
                href={c.href}
                widthClass="w-[42%] lg:w-[26%]"
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
