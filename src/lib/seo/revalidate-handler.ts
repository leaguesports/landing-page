import { isValidSignature } from "@sanity/webhook";
import {
  readPublishedDocument,
  revalidatePathsForDocument,
  type PublishedDoc,
  type RelatedPages,
} from "./published-pages.ts";

/** One Search Console submit per warm instance during a publish burst. */
export const SITEMAP_SUBMIT_MIN_INTERVAL_MS = 60_000;

type SubmitGate = { lastClaimAt: number };

const moduleGate: SubmitGate = { lastClaimAt: Number.NEGATIVE_INFINITY };

export function tryClaimSitemapSubmit(
  lastClaimAt: number,
  now: number,
  intervalMs = SITEMAP_SUBMIT_MIN_INTERVAL_MS,
): { claimed: boolean; lastClaimAt: number } {
  if (now - lastClaimAt < intervalMs) {
    return { claimed: false, lastClaimAt };
  }
  return { claimed: true, lastClaimAt: now };
}

export function claimSitemapSubmit(now = Date.now()): boolean {
  const next = tryClaimSitemapSubmit(moduleGate.lastClaimAt, now);
  moduleGate.lastClaimAt = next.lastClaimAt;
  return next.claimed;
}

export function resetSitemapSubmitGate(): void {
  moduleGate.lastClaimAt = Number.NEGATIVE_INFINITY;
}

export type RevalidateResult = {
  status: number;
  body: {
    ok: boolean;
    error?: string;
    ignored?: string;
    revalidated: string[];
    sitemapSubmit: "skipped" | "debounced" | "scheduled" | "submitted" | "error";
  };
};

/**
 * In-memory gate shared by warm serverless instances only.
 * A burst that lands on several isolates can still submit once per isolate
 * per interval. Revalidation is never debounced. There is no shared KV in
 * this app, so the gate cannot coordinate across regions.
 */
export async function handleSanityRevalidate(input: {
  rawBody: string;
  signature: string | null;
  secret: string | undefined;
  now?: number;
  revalidate: (path: string) => void;
  googleConfigured: boolean;
  loadRelated?: (doc: PublishedDoc) => Promise<RelatedPages>;
  submitSitemap?: () => Promise<void>;
  scheduleSubmit?: (work: () => Promise<void>) => void;
  claimSubmit?: (now: number) => boolean;
}): Promise<RevalidateResult> {
  const skipped = (
    status: number,
    extra: { error?: string; ignored?: string; revalidated?: string[] },
  ): RevalidateResult => ({
    status,
    body: {
      ok: status >= 200 && status < 300,
      revalidated: extra.revalidated ?? [],
      sitemapSubmit: "skipped",
      ...(extra.error ? { error: extra.error } : {}),
      ...(extra.ignored ? { ignored: extra.ignored } : {}),
    },
  });

  const secret = input.secret?.trim() ?? "";
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set");
    return skipped(401, { error: "missing-secret" });
  }

  const valid = await isValidSignature(input.rawBody, input.signature ?? "", secret);
  if (!valid) {
    return skipped(401, { error: "invalid-signature" });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(input.rawBody) as unknown;
  } catch {
    return skipped(400, { error: "invalid-json" });
  }

  const read = readPublishedDocument(payload);
  if (read.ignored === "draft") {
    return skipped(200, { ignored: "draft" });
  }
  if (!read.doc) {
    console.error("[revalidate] webhook body had no _type");
    return skipped(200, { ignored: "missing-type" });
  }

  let related: RelatedPages = {};
  if (input.loadRelated) {
    try {
      related = (await input.loadRelated(read.doc)) ?? {};
    } catch (error) {
      console.error("[revalidate] related pages lookup failed", error);
    }
  }

  const paths = revalidatePathsForDocument(read.doc, related);
  for (const path of paths) {
    try {
      input.revalidate(path);
    } catch (error) {
      console.error("[revalidate] path failed", path, error);
    }
  }

  const base = {
    ok: true,
    revalidated: paths,
  };

  if (!input.googleConfigured || !input.submitSitemap) {
    console.info(
      "[revalidate] Search Console submit skipped (GSC_SITE_URL or service account missing)",
    );
    return { status: 200, body: { ...base, sitemapSubmit: "skipped" } };
  }

  const now = input.now ?? Date.now();
  const claim = input.claimSubmit ?? claimSitemapSubmit;
  if (!claim(now)) {
    return { status: 200, body: { ...base, sitemapSubmit: "debounced" } };
  }

  const work = async () => {
    try {
      await input.submitSitemap?.();
    } catch (error) {
      console.error("[revalidate] sitemap submit failed", error);
      throw error;
    }
  };

  if (input.scheduleSubmit) {
    input.scheduleSubmit(async () => {
      try {
        await work();
      } catch {
        // Logged above. The webhook response already returned 200.
      }
    });
    return { status: 200, body: { ...base, sitemapSubmit: "scheduled" } };
  }

  try {
    await work();
    return { status: 200, body: { ...base, sitemapSubmit: "submitted" } };
  } catch {
    return { status: 200, body: { ...base, sitemapSubmit: "error" } };
  }
}
