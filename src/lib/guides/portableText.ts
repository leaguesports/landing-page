import type { TypedObject } from "@portabletext/types";
import type { ReactNode } from "react";

const BUILTIN_MARKS = new Set([
  "strong",
  "em",
  "underline",
  "strike-through",
  "code",
]);

export type GuideLinkHref =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "anchor"; href: string };

function isLeagueSportsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "leaguesports.co.za" || host === "www.leaguesports.co.za";
}

/**
 * Resolve a Portable Text link href without throwing.
 * Missing/invalid hrefs become `#` on a plain anchor (never next/link).
 */
export function resolveGuideLinkHref(href: unknown): GuideLinkHref {
  if (typeof href !== "string") {
    return { kind: "anchor", href: "#" };
  }

  const trimmed = href.trim();
  if (!trimmed) {
    return { kind: "anchor", href: "#" };
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { kind: "internal", href: trimmed };
  }

  if (trimmed.startsWith("#")) {
    return { kind: "anchor", href: trimmed };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { kind: "anchor", href: "#" };
      }
      if (isLeagueSportsHost(url.hostname)) {
        const path = `${url.pathname}${url.search}${url.hash}` || "/";
        return { kind: "internal", href: path };
      }
      return { kind: "external", href: url.href };
    } catch {
      return { kind: "anchor", href: "#" };
    }
  }

  return { kind: "anchor", href: "#" };
}

function isUsableMarkDef(def: unknown): boolean {
  if (!def || typeof def !== "object") return false;
  const record = def as { _type?: unknown; href?: unknown; _key?: unknown };
  if (typeof record._key !== "string" || !record._key) return false;
  if (record._type === "link") {
    return typeof record.href === "string" && record.href.trim().length > 0;
  }
  return true;
}

/**
 * Drop broken markDefs (common Sanity paste issue) and marks that
 * reference missing defs so PortableText never sees dangling keys.
 */
export function normalizeGuideContent(content: unknown): TypedObject[] {
  if (!Array.isArray(content)) return [];

  return content.flatMap((block) => {
    if (!block || typeof block !== "object") return [];
    const record = block as TypedObject & {
      markDefs?: unknown;
      children?: unknown;
    };

    if (!Array.isArray(record.markDefs) && !Array.isArray(record.children)) {
      return [record];
    }

    const markDefs = Array.isArray(record.markDefs)
      ? record.markDefs.filter(isUsableMarkDef)
      : [];

    const defKeys = new Set(
      markDefs
        .map((def) => {
          if (!def || typeof def !== "object" || !("_key" in def)) return "";
          return typeof def._key === "string" ? def._key : "";
        })
        .filter(Boolean),
    );

    const children = Array.isArray(record.children)
      ? record.children.map((child) => {
          if (!child || typeof child !== "object") return child;
          const node = child as { marks?: unknown };
          if (!Array.isArray(node.marks)) return child;
          return {
            ...node,
            marks: node.marks.filter((mark) => {
              if (typeof mark !== "string") return false;
              return BUILTIN_MARKS.has(mark) || defKeys.has(mark);
            }),
          };
        })
      : record.children;

    return [
      {
        ...record,
        ...(Array.isArray(record.markDefs) ? { markDefs } : {}),
        ...(Array.isArray(record.children) ? { children } : {}),
      },
    ];
  });
}

/** PortableText unknownType: skip custom/unknown blocks instead of throwing. */
export function unknownPortableTextType(): null {
  return null;
}

/** PortableText unknownMark: keep the text, drop the unknown decorator. */
export function unknownPortableTextMark({
  children,
}: {
  children?: ReactNode;
}): ReactNode {
  return children ?? null;
}
