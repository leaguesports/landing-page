import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/session/"],
    },
    sitemap: "https://leaguesports.co.za/sitemap.xml",
  };
}
