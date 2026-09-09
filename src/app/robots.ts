import { getSiteBaseUrl } from "@/lib/site-url";
import { SITEMAP_INDEX_PATH } from "@/app/sitemap/entries";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/components/"],
      },
    ],
    sitemap: `${baseUrl}${SITEMAP_INDEX_PATH}`,
  };
}
