import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  PRODUCTION_RAILWAY_API_ORIGIN,
  API_PROXY_EXPLICIT_SOURCES,
  getApiProxyRewrites,
  getLoopbackApiProxyOrigin,
  getRailwayApiOrigin,
  isApiConfigured,
  isFrontendOrigin,
  isLoopbackApiOrigin,
  shouldProxyApiPath,
} from "./api-origin.ts";
import { ROADMAP_PROXY_SOURCES } from "./roadmap/roadmap.ts";
import { TEAM_MATCH_PROXY_SOURCES } from "./team-matches/team-matches.ts";
import { TEAM_PROXY_SOURCES } from "./teams/teams.ts";
import { TOURNAMENT_PROXY_SOURCES } from "./tournaments/tournaments.ts";

const ORIGIN_ENV_KEYS = [
  "API_ORIGIN",
  "RAILWAY_API_URL",
  "NEXT_PUBLIC_API_URL",
  "VERCEL_ENV",
] as const;

const savedOriginEnv: Record<string, string | undefined> = {};
for (const key of ORIGIN_ENV_KEYS) {
  savedOriginEnv[key] = process.env[key];
}

function clearOriginEnv() {
  for (const key of ORIGIN_ENV_KEYS) {
    delete process.env[key];
  }
}

function withOriginEnv(
  vars: Partial<Record<(typeof ORIGIN_ENV_KEYS)[number], string>>,
  fn: () => void,
) {
  clearOriginEnv();
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    clearOriginEnv();
  }
}

