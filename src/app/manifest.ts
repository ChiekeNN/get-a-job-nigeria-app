import type { MetadataRoute } from "next";

import { BRAND } from "@/data/site";

/**
 * Web app manifest, served at /manifest.webmanifest.
 *
 * Next.js injects the <link rel="manifest"> automatically for this file, so the
 * install prompt and "Add to Home Screen" work without a public/ copy.
 *
 * Icons come in two flavours on purpose:
 *   - `any`    — the artwork as designed, with a white plate behind it.
 *   - `maskable` — the same artwork pulled in to 60% so Android can crop it to a
 *     circle, squircle or rounded square without clipping the crosshair ticks.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — Jobs in Nigeria`,
    short_name: BRAND.name,
    description: BRAND.metaDescription,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f7faf8",
    theme_color: "#078e58",
    lang: "en-NG",
    dir: "ltr",
    categories: ["business", "employment", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Find jobs",
        short_name: "Jobs",
        description: "Browse verified openings across Nigeria",
        url: "/jobs",
      },
      {
        name: "Browse by state",
        short_name: "States",
        description: "Openings in all 36 states and the FCT",
        url: "/states",
      },
    ],
  };
}
