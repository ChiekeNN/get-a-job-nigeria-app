import { fetchText } from "@/lib/importer/http";
import { decodeEntities, stripTagsFlat } from "@/lib/importer/extract";

export interface FeedItem {
  title: string;
  link: string;
  summary: string;
  publishedAt: string | null;
  sourceId: string | null;
}

function firstTag(xml: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(xml);
  if (!match) return "";
  return decodeEntities(
    match[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim(),
  );
}

/** Extract the numeric /hotjobs/{id}/ key so feed items dedupe against page listings. */
function sourceIdFromLink(link: string): string | null {
  const match = /\/hotjobs\/(\d+)\//.exec(link);
  return match?.[1] ?? null;
}

export async function fetchRssItems(feedUrl: string, limit = 200): Promise<FeedItem[]> {
  const xml = await fetchText(feedUrl);
  const items: FeedItem[] = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;

  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null && items.length < limit) {
    const block = match[1];
    const link = firstTag(block, "link").trim();
    if (!link) continue;

    const summaryRaw = firstTag(block, "description");
    items.push({
      title: stripTagsFlat(firstTag(block, "title")),
      link,
      summary: stripTagsFlat(summaryRaw),
      publishedAt: firstTag(block, "pubDate") || null,
      sourceId: sourceIdFromLink(link),
    });
  }

  return items;
}