afterEach(() => {
  for (const key of ORIGIN_ENV_KEYS) {
    const value = savedOriginEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("shouldProxyApiPath", () => {
  it("proxies the API root", () => {
    assert.equal(shouldProxyApiPath("/api"), true);
  });

  it("proxies Railway auth, health, and venue-by-id paths", () => {
    assert.equal(shouldProxyApiPath("/api/health"), true);
    assert.equal(shouldProxyApiPath("/api/auth/session"), true);
    assert.equal(shouldProxyApiPath("/api/auth/providers/google/signin"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-venue-1"), true);
  });

  it("proxies match identity to Railway and keeps Ably events local", () => {
    assert.equal(shouldProxyApiPath("/api/matches"), true);
    assert.equal(shouldProxyApiPath("/api/matches/capture"), true);
    assert.equal(shouldProxyApiPath("/api/matches/abc"), true);
    assert.equal(shouldProxyApiPath("/api/matches/abc/lock"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds/capture"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds/abc"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds/abc/lock"), true);
    assert.equal(shouldProxyApiPath("/api/darts"), true);
    assert.equal(shouldProxyApiPath("/api/darts/capture"), true);
    assert.equal(shouldProxyApiPath("/api/darts/abc"), true);
    assert.equal(shouldProxyApiPath("/api/darts/abc/turns"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-court/matches"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-court/golf-rounds"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-pub/darts"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-court/follow"), true);
    assert.equal(shouldProxyApiPath("/api/me/followed-venues"), true);
    assert.equal(shouldProxyApiPath("/api/me/friends"), true);
    assert.equal(shouldProxyApiPath("/api/me/communities"), true);
    assert.equal(shouldProxyApiPath("/api/me/training/plans"), true);
    assert.equal(shouldProxyApiPath("/api/me/training/enrollments"), true);
    assert.equal(shouldProxyApiPath("/api/me/training/enrollments/enr-1"), true);
    assert.equal(shouldProxyApiPath("/api/me/integrations"), true);
    assert.equal(shouldProxyApiPath("/api/me/integrations/generic-import"), true);
    assert.equal(
      shouldProxyApiPath("/api/me/integrations/generic-import/connect"),
      true,
    );
    assert.equal(
      shouldProxyApiPath("/api/me/integrations/generic-import/sync"),
      true,
    );
    assert.equal(shouldProxyApiPath("/api/communities"), true);
    assert.equal(shouldProxyApiPath("/api/communities/c1"), true);
    assert.equal(shouldProxyApiPath("/api/communities/c1/join"), true);
    assert.equal(shouldProxyApiPath("/api/teams"), true);
    assert.equal(shouldProxyApiPath("/api/teams/join"), true);
    assert.equal(shouldProxyApiPath("/api/teams/search"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/matches"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/tournaments"), true);
    assert.equal(shouldProxyApiPath("/api/team-matches"), true);
    assert.equal(shouldProxyApiPath("/api/tournaments"), true);
    assert.equal(shouldProxyApiPath("/api/tournaments/join"), true);
    assert.equal(shouldProxyApiPath("/api/tournaments/mine"), true);
    assert.equal(shouldProxyApiPath("/api/tournaments/c1"), true);
    assert.equal(shouldProxyApiPath("/api/tournaments/c1/open-registration"), true);
    assert.equal(shouldProxyApiPath("/api/tournaments/c1/fixtures/s1/start"), true);
    assert.equal(shouldProxyApiPath("/api/team-matches/join"), true);
    assert.equal(shouldProxyApiPath("/api/team-matches/mine"), true);
    assert.equal(shouldProxyApiPath("/api/team-matches/m1"), true);
    assert.equal(shouldProxyApiPath("/api/team-matches/m1/start"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/invite"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/invite-link"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/leave"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/transfer-ownership"), true);
    assert.equal(shouldProxyApiPath("/api/teams/t1/members/u2"), true);
    assert.equal(shouldProxyApiPath("/api/pools"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/join"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/picks"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/result"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/standings"), true);
    assert.equal(shouldProxyApiPath("/api/me/badges"), true);
    assert.equal(shouldProxyApiPath("/api/me/preferences"), true);
    assert.equal(shouldProxyApiPath("/api/users/search"), true);
    assert.equal(shouldProxyApiPath("/api/me/friends/user-1/accept"), true);
    assert.equal(shouldProxyApiPath("/api/me/friends/user-1"), true);
    assert.equal(shouldProxyApiPath("/api/organised-games"), true);
    assert.equal(shouldProxyApiPath("/api/organised-games/game-1"), true);
    assert.equal(shouldProxyApiPath("/api/organised-games/game-1/invites"), true);
    assert.equal(shouldProxyApiPath("/api/organised-games/game-1/rsvp"), true);
    assert.equal(shouldProxyApiPath("/api/organised-games/game-1/start"), true);
    assert.equal(shouldProxyApiPath("/api/organised-games/game-1/cancel"), true);
    assert.equal(
      shouldProxyApiPath("/api/organised-games/invite/abc123"),
      true,
    );
    assert.equal(
      shouldProxyApiPath("/api/organised-games/invite/abc123/join"),
      true,
    );
    assert.equal(shouldProxyApiPath("/api/me/organised-games"), true);
    assert.equal(shouldProxyApiPath("/api/me/notifications"), true);
    assert.equal(shouldProxyApiPath("/api/me/notifications/read-all"), true);
    assert.equal(
      shouldProxyApiPath("/api/me/notifications/n-1/read"),
      true,
    );
    assert.equal(shouldProxyApiPath("/api/roadmap/features"), true);
    assert.equal(shouldProxyApiPath("/api/roadmap/features/abc/vote"), true);
    assert.equal(shouldProxyApiPath("/api/roadmap/features/abc/notify"), true);
    assert.equal(shouldProxyApiPath("/api/roadmap/unsubscribe"), true);
    assert.equal(shouldProxyApiPath("/api/roadmap/preferences"), true);
    assert.equal(shouldProxyApiPath("/api/roadmap/requests"), true);
    assert.equal(shouldProxyApiPath("/api/matches/abc/events"), false);
    assert.equal(shouldProxyApiPath("/api/realtime"), false);
    assert.equal(shouldProxyApiPath("/api/realtime/token"), false);
    assert.equal(shouldProxyApiPath("/api/venues/claim"), false);
    assert.equal(shouldProxyApiPath("/api/venues/claim/extra"), false);
    assert.equal(shouldProxyApiPath("/api/venues/the-local/screenings"), false);
    assert.equal(
      shouldProxyApiPath("/api/venues/the-local/screenings/"),
      false,
    );
  });

  it("does not treat non-api paths as proxy targets", () => {
    assert.equal(shouldProxyApiPath("/"), false);
    assert.equal(shouldProxyApiPath("/venues"), false);
    assert.equal(shouldProxyApiPath("/api-docs"), false);
  });

  it("does not treat a venues-claim prefix as the local claim route", () => {
    assert.equal(shouldProxyApiPath("/api/venues/claimant"), true);
  });
});

describe("isLoopbackApiOrigin", () => {
  it("accepts localhost and loopback hosts", () => {
    assert.equal(isLoopbackApiOrigin("http://localhost:3100"), true);
    assert.equal(isLoopbackApiOrigin("http://127.0.0.1:3100"), true);
    assert.equal(isLoopbackApiOrigin("http://[::1]:3100"), true);
  });

  it("rejects Railway and other remote API origins", () => {
    assert.equal(isLoopbackApiOrigin(PRODUCTION_RAILWAY_API_ORIGIN), false);
    assert.equal(isLoopbackApiOrigin("https://api.example.test"), false);
    assert.equal(isLoopbackApiOrigin("not a url"), false);
  });
});

describe("getLoopbackApiProxyOrigin", () => {
  it("returns a local NEXT_PUBLIC_API_URL", () => {
    withOriginEnv({ NEXT_PUBLIC_API_URL: "http://localhost:3100/" }, () => {
      assert.equal(getLoopbackApiProxyOrigin(), "http://localhost:3100");
    });
  });

  it("prefers API_ORIGIN when that target is local", () => {
    withOriginEnv(
      {
        API_ORIGIN: "http://127.0.0.1:3100",
        NEXT_PUBLIC_API_URL: "http://localhost:9999",
      },
      () => {
        assert.equal(getLoopbackApiProxyOrigin(), "http://127.0.0.1:3100");
      },
    );
  });

  it("is empty for Railway so production messages stay generic", () => {
    withOriginEnv(
      { NEXT_PUBLIC_API_URL: PRODUCTION_RAILWAY_API_ORIGIN },
      () => {
        assert.equal(getLoopbackApiProxyOrigin(), "");
      },
    );
  });
});

describe("isFrontendOrigin", () => {
  it("rejects the production site hosts so the rewrite cannot loop", () => {
    assert.equal(isFrontendOrigin("https://leaguesports.co.za"), true);
    assert.equal(isFrontendOrigin("https://www.leaguesports.co.za"), true);
    assert.equal(isFrontendOrigin("https://leaguesports.co.za/"), true);
    assert.equal(isFrontendOrigin("http://leaguesports.co.za"), true);
  });

  it("rejects Vercel Preview hosts", () => {
    assert.equal(isFrontendOrigin("https://landing-page.vercel.app"), true);
    assert.equal(
      isFrontendOrigin(
        "https://landing-page-git-cursor-harde-d037f8-brandonchadlanges-projects.vercel.app",
      ),
      true,
    );
  });

  it("allows Railway and other API origins", () => {
    assert.equal(isFrontendOrigin(PRODUCTION_RAILWAY_API_ORIGIN), false);
    assert.equal(
      isFrontendOrigin("https://league-sports-api-production.up.railway.app"),
      false,
    );
    assert.equal(isFrontendOrigin("http://localhost:3001"), false);
    assert.equal(isFrontendOrigin("https://api.example.test"), false);
  });

  it("does not treat invalid or empty values as frontend origins", () => {
    assert.equal(isFrontendOrigin(""), false);
    assert.equal(isFrontendOrigin("not a url"), false);
    assert.equal(isFrontendOrigin("https://notvercel.app"), false);
    assert.equal(isFrontendOrigin("https://leaguesports.co.za.evil.com"), false);
  });
});

describe("getRailwayApiOrigin", () => {
  it("falls back to production Railway only when VERCEL_ENV is production", () => {
    withOriginEnv({ VERCEL_ENV: "production" }, () => {
      assert.equal(getRailwayApiOrigin(), PRODUCTION_RAILWAY_API_ORIGIN);
      assert.equal(isApiConfigured(), true);
    });
  });

  it("is not configured on Preview with no env", () => {
    withOriginEnv({ VERCEL_ENV: "preview" }, () => {
      assert.equal(getRailwayApiOrigin(), "");
      assert.equal(isApiConfigured(), false);
      assert.deepEqual(getApiProxyRewrites(), []);
    });
  });

  it("is not configured for local next dev with no env", () => {
    withOriginEnv({}, () => {
      assert.equal(getRailwayApiOrigin(), "");
      assert.equal(isApiConfigured(), false);
      assert.deepEqual(getApiProxyRewrites(), []);
    });
  });

  it("uses an explicit Railway origin even on Preview", () => {
    withOriginEnv(
      {
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_API_URL: "https://api.example.test/",
      },
      () => {
        assert.equal(getRailwayApiOrigin(), "https://api.example.test");
        assert.equal(isApiConfigured(), true);
      },
    );
  });

  it("prefers API_ORIGIN over NEXT_PUBLIC_API_URL", () => {
    withOriginEnv(
      {
        API_ORIGIN: "https://from-api-origin.test",
        NEXT_PUBLIC_API_URL: "https://from-public.test",
      },
      () => {
        assert.equal(getRailwayApiOrigin(), "https://from-api-origin.test");
      },
    );
  });

  it("skips frontend origins and stays unconfigured on Preview", () => {
    withOriginEnv(
      {
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_API_URL: "https://leaguesports.co.za",
      },
      () => {
        assert.equal(getRailwayApiOrigin(), "");
        assert.equal(isApiConfigured(), false);
        assert.deepEqual(getApiProxyRewrites(), []);
      },
    );
  });

  it("skips frontend origins and uses the production fallback on production", () => {
    withOriginEnv(
      {
        VERCEL_ENV: "production",
        NEXT_PUBLIC_API_URL: "https://leaguesports.co.za",
      },
      () => {
        assert.equal(getRailwayApiOrigin(), PRODUCTION_RAILWAY_API_ORIGIN);
      },
    );
  });

  it("skips a frontend env value and uses the next Railway candidate", () => {
    withOriginEnv(
      {
        API_ORIGIN: "https://www.leaguesports.co.za",
        RAILWAY_API_URL: PRODUCTION_RAILWAY_API_ORIGIN,
      },
      () => {
        assert.equal(getRailwayApiOrigin(), PRODUCTION_RAILWAY_API_ORIGIN);
      },
    );
  });
});

describe("getApiProxyRewrites", () => {
  it("emits explicit match and venue sources before the catch-all", () => {
    withOriginEnv(
      { NEXT_PUBLIC_API_URL: "https://api.example.test" },
      () => {
        const rewrites = getApiProxyRewrites();
        const sources = rewrites.map((rule) => rule.source);
        for (const source of API_PROXY_EXPLICIT_SOURCES) {
          assert.equal(sources.includes(source), true, source);
        }
        assert.equal(sources.includes("/api"), true);
        assert.equal(
          sources.some((source) => source.includes("matches/:id/events")),
          false,
        );
        assert.deepEqual(rewrites.slice(-2), [
          { source: "/api", destination: "https://api.example.test/api" },
          {
            source:
              "/api/:path((?!matches/.+/events(?:/|$)|realtime(?:/|$)|venues/claim(?:/|$)|venues/[^/]+/screenings(?:/|$)|fixtures/.+/(?:feed|live)(?:/|$)).*)",
            destination: "https://api.example.test/api/:path",
          },
        ]);
        assert.equal(
          rewrites.every((rule) => !isFrontendOrigin(rule.destination)),
          true,
        );
      },
    );
  });

  it("rewrites /api to Railway and excludes local Next routes", () => {
    withOriginEnv(
      { NEXT_PUBLIC_API_URL: "https://api.example.test" },
      () => {
        const rewrites = getApiProxyRewrites();
        const catchAll = rewrites.find((rule) => rule.source.includes(":path"));
        assert.ok(catchAll);
        assert.equal(
          catchAll.source,
          "/api/:path((?!matches/.+/events(?:/|$)|realtime(?:/|$)|venues/claim(?:/|$)|venues/[^/]+/screenings(?:/|$)|fixtures/.+/(?:feed|live)(?:/|$)).*)",
        );
        assert.equal(catchAll.destination, "https://api.example.test/api/:path");
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/matches")?.destination,
          "https://api.example.test/api/matches",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/matches/capture")
            ?.destination,
          "https://api.example.test/api/matches/capture",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/golf-rounds/capture")
            ?.destination,
          "https://api.example.test/api/golf-rounds/capture",
        );
        const rewriteSources = rewrites.map((rule) => rule.source);
        assert.ok(
          rewriteSources.indexOf("/api/matches/capture") <
            rewriteSources.indexOf("/api/matches/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/golf-rounds/capture") <
            rewriteSources.indexOf("/api/golf-rounds/:id"),
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/darts/capture")
            ?.destination,
          "https://api.example.test/api/darts/capture",
        );
        assert.ok(
          rewriteSources.indexOf("/api/darts/capture") <
            rewriteSources.indexOf("/api/darts/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/darts/:id/turns") <
            rewriteSources.indexOf("/api/darts/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/organised-games/invite/:token") <
            rewriteSources.indexOf("/api/organised-games/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/teams/join") <
            rewriteSources.indexOf("/api/teams/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/teams/search") <
            rewriteSources.indexOf("/api/teams/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/team-matches/join") <
            rewriteSources.indexOf("/api/team-matches/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/team-matches/mine") <
            rewriteSources.indexOf("/api/team-matches/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/tournaments/join") <
            rewriteSources.indexOf("/api/tournaments/:id"),
        );
        assert.ok(
          rewriteSources.indexOf("/api/tournaments/mine") <
            rewriteSources.indexOf("/api/tournaments/:id"),
        );
        const teamSources = API_PROXY_EXPLICIT_SOURCES.filter(
          (source) =>
            source === "/api/teams" || source.startsWith("/api/teams/"),
        );
        assert.deepEqual(teamSources, [...TEAM_PROXY_SOURCES]);
        const teamMatchSources = API_PROXY_EXPLICIT_SOURCES.filter(
          (source) =>
            source === "/api/team-matches" ||
            source.startsWith("/api/team-matches/"),
        );
        assert.deepEqual(teamMatchSources, [...TEAM_MATCH_PROXY_SOURCES]);
        const tournamentSources = API_PROXY_EXPLICIT_SOURCES.filter(
          (source) =>
            source === "/api/tournaments" ||
            source.startsWith("/api/tournaments/"),
        );
        assert.deepEqual(tournamentSources, [...TOURNAMENT_PROXY_SOURCES]);
        assert.ok(
          API_PROXY_EXPLICIT_SOURCES.includes("/api/teams/:id/tournaments"),
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/teams")?.destination,
          "https://api.example.test/api/teams",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/teams/join")
            ?.destination,
          "https://api.example.test/api/teams/join",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/organised-games")
            ?.destination,
          "https://api.example.test/api/organised-games",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/me/organised-games")
            ?.destination,
          "https://api.example.test/api/me/organised-games",
        );
        assert.ok(
          rewriteSources.indexOf("/api/me/notifications/read-all") <
            rewriteSources.indexOf("/api/me/notifications/:id/read"),
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/me/notifications")
            ?.destination,
          "https://api.example.test/api/me/notifications",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/me/notifications/read-all")
            ?.destination,
          "https://api.example.test/api/me/notifications/read-all",
        );
        assert.equal(
          rewrites.find(
            (rule) => rule.source === "/api/me/notifications/:id/read",
          )?.destination,
          "https://api.example.test/api/me/notifications/:id/read",
        );
        const roadmapSources = API_PROXY_EXPLICIT_SOURCES.filter(
          (source) =>
            source === "/api/roadmap" || source.startsWith("/api/roadmap/"),
        );
        assert.deepEqual(roadmapSources, [...ROADMAP_PROXY_SOURCES]);
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/roadmap/features")
            ?.destination,
          "https://api.example.test/api/roadmap/features",
        );
        assert.equal(
          rewrites.find(
            (rule) => rule.source === "/api/roadmap/features/:id/vote",
          )?.destination,
          "https://api.example.test/api/roadmap/features/:id/vote",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/roadmap/requests")
            ?.destination,
          "https://api.example.test/api/roadmap/requests",
        );
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/venues/:cmsId")
            ?.destination,
          "https://api.example.test/api/venues/:cmsId",
        );
      },
    );
  });

  it("does not emit a production Railway rewrite on Preview without env", () => {
    withOriginEnv({ VERCEL_ENV: "preview" }, () => {
      const destinations = getApiProxyRewrites().map((rule) => rule.destination);
      assert.equal(destinations.length, 0);
      assert.equal(
        destinations.some((dest) => dest.includes("up.railway.app")),
        false,
      );
    });
  });

  it("emits the production Railway rewrite on Vercel production without env", () => {
    withOriginEnv({ VERCEL_ENV: "production" }, () => {
      const rewrites = getApiProxyRewrites();
      // Explicit sources + `/api` + catch-all
      assert.equal(rewrites.length, API_PROXY_EXPLICIT_SOURCES.length + 2);
      assert.equal(
        rewrites.some(
          (rule) => rule.destination === `${PRODUCTION_RAILWAY_API_ORIGIN}/api`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/matches`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/venues/:cmsId/follow`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/followed-venues`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/friends`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/preferences`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/users/search`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/friends/:userId/accept`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/notifications`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/notifications/read-all`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/notifications/:id/read`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/roadmap/features`,
        ),
        true,
      );
      assert.equal(
        rewrites.some(
          (rule) =>
            rule.destination ===
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/roadmap/requests`,
        ),
        true,
      );
    });
  });
});
