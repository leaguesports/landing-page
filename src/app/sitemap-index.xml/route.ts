import { NextResponse } from "next/server";
import {
  buildSitemapIndexXml,
  resolveSitemapOrigin,
} from "@/app/sitemap/entries";
import { getSiteBaseUrl } from "@/lib/site-url";

export const revalidate = 3600;

function safeSiteBaseUrl(): string {
  try {
    return resolveSitemapOrigin(getSiteBaseUrl());
  } catch (error) {
    console.error("[sitemap] getSiteBaseUrl failed", error);
    return resolveSitemapOrigin(null);
  }
}

export function GET() {
  const xml = buildSitemapIndexXml(safeSiteBaseUrl());
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
