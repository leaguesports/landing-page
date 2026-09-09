import type { GuideHeading } from "@/lib/guides/presentation";
import { shouldShowGuideToc } from "@/lib/guides/presentation";

export function GuideToc({ headings }: { headings: GuideHeading[] }) {
  if (!shouldShowGuideToc(headings)) return null;

  return (
    <nav
      aria-label="On this page"
      className="mb-10 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3.5 sm:px-5"
      data-guide-toc=""
    >
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        On this page
      </p>
      <ul className="flex flex-wrap gap-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
