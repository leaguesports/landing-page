import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectIndexedIntentPairs } from "../../lib/intent/indexed-pairs.ts";
import {
  buildSitemapEntries,
  fixtureSitemapRoutes,
  guideSitemapRoutes,
  intentSitemapRoutes,
  isSitemapSlug,
  resolveSitemapOrigin,
  sitemapAbsoluteUrl,
  sitemapEntry,
  SITEMAP_FALLBACK_ORIGIN,
  staticSitemapRoutes,
  toSitemapDate,
  venueSitemapRoutes,
} from "./entries.ts";

const ORIGIN = "https://leaguesports.co.za";
const NOW = new Date("2026-09-06T08:00:00.000Z");

function serializeLikeNext(entries: { url: string }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map((entry) => `<url><loc>${entry.url}</loc></url>`)
    .join("\n")}\n</urlset>`;
}

describe("resolveSitemapOrigin", () => {
  it("uses the production origin when env is empty or invalid", () => {
    assert.equal(resolveSitemapOrigin(null), SITEMAP_FALLBACK_ORIGIN);
    assert.equal(resolveSitemapOrigin("   "), SITEMAP_FALLBACK_ORIGIN);
    assert.equal(resolveSitemapOrigin("notaurl"), SITEMAP_FALLBACK_ORIGIN);
    assert.equal(resolveSitemapOrigin("ftp://example.com"), SITEMAP_FALLBACK_ORIGIN);
  });

  it("strips trailing slashes and accepts host-only Vercel URLs", () => {
    assert.equal(
      resolveSitemapOrigin("https://leaguesports.co.za/"),
      "https://leaguesports.co.za",
    );
    assert.equal(
      resolveSitemapOrigin("landing-page.vercel.app"),
      "https://landing-page.vercel.app",
    );
  });
});

describe("isSitemapSlug", () => {
  it("accepts published venue, guide, and fixture slugs", () => {
    assert.equal(isSitemapSlug("rb-club-melrose-arch"), true);
    assert.equal(isSitemapSlug("best-sports-bars-cape-town"), true);
    assert.equal(isSitemapSlug("springboks-vs-all-blacks-2026-09-06"), true);
  });

  it("skips spaces, query strings, and empty values", () => {
    assert.equal(isSitemapSlug("padel club"), false);
    assert.equal(isSitemapSlug("padel?x=1"), false);
    assert.equal(isSitemapSlug("watch&play"), false);
    assert.equal(isSitemapSlug(""), false);
    assert.equal(isSitemapSlug(null), false);
  });
});

describe("toSitemapDate", () => {
  it("falls back on missing or invalid dates", () => {
    assert.equal(toSitemapDate(null, NOW).toISOString(), NOW.toISOString());
    assert.equal(
      toSitemapDate("not-a-date", NOW).toISOString(),
      NOW.toISOString(),
    );
    assert.equal(
      toSitemapDate("2026-04-01T10:00:00.000Z", NOW).toISOString(),
      "2026-04-01T10:00:00.000Z",
    );
  });
});

describe("sitemapAbsoluteUrl", () => {
  it("builds path-only absolute URLs", () => {
    assert.equal(sitemapAbsoluteUrl(ORIGIN, "/"), ORIGIN);
    assert.equal(
      sitemapAbsoluteUrl(ORIGIN, "/guides/best-padel"),
      `${ORIGIN}/guides/best-padel`,
    );
  });

  it("rejects query-string city hubs that break sitemap XML", () => {
    assert.equal(
      sitemapAbsoluteUrl(ORIGIN, "/venues?intent=watch&location=cape-town"),
      null,
    );
  });
});

describe("sitemapEntry", () => {
  it("drops URLs that would emit raw & in Next sitemap XML", () => {
    assert.equal(
      sitemapEntry(`${ORIGIN}/venues?intent=watch&location=cape-town`, {
        lastModified: NOW,
        changeFrequency: "daily",
        priority: 0.85,
      }),
      null,
    );
  });
});

describe("static and CMS row mappers", () => {
  it("covers static hubs without query-string city URLs", () => {
    const routes = staticSitemapRoutes(ORIGIN, NOW);
    const urls = routes.map((route) => route.url);
    assert.ok(urls.includes(ORIGIN));
    assert.ok(urls.includes(`${ORIGIN}/venues`));
    assert.ok(urls.includes(`${ORIGIN}/watch`));
    assert.ok(urls.includes(`${ORIGIN}/play`));
    assert.ok(urls.includes(`${ORIGIN}/guides`));
    assert.ok(urls.includes(`${ORIGIN}/events`));
    assert.ok(urls.includes(`${ORIGIN}/athletes`));
    assert.ok(urls.includes(`${ORIGIN}/integrations`));
    assert.equal(urls.some((url) => url.includes("?")), false);
  });

  it("skips bad venue, guide, intent, and fixture rows", () => {
    assert.deepEqual(
      venueSitemapRoutes(
        ORIGIN,
        [null, { slug: "has space" }, { slug: "ok-venue", updatedAt: "bad" }],
        NOW,
      ).map((row) => row.url),
      [`${ORIGIN}/venues/ok-venue`],
    );
    assert.deepEqual(
      guideSitemapRoutes(
        ORIGIN,
        [{ slug: "" }, { slug: "Best_Padel" }, { slug: "joburg-padel" }],
        NOW,
      ).map((row) => row.url),
      [`${ORIGIN}/guides/joburg-padel`],
    );
    assert.deepEqual(
      intentSitemapRoutes(
        ORIGIN,
        "watch",
        [
          { activitySlug: "f1", locationSlug: "mid rand" },
          { activitySlug: "f1", locationSlug: "midrand" },
        ],
        NOW,
      ).map((row) => row.url),
      [`${ORIGIN}/watch/f1/midrand`],
    );
    assert.deepEqual(
      fixtureSitemapRoutes(
        ORIGIN,
        [
          {
            slug: "springboks-vs-all-blacks-2026-09-06",
            startsAt: "2026-09-06T16:00:00.000Z",
            updatedAt: "2026-09-01T12:00:00.000Z",
          },
        ],
        NOW,
      ).map((row) => ({ url: row.url, lastModified: row.lastModified.toISOString() })),
      [
        {
          url: `${ORIGIN}/events/springboks-vs-all-blacks-2026-09-06`,
          lastModified: "2026-09-01T12:00:00.000Z",
        },
      ],
    );
  });
});

describe("buildSitemapEntries", () => {
  it("never throws when fetchers reject and still returns static hubs", async () => {
    const entries = await buildSitemapEntries({
      baseUrl: ORIGIN,
      now: NOW,
      source: {
        getVenues: async () => {
          throw new Error("venue GROQ failed");
        },
        getGuides: async () => {
          throw new Error("listGuides exploded");
        },
        getIntentPairs: async () => {
          throw new Error("intent pairs failed");
        },
        getFixtures: async () => {
          throw new Error("fixtures failed");
        },
      },
    });

    const urls = entries.map((entry) => entry.url);
    assert.ok(urls.includes(`${ORIGIN}/watch`));
    assert.ok(urls.includes(`${ORIGIN}/guides`));
    assert.equal(urls.some((url) => url.includes("/venues/")), false);
  });

  it("includes published venues, guides, hubs, and live fixtures", async () => {
    const entries = await buildSitemapEntries({
      baseUrl: "not a url",
      now: NOW,
      source: {
        getVenues: async () => [
          { slug: "the-baron-sandton", updatedAt: "2026-09-01T00:00:00.000Z" },
          { slug: "broken slug" },
        ],
        getGuides: async () => [{ slug: "best-sports-bars-cape-town" }],
        getIntentPairs: async (intent) =>
          intent === "watch"
            ? [{ activitySlug: "f1", locationSlug: "midrand" }]
            : [{ activitySlug: "padel", locationSlug: "fourways" }],
        getFixtures: async () => [
          { slug: "springboks-vs-all-blacks-2026-09-06" },
        ],
      },
    });

    const urls = entries.map((entry) => entry.url);
    assert.ok(urls.includes(`${ORIGIN}/venues/the-baron-sandton`));
    assert.ok(urls.includes(`${ORIGIN}/guides/best-sports-bars-cape-town`));
    assert.ok(urls.includes(`${ORIGIN}/watch/f1/midrand`));
    assert.ok(urls.includes(`${ORIGIN}/play/padel/fourways`));
    assert.ok(
      urls.includes(`${ORIGIN}/events/springboks-vs-all-blacks-2026-09-06`),
    );
    assert.equal(urls.includes(`${ORIGIN}/venues/broken slug`), false);

    const xml = serializeLikeNext(entries);
    assert.equal(xml.includes("&"), false);
    assert.match(xml, /^<\?xml /);
  });

  it("includes city landings like /play/golf/johannesburg and watch peers", async () => {
    const playPairs = collectIndexedIntentPairs("play", [
      {
        activitySlugs: ["golf"],
        locationSlug: "sandton",
        parentSlug: "johannesburg",
        suburbSlug: "sandton",
        citySlug: "johannesburg",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
      {
        activitySlugs: ["padel"],
        locationSlug: "fourways",
        parentSlug: "johannesburg",
        citySlug: "johannesburg",
      },
    ]);
    const watchPairs = collectIndexedIntentPairs(
      "watch",
      [
        {
          activitySlugs: ["rugby", "golf"],
          locationSlug: "sandton",
          parentSlug: "johannesburg",
          citySlug: "johannesburg",
        },
        {
          activitySlugs: ["motorsport"],
          locationSlug: "midrand",
          parentSlug: "johannesburg",
          citySlug: "johannesburg",
        },
      ],
      [{ slug: "f1", sportSlug: "motorsport" }],
    );

    const entries = await buildSitemapEntries({
      baseUrl: ORIGIN,
      now: NOW,
      source: {
        getVenues: async () => [],
        getGuides: async () => [],
        getIntentPairs: async (intent) =>
          intent === "watch" ? watchPairs : playPairs,
        getFixtures: async () => [],
      },
    });

    const urls = entries.map((entry) => entry.url);
    assert.ok(urls.includes(`${ORIGIN}/play/golf/johannesburg`));
    assert.ok(urls.includes(`${ORIGIN}/play/golf/sandton`));
    assert.ok(urls.includes(`${ORIGIN}/play/padel/johannesburg`));
    assert.ok(urls.includes(`${ORIGIN}/watch/rugby/johannesburg`));
    assert.ok(urls.includes(`${ORIGIN}/watch/f1/johannesburg`));
    assert.ok(urls.includes(`${ORIGIN}/watch/f1/midrand`));
    assert.equal(urls.includes(`${ORIGIN}/watch/golf/johannesburg`), false);
    assert.equal(urls.includes(`${ORIGIN}/play/golf/cape-town`), false);

    const golfCity = entries.find(
      (entry) => entry.url === `${ORIGIN}/play/golf/johannesburg`,
    );
    const golfSuburb = entries.find(
      (entry) => entry.url === `${ORIGIN}/play/golf/sandton`,
    );
    assert.ok(golfCity);
    assert.ok(golfSuburb);
    assert.equal(golfCity.changeFrequency, golfSuburb.changeFrequency);
    assert.equal(golfCity.priority, golfSuburb.priority);
    assert.equal(golfCity.changeFrequency, "daily");
    assert.equal(golfCity.priority, 1);

    const xml = serializeLikeNext(entries);
    assert.equal(xml.includes("&"), false);
    assert.equal(
      urls.some((url) => url.includes("?") || url.includes("&")),
      false,
    );
    assert.match(xml, /^<\?xml /);
  });
});

describe("fixture sitemap lastmod + XML guards", () => {
  it("prefers CMS updatedAt then kickoff, and still rejects query strings", () => {
    const [withUpdated] = fixtureSitemapRoutes(
      ORIGIN,
      [
        {
          slug: "proteas-vs-india-2026-09-20",
          startsAt: "2026-09-20T12:00:00.000Z",
          updatedAt: "2026-09-02T08:00:00.000Z",
        },
      ],
      NOW,
    );
    assert.equal(
      withUpdated?.lastModified.toISOString(),
      "2026-09-02T08:00:00.000Z",
    );

    const [withKickoff] = fixtureSitemapRoutes(
      ORIGIN,
      [{ slug: "sa20-final-2026-02-01", startsAt: "2026-02-01T16:00:00.000Z" }],
      NOW,
    );
    assert.equal(
      withKickoff?.lastModified.toISOString(),
      "2026-02-01T16:00:00.000Z",
    );

    assert.equal(
      fixtureSitemapRoutes(ORIGIN, [{ slug: "bad slug" }], NOW).length,
      0,
    );
  });
});
