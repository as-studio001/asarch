import ParticleImage from "@/components/originkit/ui/svgparticles";

// Raw asset paths (unlike next/image / next/link) aren't auto-prefixed with
// basePath, so we prepend it ourselves — see next.config.ts.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <section className="relative w-full h-[80vh] bg-black">
        <ParticleImage
          width="100%"
          height="100%"
          imageConfig={{
            image: `${basePath}/originkit/banner.png`,
            mode: "fit",
            scale: 5,
            sizeUnit: "%",
            widthPct: 100,
            heightPct: 100,
          }}
        />
      </section>
    </div>
  );
}
