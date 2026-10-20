import type { MetadataRoute } from "next";

import { ALL_POSTS, BLOG_HUBS } from "@/data/blog";
import { BRAND } from "@/data/site";
import { STATE_PAGES } from "@/data/state-pages";

/**
 * Every public page, for search engines.
 *
 * The job detail pages are deliberately left out: they churn daily and there
 * are thousands of them, so a sitemap full of dead listings would teach Google
 * that this file is unreliable. Job pages are discovered through /jobs and the
 * internal links it already carries.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url;
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/states`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/cv-writing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pro`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/employers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const states: MetadataRoute.Sitemap = STATE_PAGES.map((state) => ({
    url: `${base}/states/${state.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const hubs: MetadataRoute.Sitemap = BLOG_HUBS.map((hub) => ({
    url: `${base}/blog/topic/${hub.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const posts: MetadataRoute.Sitemap = ALL_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.published),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...fixed, ...states, ...hubs, ...posts];
}
