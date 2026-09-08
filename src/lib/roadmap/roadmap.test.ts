import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ROADMAP_FEATURES_EMPTY_COPY,
  ROADMAP_FEATURES_PATH,
  ROADMAP_FEATURE_FILTER_OPTIONS,
  ROADMAP_FEATURE_STATUS_LABELS,
  ROADMAP_HREF,
  ROADMAP_PREFERENCES_HREF,
  ROADMAP_PROXY_SOURCES,
  ROADMAP_REQUESTS_PATH,
  applyVoteResult,
  buildCreateRequestPayload,
  buildFeaturesSearchParams,
  featureNotifyUrl,
  featureStatusLabel,
  featureVoteUrl,
  featuresListUrl,
  isShippedFeature,
  normalizeNotifyEmail,
  parseFeatureFilter,
  parseFeatureSort,
  parseNotifyResult,
  parsePublicRoadmapRequest,
  parseRoadmapFeature,
  parseRoadmapFeatureList,
  parseRoadmapPreferences,
  parseRoadmapRequestList,
  parseUnsubscribeResult,
  parseVoteResult,
  parseWatchingFeature,
  partitionFeaturesForBoard,
  preferencesHref,
  preferencesUrl,
  requestStatusLabel,
  requestTypeLabel,
  requestsUrl,
  shouldCollapseDescription,
  unsubscribeUrl,
  listRoadmapFeaturesWith,
  toggleRoadmapVoteWith,
  notifyRoadmapFeatureWith,
  createRoadmapRequestWith,
} from "./roadmap.ts";

const FEATURE = {
  id: "feat-1",
  slug: "live-scorecards",
  title: "Live scorecards",
  description: "Keep score together on one card.",
  status: "PLANNED",
  shippedAt: null,
  voteCount: 4,
  createdAt: "2026-09-08T06:00:00.000Z",
  updatedAt: "2026-09-08T06:00:00.000Z",
  viewerHasVoted: false,
};

const SHIPPED = {
  ...FEATURE,
  id: "feat-2",
  slug: "club-nights",
  title: "Club nights",
  status: "SHIPPED",
  shippedAt: "2026-09-01T12:00:00.000Z",
  voteCount: 12,
};

const REQUEST = {
  id: "req-1",
  type: "BUG",
  title: "Scorecard lock hangs",
  status: "NEW",
  createdAt: "2026-09-08T07:00:00.000Z",
};

describe("roadmap status labels", () => {
  it("maps feature and request statuses to public copy", () => {
    assert.equal(featureStatusLabel("PLANNED"), "Planned");
    assert.equal(featureStatusLabel("IN_PROGRESS"), "In progress");
    assert.equal(featureStatusLabel("SHIPPED"), "Shipped");
    assert.deepEqual(ROADMAP_FEATURE_STATUS_LABELS, {
      PLANNED: "Planned",
      IN_PROGRESS: "In progress",
      SHIPPED: "Shipped",
    });
    assert.deepEqual(
      ROADMAP_FEATURE_FILTER_OPTIONS.map((option) => option.label),
      ["All", "Planned", "In progress", "Shipped"],
    );
    assert.equal(requestTypeLabel("FEATURE_REQUEST"), "Feature request");
    assert.equal(requestTypeLabel("BUG"), "Bug");
    assert.equal(requestStatusLabel("NEW"), "New");
    assert.equal(requestStatusLabel("PLANNED"), "Planned");
    assert.equal(requestStatusLabel("DONE"), "Done");
    assert.equal(
      ROADMAP_FEATURES_EMPTY_COPY,
      "Nothing on the board yet — check Requests…",
    );
  });
});

describe("roadmap filters and sort query builders", () => {
  it("omits All and default votes sort from the query string", () => {
    assert.equal(parseFeatureFilter(undefined), "ALL");
    assert.equal(parseFeatureFilter("nope"), "ALL");
    assert.equal(parseFeatureFilter("IN_PROGRESS"), "IN_PROGRESS");
    assert.equal(parseFeatureSort(undefined), "votes");
    assert.equal(parseFeatureSort("newest"), "newest");
    assert.equal(parseFeatureSort("votes"), "votes");

    assert.equal(buildFeaturesSearchParams({}).toString(), "");
    assert.equal(
      buildFeaturesSearchParams({ status: "ALL", sort: "votes" }).toString(),
      "",
    );
    assert.equal(
      buildFeaturesSearchParams({ status: "PLANNED" }).toString(),
      "status=PLANNED",
    );
    assert.equal(
      buildFeaturesSearchParams({
        status: "IN_PROGRESS",
        sort: "newest",
      }).toString(),
      "status=IN_PROGRESS&sort=newest",
    );
    assert.equal(
      featuresListUrl("https://api.example.test", { sort: "votes" }),
      "https://api.example.test/api/roadmap/features",
    );
    assert.equal(
      featuresListUrl("https://api.example.test/", {
        status: "SHIPPED",
        sort: "newest",
      }),
      "https://api.example.test/api/roadmap/features?status=SHIPPED&sort=newest",
    );
  });
});

