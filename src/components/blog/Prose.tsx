import { AlertTriangle, Lightbulb, StickyNote } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Block } from "@/data/blog";

/**
 * Renders post bodies.
 *
 * The copy lives in `src/data/blog.ts` as structured blocks rather than JSX,
 * so a post can be edited like an article. Two pieces of inline markup are
 * understood: **bold** and [label](/path). Everything is built as React nodes
 * — no HTML is ever injected.
 */

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const BOLD = /^\*\*([^*]+)\*\*$/;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

export function inline(text: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, index) => {
    const bold = part.match(BOLD);
    if (bold) {
      return (
        <strong key={index} className="font-semibold text-ink-900">
          {bold[1]}
        </strong>
      );
    }

    const link = part.match(LINK);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/")) {
        return (
          <Link
            key={index}
            href={href}
            className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 transition hover:decoration-brand-600"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 transition hover:decoration-brand-600"
        >
          {label}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/** "What an ATS actually does" -> "what-an-ats-actually-does" */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

const CALLOUT = {
  tip: { icon: Lightbulb, ring: "border-brand-200 bg-brand-50/70", ink: "text-brand-800", chip: "text-brand-700" },
  warn: { icon: AlertTriangle, ring: "border-amber-200 bg-amber-50/80", ink: "text-amber-900", chip: "text-amber-700" },
  note: { icon: StickyNote, ring: "border-ink-200 bg-white", ink: "text-ink-700", chip: "text-ink-500" },
} as const;

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "h2":
            return (
              <h2
                key={index}
                id={headingId(block.text)}
                className="mt-9 scroll-mt-24 font-display text-[21px] font-extrabold leading-snug tracking-tight text-ink-900 sm:text-[25px]"
              >
                {block.text}
              </h2>
            );

          case "h3":
            return (
              <h3
                key={index}
                id={headingId(block.text)}
                className="mt-6 scroll-mt-24 font-display text-[16px] font-bold leading-snug text-ink-900 sm:text-[17px]"
              >
                {block.text}
              </h3>
            );

          case "p":
            return (
              <p key={index} className="mt-3.5 text-[14.5px] leading-[1.75] text-ink-700">
                {inline(block.text)}
              </p>
            );

          case "ul":
            return (
              <ul key={index} className="mt-4 space-y-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brand-500"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 text-[14px] leading-[1.7] text-ink-700">
                      {inline(item)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={index} className="mt-4 space-y-3">
                {block.items.map((item, step) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink-950 font-mono text-[10px] font-bold text-white">
                      {step + 1}
                    </span>
                    <span className="min-w-0 text-[14px] leading-[1.7] text-ink-700">
                      {inline(item)}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case "callout": {
            const style = CALLOUT[block.tone];
            const Icon = style.icon;
            return (
              <aside key={index} className={`mt-5 flex items-start gap-3 rounded-xl border p-3.5 ${style.ring}`}>
                <Icon className={`mt-0.5 size-4 shrink-0 ${style.chip}`} aria-hidden="true" />
                <div className="min-w-0">
                  <p className={`text-[12px] font-bold uppercase tracking-wide ${style.chip}`}>
                    {block.title}
                  </p>
                  <p className={`mt-1 text-[13.5px] leading-relaxed ${style.ink}`}>
                    {inline(block.text)}
                  </p>
                </div>
              </aside>
            );
          }

          case "template":
            return (
              <figure key={index} className="mt-5 overflow-hidden rounded-xl border border-ink-200 bg-white">
                <figcaption className="border-b border-ink-100 bg-ink-50/80 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-500">
                  {block.title}
                </figcaption>
                <div className="space-y-1 px-3.5 py-3">
                  {block.lines.map((line, lineIndex) =>
                    line ? (
                      <p
                        key={lineIndex}
                        className="text-[12.5px] leading-relaxed text-ink-700 [overflow-wrap:anywhere]"
                      >
                        {line}
                      </p>
                    ) : (
                      <span key={lineIndex} className="block h-1.5" aria-hidden="true" />
                    ),
                  )}
                </div>
              </figure>
            );

          case "cta":
            return (
              <aside
                key={index}
                className="mt-8 overflow-hidden rounded-2xl bg-ink-950 p-5 text-white sm:p-6"
              >
                <p className="font-display text-[17px] font-extrabold leading-snug sm:text-lg">
                  {block.title}
                </p>
                <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/70">
                  {block.text}
                </p>
                <Link href={block.href} className="btn btn-amber mt-4 w-full justify-center sm:w-auto">
                  {block.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </aside>
            );
        }
      })}
    </>
  );
}
