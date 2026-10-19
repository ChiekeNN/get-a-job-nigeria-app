import { splitJobCopy, type JobCopyBlock } from "@/lib/job-copy";

/**
 * Renders an advert's body as paragraphs instead of one wall of text.
 * Every "Job Title: …" line stands alone with the title in bold, matching the
 * bold section headings further down the page.
 */
export function JobDescription({ text }: { text: string }) {
  const blocks = splitJobCopy(text);

  return (
    <div className="mt-2 space-y-2.5 text-sm leading-relaxed text-ink-600">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h3
              key={index}
              className="!mt-5 font-display text-sm font-bold text-ink-900 first:!mt-0"
            >
              {block.text}
            </h3>
          );
        }

        if (block.kind === "field") {
          return (
            <p key={index} className="break-words">
              <span className="font-semibold text-ink-800">{block.label}:</span>{" "}
              {block.label.toLowerCase() === "job title" ? (
                <strong className="font-bold text-ink-900">{block.value}</strong>
              ) : (
                block.value
              )}
            </p>
          );
        }

        return (
          <p key={index} className="break-words">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export type { JobCopyBlock };
