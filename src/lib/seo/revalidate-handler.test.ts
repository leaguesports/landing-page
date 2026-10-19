import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeSignatureHeader } from "@sanity/webhook";
import { fixtureSlugFromTitle } from "../sports/events-feed.ts";
import {
  claimSitemapSubmit,
  handleSanityRevalidate,
  resetSitemapSubmitGate,
  tryClaimSitemapSubmit,
  SITEMAP_SUBMIT_MIN_INTERVAL_MS,
} from "./revalidate-handler.ts";

const SECRET = "revalidate-test-secret";
const SIGNED_AT = Date.parse("2026-09-06T08:00:00.000Z");

async function signed(body: unknown, secret = SECRET) {
  const rawBody = JSON.stringify(body);
  const signature = await encodeSignatureHeader(rawBody, SIGNED_AT, secret);
  return { rawBody, signature };
}

function recorder() {
  const paths: string[] = [];
  return {
    paths,
    revalidate(path: string) {
      paths.push(path);
    },
  };
}

describe("tryClaimSitemapSubmit", () => {
  it("allows one submit per interval and another after the window", () => {
    const first = tryClaimSitemapSubmit(Number.NEGATIVE_INFINITY, 1_000);
    assert.equal(first.claimed, true);
    const burst = tryClaimSitemapSubmit(first.lastClaimAt, 1_000 + 5_000);
    assert.equal(burst.claimed, false);
    assert.equal(burst.lastClaimAt, first.lastClaimAt);
    const later = tryClaimSitemapSubmit(
      first.lastClaimAt,
      1_000 + SITEMAP_SUBMIT_MIN_INTERVAL_MS,
    );
    assert.equal(later.claimed, true);
  });
});

