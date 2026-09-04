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
    assert.equal(shouldProxyApiPath("/api/matches/abc"), true);
    assert.equal(shouldProxyApiPath("/api/matches/abc/lock"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds/abc"), true);
    assert.equal(shouldProxyApiPath("/api/golf-rounds/abc/lock"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-court/matches"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-court/golf-rounds"), true);
    assert.equal(shouldProxyApiPath("/api/venues/sanity-court/follow"), true);
    assert.equal(shouldProxyApiPath("/api/me/followed-venues"), true);
    assert.equal(shouldProxyApiPath("/api/me/friends"), true);
    assert.equal(shouldProxyApiPath("/api/me/friends/user-1/accept"), true);
    assert.equal(shouldProxyApiPath("/api/me/friends/user-1"), true);
    assert.equal(shouldProxyApiPath("/api/matches/abc/events"), false);
    assert.equal(shouldProxyApiPath("/api/realtime"), false);
    assert.equal(shouldProxyApiPath("/api/realtime/token"), false);
    assert.equal(shouldProxyApiPath("/api/venues/claim"), false);
    assert.equal(shouldProxyApiPath("/api/venues/claim/extra"), false);
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
              "/api/:path((?!matches/.+/events(?:/|$)|realtime(?:/|$)|venues/claim(?:/|$)).*)",
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
          "/api/:path((?!matches/.+/events(?:/|$)|realtime(?:/|$)|venues/claim(?:/|$)).*)",
        );
        assert.equal(catchAll.destination, "https://api.example.test/api/:path");
        assert.equal(
          rewrites.find((rule) => rule.source === "/api/matches")?.destination,
          "https://api.example.test/api/matches",
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
            `${PRODUCTION_RAILWAY_API_ORIGIN}/api/me/friends/:userId/accept`,
        ),
        true,
      );
    });
  });
});