describe("roadmap parsers omit GitHub fields", () => {
  it("never copies githubIssueUrl onto a feature or watching row", () => {
    const parsed = parseRoadmapFeature({
      ...FEATURE,
      githubIssueUrl:
        "https://github.com/leaguesports/league-sports-api/issues/999",
      github: "https://github.com/leaguesports/landing-page/issues/185",
    });
    assert.deepEqual(parsed, FEATURE);
    assert.equal(parsed && "githubIssueUrl" in parsed, false);
    assert.equal(JSON.stringify(parsed).includes("githubIssueUrl"), false);
    assert.equal(JSON.stringify(parsed).includes("github.com"), false);

    const listed = parseRoadmapFeatureList({
      features: [
        {
          ...FEATURE,
          githubIssueUrl: "https://github.com/leaguesports/x/issues/1",
        },
      ],
    });
    assert.equal(listed.length, 1);
    assert.equal("githubIssueUrl" in listed[0], false);

    const watching = parseWatchingFeature({
      id: FEATURE.id,
      slug: FEATURE.slug,
      title: FEATURE.title,
      status: FEATURE.status,
      githubIssueUrl: "https://github.com/leaguesports/x/issues/1",
    });
    assert.deepEqual(watching, {
      id: FEATURE.id,
      slug: FEATURE.slug,
      title: FEATURE.title,
      status: FEATURE.status,
    });
    assert.equal(watching && "githubIssueUrl" in watching, false);

    const prefs = parseRoadmapPreferences({
      email: "fan@example.com",
      features: [
        {
          id: FEATURE.id,
          slug: FEATURE.slug,
          title: FEATURE.title,
          status: FEATURE.status,
          githubIssueUrl: "https://github.com/example/issue",
        },
      ],
    });
    assert.equal(prefs?.features[0] && "githubIssueUrl" in prefs.features[0], false);
  });

  it("strips request email and details from public rows", () => {
    const parsed = parsePublicRoadmapRequest({
      ...REQUEST,
      email: "secret@example.com",
      details: "internal repro",
    });
    assert.deepEqual(parsed, REQUEST);
    assert.equal(parsed && "email" in parsed, false);
    assert.equal(parsed && "details" in parsed, false);
    assert.equal(JSON.stringify(parsed).includes("secret@example.com"), false);

    const listed = parseRoadmapRequestList({
      requests: [{ ...REQUEST, email: "hidden@example.com" }],
    });
    assert.equal(listed[0]?.title, REQUEST.title);
    assert.equal("email" in listed[0], false);
  });
});

describe("roadmap proxy paths", () => {
  it("lists public Railway sources and encodes feature ids", () => {
    assert.equal(ROADMAP_HREF, "/roadmap");
    assert.equal(ROADMAP_PREFERENCES_HREF, "/roadmap/preferences");
    assert.equal(ROADMAP_FEATURES_PATH, "/api/roadmap/features");
    assert.equal(ROADMAP_REQUESTS_PATH, "/api/roadmap/requests");
    assert.deepEqual([...ROADMAP_PROXY_SOURCES], [
      "/api/roadmap/features",
      "/api/roadmap/features/:id/vote",
      "/api/roadmap/features/:id/notify",
      "/api/roadmap/unsubscribe",
      "/api/roadmap/preferences",
      "/api/roadmap/requests",
    ]);
    assert.equal(
      ROADMAP_PROXY_SOURCES.some((source) => source.includes("ship")),
      false,
    );
    assert.equal(
      ROADMAP_PROXY_SOURCES.some((source) => source.includes("admin")),
      false,
    );

    const origin = "https://api.example.test";
    assert.equal(
      featureVoteUrl(origin, "live-scorecards"),
      "https://api.example.test/api/roadmap/features/live-scorecards/vote",
    );
    assert.equal(
      featureNotifyUrl(origin, "feat 1"),
      "https://api.example.test/api/roadmap/features/feat%201/notify",
    );
    assert.equal(
      requestsUrl(origin),
      "https://api.example.test/api/roadmap/requests",
    );
    assert.equal(
      unsubscribeUrl(origin),
      "https://api.example.test/api/roadmap/unsubscribe",
    );
    assert.equal(
      preferencesUrl(origin, "tok en"),
      "https://api.example.test/api/roadmap/preferences?token=tok+en",
    );
    assert.equal(
      preferencesHref("abc"),
      "/roadmap/preferences?token=abc",
    );
  });
});

