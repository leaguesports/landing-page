import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureSitemapRoutes } from "../../app/sitemap/entries.ts";
import { toIndexableSitemapFixtures } from "./sitemap.ts";
import type { UpcomingFixture } from "../sports/events-feed.ts";

function words(count: number, seed: string): string {
  return Array.from({ length: count }, (_, i) => `${seed}${i + 1}`).join(" ");
}

const INDEXABLE_COPY = {
  seoIntro: words(50, "intro"),
  localAngle: words(35, "local"),
  faqs: [
    {
      question: "Where can I watch this fixture in Johannesburg?",
      answer: words(12, "a"),
    },
    {
      question: "What time does kickoff start in South Africa?",
      answer: words(12, "b"),
    },
    {
      question: "Which bars screen this match in Cape Town?",
      answer: words(12, "c"),
    },
  ],
};

function fixture(
  overrides: Partial<UpcomingFixture> & Pick<UpcomingFixture, "slug" | "title">,
): UpcomingFixture {
  return {
    sportSlug: "rugby",
    startsAt: "2026-09-06T16:00:00.000Z",
    venues: [],
    kind: "event",
    ...overrides,
  };
}

describe("toIndexableSitemapFixtures", () => {
  it("excludes thin stubs that are missing intro, angle, or FAQs", () => {
    const rows = toIndexableSitemapFixtures([
      fixture({ slug: "thin-stub-2026-09-06", title: "Thin stub" }),
      fixture({
        slug: "almost-2026-09-06",
        title: "Almost",
        seoIntro: INDEXABLE_COPY.seoIntro,
        localAngle: INDEXABLE_COPY.localAngle,
      }),
    ]);
    assert.deepEqual(rows, []);
  });

  it("includes complete fixtures with lastmod fields", () => {
    const rows = toIndexableSitemapFixtures([
      fixture({
        slug: "springboks-vs-all-blacks-2026-09-06",
        title: "Springboks vs All Blacks",
        updatedAt: "2026-09-01T00:00:00.000Z",
        ...INDEXABLE_COPY,
      }),
    ]);
    assert.deepEqual(rows, [
      {
        slug: "springboks-vs-all-blacks-2026-09-06",
        startsAt: "2026-09-06T16:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
    ]);
  });

  it("only indexable fixtures become sitemap URLs, and XML stays path-only", () => {
    const fixtures = [
      fixture({ slug: "thin-stub-2026-09-06", title: "Thin stub" }),
      fixture({
        slug: "springboks-vs-all-blacks-2026-09-06",
        title: "Springboks vs All Blacks",
        ...INDEXABLE_COPY,
      }),
    ];
    const origin = "https://leaguesports.co.za";
    const now = new Date("2026-09-06T08:00:00.000Z");
    const routes = fixtureSitemapRoutes(
      origin,
      toIndexableSitemapFixtures(fixtures),
      now,
    );
    assert.deepEqual(
      routes.map((row) => row.url),
      [`${origin}/events/springboks-vs-all-blacks-2026-09-06`],
    );
    assert.equal(
      routes.some((row) => row.url.includes("?") || row.url.includes("&")),
      false,
    );
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${routes
      .map((row) => `<url><loc>${row.url}</loc></url>`)
      .join("\n")}\n</urlset>`;
    assert.equal(xml.includes("&"), false);
    assert.match(xml, /^<\?xml /);
  });
});
