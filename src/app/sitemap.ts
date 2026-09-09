import {
  buildSitemapBucket,
  listSitemapModules,
  parseSitemapBucketId,
  resolveSitemapOrigin,
} from "@/app/sitemap/entries";
import { createCmsSource } from "@/app/sitemap/source";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const maxDuration = 60;

function safeSiteBaseUrl(): string {
  try {
    return resolveSitemapOrigin(getSiteBaseUrl());
  } catch (error) {
    console.error("[sitemap] getSiteBaseUrl failed", error);
    return resolveSitemapOrigin(null);
  }
}

export async function generateSitemaps() {
  return listSitemapModules();
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const rawId = await props.id;
  const id = parseSitemapBucketId(rawId);
  if (!id) {
    console.error("[sitemap] unknown bucket", rawId);
    return [];
  }

  try {
    return await buildSitemapBucket(id, {
      baseUrl: safeSiteBaseUrl(),
      source: createCmsSource(),
    });
  } catch (error) {
    console.error(`[sitemap] ${id} generation failed`, error);
    if (id === "static") {
      return buildSitemapBucket("static", { baseUrl: safeSiteBaseUrl() });
    }
    return [];
  }
}