describe("roadmap board helpers", () => {
  it("parks shipped cards at the bottom for All", () => {
    const mixed = [SHIPPED, FEATURE];
    assert.deepEqual(partitionFeaturesForBoard(mixed, "ALL"), {
      primary: [FEATURE],
      shipped: [SHIPPED],
    });
    assert.deepEqual(partitionFeaturesForBoard([SHIPPED], "SHIPPED"), {
      primary: [SHIPPED],
      shipped: [],
    });
    assert.equal(isShippedFeature(SHIPPED), true);
    assert.equal(isShippedFeature(FEATURE), false);
  });

  it("applies vote toggles and validates notify email", () => {
    const voted = applyVoteResult(FEATURE, { voted: true, voteCount: 5 });
    assert.equal(voted.viewerHasVoted, true);
    assert.equal(voted.voteCount, 5);
    assert.deepEqual(parseVoteResult({ voted: false, voteCount: 0 }), {
      voted: false,
      voteCount: 0,
    });
    assert.deepEqual(parseNotifyResult({ watching: true }), { watching: true });
    assert.equal(parseNotifyResult({ watching: false }), null);
    assert.equal(normalizeNotifyEmail("  Foo@Bar.com "), "foo@bar.com");
    assert.equal(normalizeNotifyEmail("not-an-email"), null);
    assert.equal(shouldCollapseDescription("short"), false);
    assert.equal(shouldCollapseDescription("x".repeat(181)), true);
    assert.deepEqual(
      parseUnsubscribeResult({
        email: "fan@example.com",
        unsubscribed: true,
        count: 2,
      }),
      { email: "fan@example.com", unsubscribed: true, count: 2 },
    );
  });

  it("builds a public request payload without inventing email", () => {
    assert.deepEqual(
      buildCreateRequestPayload({
        type: "FEATURE_REQUEST",
        title: "  Night leagues  ",
        details: "Weekly club nights.",
      }),
      {
        ok: true,
        payload: {
          type: "FEATURE_REQUEST",
          title: "Night leagues",
          details: "Weekly club nights.",
        },
      },
    );
    assert.equal(
      buildCreateRequestPayload({
        type: "BUG",
        title: "Hang",
        details: "Lock never returns.",
        email: "not-valid",
      }).ok,
      false,
    );
    assert.equal(
      buildCreateRequestPayload({
        type: "idea",
        title: "Hang",
        details: "Lock never returns.",
      }).ok,
      false,
    );
  });
});

describe("roadmap fetch helpers", () => {
  it("GETs features with credentials and no client voter id", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const result = await listRoadmapFeaturesWith(
      { status: "PLANNED", sort: "newest" },
      {
        fetch: (async (url, init) => {
          calls.push({ url: String(url), init: init ?? {} });
          return new Response(JSON.stringify({ features: [FEATURE] }), {
            status: 200,
          });
        }) as typeof fetch,
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(result.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/roadmap/features?status=PLANNED&sort=newest",
    );
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(calls[0].init.body, undefined);
    assert.equal(
      JSON.stringify(calls[0].init.headers ?? {}).includes("voter"),
      false,
    );
  });

  it("POSTs vote with credentials and an empty body", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const result = await toggleRoadmapVoteWith("live-scorecards", {
      fetch: (async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return new Response(JSON.stringify({ voted: true, voteCount: 1 }), {
          status: 200,
        });
      }) as typeof fetch,
      baseUrl: "https://api.example.test",
    });
    assert.deepEqual(result, { ok: true, value: { voted: true, voteCount: 1 } });
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/roadmap/features/live-scorecards/vote",
    );
    assert.equal(calls[0].init.method, "POST");
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(calls[0].init.body, undefined);
    assert.equal(JSON.stringify(calls[0]).includes("roadmap_voter_id"), false);
  });

  it("POSTs notify email and create request without GitHub fields", async () => {
    const notify = await notifyRoadmapFeatureWith(
      FEATURE.id,
      " Fan@Example.com ",
      {
        fetch: (async (_url, init) => {
          const body = JSON.parse(String(init?.body ?? "{}")) as Record<
            string,
            unknown
          >;
          assert.deepEqual(body, { email: "fan@example.com" });
          assert.equal("githubIssueUrl" in body, false);
          return new Response(JSON.stringify({ watching: true }), {
            status: 200,
          });
        }) as typeof fetch,
        baseUrl: "https://api.example.test",
      },
    );
    assert.deepEqual(notify, { ok: true, value: { watching: true } });

    const created = await createRoadmapRequestWith(
      {
        type: "BUG",
        title: "Hang",
        details: "Lock never returns.",
        email: "fan@example.com",
      },
      {
        fetch: (async (url, init) => {
          assert.equal(String(url), "https://api.example.test/api/roadmap/requests");
          const body = JSON.parse(String(init?.body ?? "{}")) as Record<
            string,
            unknown
          >;
          assert.equal("githubIssueUrl" in body, false);
          assert.equal(body.type, "BUG");
          return new Response(
            JSON.stringify({
              request: REQUEST,
            }),
            { status: 201 },
          );
        }) as typeof fetch,
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(created.ok, true);
    if (created.ok) {
      assert.equal("email" in created.value, false);
      assert.equal("details" in created.value, false);
    }
  });
});
