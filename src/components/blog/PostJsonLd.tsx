import { getHub, type Post } from "@/data/blog";
import { BRAND } from "@/data/site";

/**
 * Structured data for an article.
 *
 * Article + BreadcrumbList is what lets Google show a date, a breadcrumb and
 * an author line under the result instead of a bare blue link. It is built
 * from the same post object that renders the page, so it cannot drift.
 */
export function PostJsonLd({ post }: { post: Post }) {
  const hub = getHub(post.hub);
  const url = `${BRAND.url}/blog/${post.slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    inLanguage: "en-NG",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: BRAND.name, url: BRAND.url },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: BRAND.url,
      logo: { "@type": "ImageObject", url: `${BRAND.url}/brand/mark.png` },
    },
    articleSection: hub.name,
    isAccessibleForFree: true,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BRAND.url },
      { "@type": "ListItem", position: 2, name: "Advice", item: `${BRAND.url}/blog` },
      { "@type": "ListItem", position: 3, name: hub.name, item: `${BRAND.url}/blog/topic/${hub.id}` },
      { "@type": "ListItem", position: 4, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Content is generated from local data only — never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
