import type { MetadataRoute } from "next";

import { BRAND } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin console and the importer are not for crawlers.
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    // The Host directive wants a bare hostname, not a URL.
    host: BRAND.domain,
  };
}