describe("handleSanityRevalidate", () => {
  it("rejects a missing or invalid signature before revalidating", async () => {
    const recorded = recorder();
    const missing = await handleSanityRevalidate({
      rawBody: "{}",
      signature: null,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.equal(missing.status, 401);
    assert.equal(missing.body.error, "invalid-signature");
    assert.deepEqual(recorded.paths, []);

    const { rawBody } = await signed({ _id: "e1", _type: "guide", slug: "joburg-padel" });
    const wrong = await handleSanityRevalidate({
      rawBody,
      signature: `t=${SIGNED_AT},v1=not-the-signature`,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.equal(wrong.status, 401);
    assert.equal(wrong.body.error, "invalid-signature");
    assert.deepEqual(recorded.paths, []);

    const noSecret = await handleSanityRevalidate({
      rawBody,
      signature: "t=1,v1=abc",
      secret: "  ",
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.equal(noSecret.status, 401);
    assert.equal(noSecret.body.error, "missing-secret");
  });

  it("revalidates an event page, matching venue pages, and the events sitemap", async () => {
    const startsAt = "2026-09-06T16:00:00.000Z";
    const recorded = recorder();
    const { rawBody, signature } = await signed({
      _id: "event-1",
      _type: "event",
      title: "Springboks vs All Blacks",
      slug: "springboks-all-blacks",
      startsAt,
      hostVenue: "ellis-park",
      relatedGuide: "where-to-watch-rugby-johannesburg",
    });

    const result = await handleSanityRevalidate({
      rawBody,
      signature,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
      submitSitemap: async () => {
        throw new Error("submit should be skipped");
      },
      loadRelated: async () => ({
        screeningVenues: [
          {
            slug: "the-baron",
            upcoming_screenings: [
              { title: "Springboks vs All-Blacks", startsAt },
            ],
          },
          {
            slug: "molly-malones",
            upcoming_screenings: [
              { title: "Springboks vs All Blacks", startsAt: "2026-09-07T16:00:00.000Z" },
            ],
          },
        ],
      }),
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.sitemapSubmit, "skipped");
    const canonical = `/events/${fixtureSlugFromTitle("Springboks vs All Blacks", startsAt)}`;
    assert.ok(recorded.paths.includes(canonical));
    assert.ok(recorded.paths.includes("/events/springboks-all-blacks"));
    assert.ok(recorded.paths.includes("/events"));
    assert.ok(recorded.paths.includes("/venues/the-baron"));
    assert.ok(recorded.paths.includes("/venues/ellis-park"));
    assert.ok(recorded.paths.includes("/guides/where-to-watch-rugby-johannesburg"));
    assert.equal(recorded.paths.includes("/venues/molly-malones"), false);
    assert.ok(recorded.paths.includes("/sitemap/events.xml"));
    assert.ok(recorded.paths.includes("/sitemap-index.xml"));
    assert.equal(recorded.paths.includes("/sitemap/venues.xml"), false);
  });

  it("revalidates a venue, the events it lists, and its metro hubs", async () => {
    const startsAt = "2026-09-06T16:00:00.000Z";
    const recorded = recorder();
    const { rawBody, signature } = await signed({
      _id: "venue-1",
      _type: "venue",
      name: "The Baron",
      slug: { current: "the-baron" },
      sports: ["padel", "golf"],
      broadcasts: ["rugby"],
      upcoming_screenings: [
        { title: "Springboks vs All Blacks", startsAt },
      ],
      venueLocations: {
        locationSlug: "sandton",
        parentSlug: "johannesburg",
        suburbSlug: "sandton",
        citySlug: "johannesburg",
      },
    });

    const result = await handleSanityRevalidate({
      rawBody,
      signature,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });

    assert.equal(result.status, 200);
    assert.ok(recorded.paths.includes("/venues/the-baron"));
    assert.ok(recorded.paths.includes("/venues"));
    assert.ok(
      recorded.paths.includes(
        `/events/${fixtureSlugFromTitle("Springboks vs All Blacks", startsAt)}`,
      ),
    );
    assert.ok(recorded.paths.includes("/play/padel"));
    assert.ok(recorded.paths.includes("/play/padel/sandton"));
    assert.ok(recorded.paths.includes("/play/padel/johannesburg"));
    assert.ok(recorded.paths.includes("/play/golf"));
    assert.ok(recorded.paths.includes("/play/golf/johannesburg"));
    assert.equal(recorded.paths.includes("/watch/golf"), false);
    assert.ok(recorded.paths.includes("/watch/rugby"));
    assert.ok(recorded.paths.includes("/watch/rugby/sandton"));
    assert.ok(recorded.paths.includes("/watch/rugby/johannesburg"));
    assert.ok(recorded.paths.includes("/watch/johannesburg"));
    assert.equal(recorded.paths.includes("/watch/sandton"), false);
    assert.ok(recorded.paths.includes("/sitemap/venues.xml"));
    assert.ok(recorded.paths.includes("/sitemap/play-cities.xml"));
    assert.ok(recorded.paths.includes("/sitemap/watch-cities.xml"));
    assert.ok(recorded.paths.includes("/sitemap-index.xml"));
  });

  it("revalidates guide, metro, sport, series, and city-hub pages", async () => {
    const recorded = recorder();

    const guide = await signed({
      _id: "guide-1",
      _type: "guide",
      slug: "best-sports-bars-cape-town",
    });
    await handleSanityRevalidate({
      ...guide,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.ok(recorded.paths.includes("/guides/best-sports-bars-cape-town"));
    assert.ok(recorded.paths.includes("/guides"));
    assert.ok(recorded.paths.includes("/sitemap/guides.xml"));

    recorded.paths.length = 0;
    const metro = await signed({
      _id: "metro-1",
      _type: "metroPage",
      intent: "play",
      activitySlug: "padel",
      citySlug: "cape-town",
    });
    await handleSanityRevalidate({
      ...metro,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.ok(recorded.paths.includes("/play/padel/cape-town"));
    assert.ok(recorded.paths.includes("/play/padel"));
    assert.ok(recorded.paths.includes("/play"));
    assert.ok(recorded.paths.includes("/sitemap/play-cities.xml"));
    assert.equal(recorded.paths.includes("/sitemap/watch-cities.xml"), false);

    recorded.paths.length = 0;
    const sport = await signed({
      _id: "sport-1",
      _type: "sport",
      slug: "golf",
    });
    await handleSanityRevalidate({
      ...sport,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
      loadRelated: async () => ({
        metroPages: [
          { intent: "play", activitySlug: "golf", citySlug: "johannesburg" },
          { intent: "watch", activitySlug: "golf", citySlug: "johannesburg" },
        ],
      }),
    });
    assert.ok(recorded.paths.includes("/play/golf"));
    assert.ok(recorded.paths.includes("/play/golf/johannesburg"));
    assert.equal(recorded.paths.includes("/watch/golf"), false);
    assert.ok(recorded.paths.includes("/sitemap/static.xml"));

    recorded.paths.length = 0;
    const series = await signed({
      _id: "series-1",
      _type: "series",
      slug: "f1",
      sportSlug: "motorsport",
    });
    await handleSanityRevalidate({
      ...series,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.ok(recorded.paths.includes("/watch/f1"));
    assert.ok(recorded.paths.includes("/watch/motorsport"));
    assert.ok(recorded.paths.includes("/watch"));

    recorded.paths.length = 0;
    const city = await signed({
      _id: "loc-1",
      _type: "location",
      slug: "johannesburg",
      locationType: "city",
    });
    await handleSanityRevalidate({
      ...city,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.ok(recorded.paths.includes("/watch/johannesburg"));

    recorded.paths.length = 0;
    const suburb = await signed({
      _id: "loc-2",
      _type: "location",
      slug: "sandton",
      locationType: "suburb",
      parentSlug: "johannesburg",
    });
    await handleSanityRevalidate({
      ...suburb,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: false,
    });
    assert.equal(recorded.paths.includes("/watch/sandton"), false);
  });

  it("ignores drafts", async () => {
    const recorded = recorder();
    const { rawBody, signature } = await signed({
      _id: "drafts.event-1",
      _type: "event",
      title: "Draft fixture",
    });
    const result = await handleSanityRevalidate({
      rawBody,
      signature,
      secret: SECRET,
      revalidate: recorded.revalidate,
      googleConfigured: true,
      submitSitemap: async () => {
        throw new Error("drafts must not submit");
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.ignored, "draft");
    assert.deepEqual(recorded.paths, []);
    assert.equal(result.body.sitemapSubmit, "skipped");
  });

  it("submits once for a burst and again after the interval", async () => {
    resetSitemapSubmitGate();
    let submits = 0;
    const { rawBody, signature } = await signed({
      _id: "guide-2",
      _type: "guide",
      slug: "best-padel-johannesburg",
    });
    const run = (now: number) =>
      handleSanityRevalidate({
        rawBody,
        signature,
        secret: SECRET,
        now,
        revalidate: () => undefined,
        googleConfigured: true,
        submitSitemap: async () => {
          submits += 1;
        },
        claimSubmit: claimSitemapSubmit,
      });

    const firstAt = 1_700_000_000_000;
    const first = await run(firstAt);
    const second = await run(firstAt + 1_000);
    const third = await run(firstAt + SITEMAP_SUBMIT_MIN_INTERVAL_MS);
    assert.equal(first.body.sitemapSubmit, "submitted");
    assert.equal(second.body.sitemapSubmit, "debounced");
    assert.equal(third.body.sitemapSubmit, "submitted");
    assert.equal(submits, 2);
    assert.ok(first.body.revalidated.includes("/guides/best-padel-johannesburg"));
    assert.ok(second.body.revalidated.includes("/guides/best-padel-johannesburg"));
  });

  it("returns 200 when Search Console submit throws", async () => {
    const { rawBody, signature } = await signed({
      _id: "guide-3",
      _type: "guide",
      slug: "best-padel-cape-town",
    });
    const result = await handleSanityRevalidate({
      rawBody,
      signature,
      secret: SECRET,
      revalidate: () => undefined,
      googleConfigured: true,
      claimSubmit: () => true,
      submitSitemap: async () => {
        throw new Error("gsc down");
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.sitemapSubmit, "error");
    assert.ok(result.body.revalidated.includes("/guides/best-padel-cape-town"));
  });
});
