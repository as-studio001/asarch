import type { NextConfig } from "next";

// GitHub Pages serves this project at https://<user>.github.io/asarch/,
// so production builds need every asset/link prefixed with /asarch.
// Dev mode (npm run dev) keeps basePath empty so localhost:3000 still works.
const basePath = process.env.NODE_ENV === "production" ? "/asarch" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    // next/image's optimization API needs a server; GitHub Pages is static-only.
    unoptimized: true,
  },
  env: {
    // Exposed to client code so raw asset paths (e.g. passed into canvas/video
    // src, not through next/image or next/link) can be prefixed manually.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
