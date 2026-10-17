import { SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath } from "next/cache";
import { after, NextResponse } from "next/server";
import { resolveGoogleSitemapConfig, submitSitemapIndex } from "@/lib/seo/google-sitemap";
import { loadRelatedForRevalidate } from "@/lib/seo/revalidate-data";
import { handleSanityRevalidate } from "@/lib/seo/revalidate-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Sanity publish webhook for every page-backed document type.
 * Cache tags are not used in this app, so paths are revalidated directly.
 * Search Console submission is deferred and skipped when credentials are absent.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const google = resolveGoogleSitemapConfig(process.env);

  const result = await handleSanityRevalidate({
    rawBody,
    signature,
    secret: process.env.SANITY_REVALIDATE_SECRET,
    revalidate: (path) => {
      revalidatePath(path);
    },
    googleConfigured: google.ok,
    loadRelated: loadRelatedForRevalidate,
    submitSitemap: async () => {
      await submitSitemapIndex(process.env);
    },
    scheduleSubmit: (work) => {
      after(() => {
        work().catch((error) => {
          console.error("[revalidate] deferred sitemap submit failed", error);
        });
      });
    },
  });

  return NextResponse.json(result.body, { status: result.status });
}
