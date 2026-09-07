import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isAuthorizedFixtureIngest } from "./auth.ts";

const KEYS = ["CRON_SECRET", "FIXTURE_OPS_KEY", "VERCEL_ENV"] as const;
const saved: Record<string, string | undefined> = {};
for (const key of KEYS) saved[key] = process.env[key];

function withEnv(
  vars: Partial<Record<(typeof KEYS)[number], string | undefined>>,
  fn: () => void,
) {
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(vars)) {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    fn();
  } finally {
    for (const key of KEYS) delete process.env[key];
  }
}

afterEach(() => {
  for (const key of KEYS) {
    const value = saved[key];
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("isAuthorizedFixtureIngest", () => {
  it("allows local requests when no secrets are set", () => {
    withEnv({}, () => {
      const req = new Request("http://localhost/api/cron/fixture-live");
      assert.equal(isAuthorizedFixtureIngest(req), true);
    });
  });

  it("accepts the Vercel cron bearer token", () => {
    withEnv({ CRON_SECRET: "cron-secret", VERCEL_ENV: "production" }, () => {
      const ok = new Request("http://localhost/api/cron/fixture-live", {
        headers: { authorization: "Bearer cron-secret" },
      });
      const bad = new Request("http://localhost/api/cron/fixture-live", {
        headers: { authorization: "Bearer nope" },
      });
      assert.equal(isAuthorizedFixtureIngest(ok), true);
      assert.equal(isAuthorizedFixtureIngest(bad), false);
    });
  });

  it("accepts the ops key for a manual trigger", () => {
    withEnv({ FIXTURE_OPS_KEY: "ops-secret", VERCEL_ENV: "production" }, () => {
      const req = new Request("http://localhost/api/cron/fixture-live", {
        headers: { "x-ops-key": "ops-secret" },
      });
      assert.equal(isAuthorizedFixtureIngest(req), true);
    });
  });
});
