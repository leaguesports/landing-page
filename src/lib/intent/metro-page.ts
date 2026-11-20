import { sportSlugVariants, type IntentActivity } from "./activity.ts";
import type { IntentKind } from "./paths.ts";
import { normalizeSportSlug } from "../sports/catalog.ts";
import {
  canonicalWatchCitySlug,
  watchCitySlugCandidates,
} from "./watch-screenings.ts";

export const METRO_PAGE_UNIQUE_MESSAGE =
  "A metro page for this intent, activity, and city already exists.";

/**
 * `count(null)` is null in this dataset. Coalesce so a missing set is 0
 * and an editor is not blocked by a null comparison.
 */
export const METRO_PAGE_UNIQUENESS_QUERY =
  `coalesce(count(*[_type == "metroPage" && intent == $intent && activitySlug == $activitySlug && citySlug == $citySlug && !(_id in [$id, $draftId])]), 0)`;

/**
 * Published docs only. Array projections are coalesced because `count(null)`
 * and a null array projection are null in this dataset.
 */
export const METRO_PAGE_QUERY = `*[_type == "metroPage"
  && intent == $intent
  && activitySlug in $activitySlugs
  && citySlug in $citySlugs
  && !(_id in path("drafts.**"))]{
    _id,
    intent,
    activitySlug,
    citySlug,
    h1,
    "intro": coalesce(intro, []),
    bestFor,
    "faq": coalesce(faq[]{ _key, question, answer }, []),
    "relatedLinks": coalesce(relatedLinks[]{ _key, href, label }, []),
    metadata { title, description, ogTitle, ogDescription }
  }`;

export type MetroPageFaq = {
  question?: string | null;
  answer?: string | null;
};

export type MetroPageLink = {
  href?: string | null;
  label?: string | null;
};

