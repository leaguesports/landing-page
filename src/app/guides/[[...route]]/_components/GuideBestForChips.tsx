import {
  resolveGuideLinkHref,
  unknownPortableTextMark,
  unknownPortableTextType,
} from "@/lib/guides/portableText";
import type { PortableTextComponents } from "@portabletext/react";
import type { TypedObject } from "@portabletext/types";
import { PortableText } from "next-sanity";
import Link from "next/link";

const CHIP_LINK =
  "font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand)]/35 underline-offset-[3px] hover:text-emerald-300";

const chipComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <span>{children}</span>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href =
        value && typeof value === "object" && "href" in value
          ? (value as { href?: unknown }).href
          : undefined;
      const resolved = resolveGuideLinkHref(href);
      if (resolved.kind === "internal") {
        return (
          <Link href={resolved.href} className={CHIP_LINK}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={resolved.href}
          className={CHIP_LINK}
          {...(resolved.kind === "external"
            ? { rel: "noopener noreferrer", target: "_blank" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  unknownType: unknownPortableTextType,
  unknownMark: unknownPortableTextMark,
  unknownBlockStyle: ({ children }) => <span>{children}</span>,
};

function asInlineBlock(block: TypedObject): TypedObject {
  if (!("listItem" in block)) return block;
  const copy = { ...block } as TypedObject & { listItem?: unknown };
  delete copy.listItem;
  return copy;
}

export function GuideBestForChips({
  id,
  title,
  items,
  accentClass,
}: {
  id: string;
  title: string;
  items: TypedObject[];
  accentClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={id} className="mt-10" data-guide-best-for="">
      <h2
        id={id}
        className={`mb-5 scroll-mt-28 border-l-[3px] ${accentClass} pl-4 font-display text-3xl tracking-wide text-white sm:text-4xl`}
      >
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={typeof item._key === "string" ? item._key : title}
            className="max-w-full rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium leading-relaxed text-zinc-300"
          >
            <PortableText value={[asInlineBlock(item)]} components={chipComponents} />
          </li>
        ))}
      </ul>
    </section>
  );
}