export type MetroPageMetadata = {
  title?: string | null;
  description?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

export type MetroPageRow = {
  _id?: string | null;
  intent?: string | null;
  activitySlug?: string | null;
  citySlug?: string | null;
  h1?: string | null;
  intro?: string[] | null;
  bestFor?: string | null;
  faq?: MetroPageFaq[] | null;
  relatedLinks?: MetroPageLink[] | null;
  metadata?: MetroPageMetadata | null;
};

export type MetroPageCopy = {
  h1: string | null;
  intro: string[];
  bestFor: string | null;
  faq: { question: string; answer: string }[];
  relatedLinks: { href: string; label: string }[];
  metadata: {
    title: string | null;
    description: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
  };
};

/**
 * Slugs that are the same directory page.
 * `/watch/f1` also matches `formula-1`, and does not match `motorsport`.
 * `/watch/motorsport` does not match an `f1` doc. `/watch/premier-league`
 * does not match `soccer`. `paddle` matches `padel`. `football` matches `soccer`.
 */
export function metroActivitySlugCandidates(
  activity: Pick<IntentActivity, "slug" | "kind" | "sportSlug">,
): string[] {
  const slug = normalizeSportSlug(activity.slug);
  if (!slug) return [];
  const parent = normalizeSportSlug(activity.sportSlug);
  const candidates = new Set<string>([slug]);
  for (const variant of sportSlugVariants(slug)) {
    const normalized = normalizeSportSlug(variant);
    if (!normalized) continue;
    if (activity.kind === "series" && normalized === parent && normalized !== slug) {
      continue;
    }
    candidates.add(normalized);
  }
  return [...candidates];
}

function cleanText(value: string | null | undefined): string | null {
  const text = value?.trim() ?? "";
  return text || null;
}

function cleanParagraphs(values: readonly string[] | null | undefined): string[] {
  const paragraphs: string[] = [];
  for (const value of values ?? []) {
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (text) paragraphs.push(text);
  }
  return paragraphs;
}

export function normalizeMetroPage(row: MetroPageRow): MetroPageCopy {
  const faq: { question: string; answer: string }[] = [];
  for (const item of row.faq ?? []) {
    const question = item.question?.trim() ?? "";
    const answer = item.answer?.trim() ?? "";
    if (!question || !answer) continue;
    faq.push({ question, answer });
  }
  const relatedLinks: { href: string; label: string }[] = [];
  for (const item of row.relatedLinks ?? []) {
    const href = item.href?.trim() ?? "";
    const label = item.label?.trim() ?? "";
    if (!href || !label) continue;
    relatedLinks.push({ href, label });
  }
  const metadata = row.metadata ?? {};
  return {
    h1: cleanText(row.h1),
    intro: cleanParagraphs(row.intro),
    bestFor: cleanText(row.bestFor),
    faq,
    relatedLinks,
    metadata: {
      title: cleanText(metadata.title),
      description: cleanText(metadata.description),
      ogTitle: cleanText(metadata.ogTitle),
      ogDescription: cleanText(metadata.ogDescription),
    },
  };
}

/** Prefer the URL slug and the canonical city when several alias docs exist. */
export function pickMetroPage(
  rows: readonly MetroPageRow[] | null | undefined,
  activity: Pick<IntentActivity, "slug" | "kind" | "sportSlug">,
  citySlug: string,
): MetroPageCopy | null {
  const activitySlugs = new Set(metroActivitySlugCandidates(activity));
  const citySlugs = new Set(watchCitySlugCandidates(citySlug));
  const preferredActivity = normalizeSportSlug(activity.slug);
  const preferredCity = canonicalWatchCitySlug(citySlug);
  let best: { row: MetroPageRow; score: number } | null = null;

  for (const row of rows ?? []) {
    if (row._id?.startsWith("drafts.")) continue;
    const activityKey = normalizeSportSlug(row.activitySlug);
    const cityKey = row.citySlug?.trim().toLowerCase() ?? "";
    if (!activityKey || !cityKey) continue;
    if (!activitySlugs.has(activityKey) || !citySlugs.has(cityKey)) continue;
    let score = 0;
    if (activityKey === preferredActivity) score += 4;
    if (cityKey === preferredCity) score += 2;
    if (!best || score > best.score) best = { row, score };
  }

  return best ? normalizeMetroPage(best.row) : null;
}

export function metroPageHeading(fallback: string, h1: string | null | undefined): string {
  return h1?.trim() || fallback;
}

export function resolveMetroPageSeo(input: {
  fallbackTitle: string;
  fallbackDescription: string;
  metadata?: MetroPageMetadata | null;
}): {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  /** `absolute` skips the layout template so a CMS title is not doubled. */
  titleMode: "template" | "absolute";
} {
  const cmsTitle = input.metadata?.title?.trim() ?? "";
  const title = cmsTitle || input.fallbackTitle;
  const description = input.metadata?.description?.trim() || input.fallbackDescription;
  const ogTitle = input.metadata?.ogTitle?.trim() || title;
  const ogDescription = input.metadata?.ogDescription?.trim() || description;
  const titleMode =
    cmsTitle && /\|\s*leaguesports\s*$/i.test(cmsTitle) ? "absolute" : "template";
  return { title, description, ogTitle, ogDescription, titleMode };
}

type UniquenessClient = {
  fetch: (query: string, params: Record<string, unknown>) => Promise<number | null>;
};

/** Studio hint: one published doc per intent + activity + city. */
export async function validateMetroPageUnique(
  doc: { intent?: string; activitySlug?: string; citySlug?: string } | undefined,
  context: {
    document?: { _id?: string };
    getClient: (options: { apiVersion: string }) => UniquenessClient;
  },
): Promise<true | string> {
  const intent = doc?.intent?.trim() ?? "";
  const activitySlug = doc?.activitySlug?.trim() ?? "";
  const citySlug = doc?.citySlug?.trim() ?? "";
  if (!intent || !activitySlug || !citySlug) return true;

  const id = (context.document?._id ?? "").replace(/^drafts\./, "");
  const client = context.getClient({ apiVersion: "2026-03-08" });
  const existing = await client.fetch(METRO_PAGE_UNIQUENESS_QUERY, {
    intent,
    activitySlug,
    citySlug,
    id,
    draftId: id ? `drafts.${id}` : "drafts.",
  });
  if (existing == null || existing === 0) return true;
  return METRO_PAGE_UNIQUE_MESSAGE;
}

export function metroPagePreview(selection: {
  intent?: string;
  activitySlug?: string;
  citySlug?: string;
  h1?: string;
}): { title: string; subtitle: string } {
  const title = [selection.intent, selection.activitySlug, selection.citySlug]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" · ");
  const h1 = selection.h1?.trim() ?? "";
  return {
    title: title || h1 || "Metro page",
    subtitle: h1,
  };
}

export function metroPageFetchParams(input: {
  intent: IntentKind;
  activity: Pick<IntentActivity, "slug" | "kind" | "sportSlug">;
  citySlug: string;
}): { intent: IntentKind; activitySlugs: string[]; citySlugs: string[] } | null {
  const activitySlugs = metroActivitySlugCandidates(input.activity);
  const citySlugs = watchCitySlugCandidates(input.citySlug);
  if (activitySlugs.length === 0 || citySlugs.length === 0) return null;
  return { intent: input.intent, activitySlugs, citySlugs };
}
