import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSyncPayload,
  connectIntegrationWith,
  disconnectIntegrationWith,
  emptyIntegrationsSnapshot,
  formatImportedSessionCount,
  formatLastSyncedAt,
  formatProviderStatus,
  formatSessionSport,
  GENERIC_IMPORT_PROVIDER_ID,
  isConnectableProvider,
  isIntegrationsSoftFailure,
  listIntegrationsWith,
  parseImportedSession,
  parseIntegrationProvider,
  parseIntegrationsSnapshot,
  syncIntegrationWith,
  upsertProvider,
  type IntegrationProvider,
} from "./integrations.ts";

const GENERIC: IntegrationProvider = {
  id: GENERIC_IMPORT_PROVIDER_ID,
  name: "Import session",
  description: "Paste a structured session.",
  available: true,
  comingSoon: false,
  status: "disconnected",
  lastSyncedAt: null,
  importedSessionCount: 0,
  connectedAt: null,
  disconnectedAt: null,
  credentialMasked: null,
  lastImportedSession: null,
};

const CONNECTED: IntegrationProvider = {
  ...GENERIC,
  status: "connected",
  connectedAt: "2026-09-06T09:00:00.000Z",
  lastSyncedAt: "2026-09-06T10:00:00.000Z",
  importedSessionCount: 2,
  lastImportedSession: {
    id: "ses-1",
    sport: "padel",
    playedAt: "2026-09-06T09:30:00.000Z",
    title: "Club night",
  },
};

const TRACKMAN = {
  id: "trackman",
  name: "Trackman",
  description: "Range sessions.",
  available: false,
  comingSoon: true,
  status: "disconnected",
  lastSyncedAt: null,
  importedSessionCount: 0,
  connectedAt: null,
  disconnectedAt: null,
  credentialMasked: null,
  lastImportedSession: null,
};

const AUTODARTS = {
  ...TRACKMAN,
  id: "autodarts",
  name: "Autodarts",
  description: "Dartboard sessions.",
};

describe("integrations parsers", () => {
  it("parses a connectable provider and never invents connected status", () => {
    const parsed = parseIntegrationProvider(GENERIC);
    assert.deepEqual(parsed, GENERIC);
    assert.equal(
      parseIntegrationProvider({ ...GENERIC, status: "active" }),
      null,
    );
    assert.equal(
      parseIntegrationProvider({ ...GENERIC, importedSessionCount: undefined }),
      null,
    );
  });

  it("parses lastImportedSession and rejects unknown sports", () => {
    const session = parseImportedSession(CONNECTED.lastImportedSession);
    assert.deepEqual(session, CONNECTED.lastImportedSession);
    assert.equal(
      parseImportedSession({
        id: "x",
        sport: "soccer",
        playedAt: "2026-09-06T09:30:00.000Z",
      }),
      null,
    );
  });

  it("filters the catalog to connectable providers only", () => {
    const snapshot = parseIntegrationsSnapshot({
      providers: [GENERIC, TRACKMAN, AUTODARTS, { id: "bad" }],
    });
    assert.equal(snapshot.providers.length, 1);
    assert.equal(snapshot.providers[0]?.id, GENERIC_IMPORT_PROVIDER_ID);
    assert.deepEqual(parseIntegrationsSnapshot(null), emptyIntegrationsSnapshot());
  });

  it("hides Trackman and Autodarts even if flags claim they are live", () => {
    assert.equal(isConnectableProvider(GENERIC), true);
    assert.equal(isConnectableProvider(TRACKMAN), false);
    assert.equal(isConnectableProvider(AUTODARTS), false);
    assert.equal(
      isConnectableProvider({
        id: "trackman",
        available: true,
        comingSoon: false,
      }),
      false,
    );
    assert.equal(
      isConnectableProvider({
        id: "autodarts",
        available: true,
        comingSoon: false,
      }),
      false,
    );
    assert.equal(
      isConnectableProvider({
        id: "future-radar",
        available: false,
        comingSoon: true,
      }),
      false,
    );
  });

  it("formats real status copy and never says Active", () => {
    assert.equal(formatProviderStatus("connected"), "Connected");
    assert.equal(formatProviderStatus("disconnected"), "Not connected");
    assert.equal(formatProviderStatus("disconnected").includes("Active"), false);
    assert.equal(formatImportedSessionCount(1), "1 session imported");
    assert.equal(formatImportedSessionCount(2), "2 sessions imported");
    assert.equal(formatSessionSport("padel"), "Padel");
    assert.equal(formatSessionSport("other"), "Other");
  });

  it("formats lastSyncedAt relatively without inventing a sync", () => {
    const now = new Date("2026-09-06T10:05:00.000Z");
    assert.equal(formatLastSyncedAt(null, now), null);
    assert.equal(formatLastSyncedAt("not-a-date", now), null);
    assert.equal(
      formatLastSyncedAt("2026-09-06T10:04:30.000Z", now),
      "just now",
    );
    assert.equal(formatLastSyncedAt("2026-09-06T09:50:00.000Z", now), "15m ago");
  });

  it("builds a flat sync payload and omits an empty title", () => {
    const withTitle = buildSyncPayload({
      sport: "padel",
      playedAt: "2026-09-06T10:00:00.000Z",
      title: "Club night",
    });
    assert.equal(withTitle.ok, true);
    if (withTitle.ok) {
      assert.deepEqual(withTitle.value, {
        sport: "padel",
        playedAt: "2026-09-06T10:00:00.000Z",
        title: "Club night",
      });
    }

    const bare = buildSyncPayload({
      sport: "golf",
      playedAt: "2026-09-06T11:00:00.000Z",
      title: "  ",
    });
    assert.equal(bare.ok, true);
    if (bare.ok) {
      assert.deepEqual(bare.value, {
        sport: "golf",
        playedAt: "2026-09-06T11:00:00.000Z",
      });
    }

    const badSport = buildSyncPayload({
      sport: "soccer",
      playedAt: "2026-09-06T10:00:00.000Z",
    });
    assert.equal(badSport.ok, false);
    if (!badSport.ok) assert.equal(badSport.status, 400);
  });

  it("upserts the returned provider and drops hidden ids", () => {
    const next = upsertProvider([GENERIC], CONNECTED);
    assert.equal(next[0]?.status, "connected");
    assert.equal(next[0]?.importedSessionCount, 2);
    assert.deepEqual(
      upsertProvider([GENERIC], { ...CONNECTED, id: "trackman" }),
      [GENERIC],
    );
  });
});

describe("integrations client", () => {
  it("lists connectable providers from GET /api/me/integrations", async () => {
    const result = await listIntegrationsWith({
      fetch: async (url) => {
        assert.match(String(url), /\/api\/me\/integrations$/);
        return new Response(
          JSON.stringify({ providers: [GENERIC, TRACKMAN, AUTODARTS] }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.providers.length, 1);
    assert.equal(result.value.providers[0]?.id, GENERIC_IMPORT_PROVIDER_ID);
    assert.equal(result.value.providers[0]?.status, "disconnected");
  });

  it("soft-fails list on 401 / 404 / 503 / network instead of throwing", async () => {
    const guest = await listIntegrationsWith({
      fetch: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(guest.ok, false);
    if (!guest.ok) assert.equal(guest.status, 401);

    const missing = await listIntegrationsWith({
      fetch: async () => new Response("not migrated", { status: 404 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.equal(missing.status, 404);
      assert.equal(isIntegrationsSoftFailure(missing.status), true);
    }

    const down = await listIntegrationsWith({
      fetch: async () => new Response("nope", { status: 503 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(down.ok, false);
    if (!down.ok) {
      assert.equal(down.status, 503);
      assert.equal(isIntegrationsSoftFailure(down.status), true);
    }

    const network = await listIntegrationsWith({
      fetch: async () => {
        throw new Error("offline");
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(network.ok, false);
    if (!network.ok) {
      assert.equal(network.status, 0);
      assert.equal(isIntegrationsSoftFailure(network.status), true);
    }
  });

  it("POSTs connect with empty {} for generic-import", async () => {
    let sawBody = "";
    const result = await connectIntegrationWith(
      GENERIC_IMPORT_PROVIDER_ID,
      {},
      {
        fetch: async (url, init) => {
          assert.match(
            String(url),
            /\/api\/me\/integrations\/generic-import\/connect$/,
          );
          assert.equal(init?.method, "POST");
          sawBody = String(init?.body ?? "");
          return new Response(JSON.stringify({ provider: CONNECTED }), {
            status: 200,
          });
        },
        baseUrl: "https://api.example.test",
      },
    );

    assert.equal(sawBody, JSON.stringify({}));
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.status, "connected");
  });

  it("POSTs optional token on connect without logging it in the result", async () => {
    let sawBody = "";
    const result = await connectIntegrationWith(
      GENERIC_IMPORT_PROVIDER_ID,
      { token: "secret-label" },
      {
        fetch: async (_url, init) => {
          sawBody = String(init?.body ?? "");
          return new Response(
            JSON.stringify({
              provider: { ...CONNECTED, credentialMasked: "••••abel" },
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );

    assert.equal(sawBody, JSON.stringify({ token: "secret-label" }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.credentialMasked, "••••abel");
  });

  it("refuses to connect hidden catalog ids locally", async () => {
    const result = await connectIntegrationWith(
      "trackman",
      {},
      {
        fetch: async () => {
          throw new Error("should not fetch");
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 409);
  });

  it("DELETEs a provider and keeps lastSyncedAt from the response", async () => {
    const disconnected = {
      ...CONNECTED,
      status: "disconnected" as const,
      disconnectedAt: "2026-09-06T11:00:00.000Z",
    };
    const result = await disconnectIntegrationWith(GENERIC_IMPORT_PROVIDER_ID, {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/me\/integrations\/generic-import$/);
        assert.equal(init?.method, "DELETE");
        return new Response(JSON.stringify({ provider: disconnected }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.status, "disconnected");
    assert.equal(result.value.lastSyncedAt, CONNECTED.lastSyncedAt);
    assert.equal(result.value.importedSessionCount, 2);
  });

  it("POSTs a flat sync session body", async () => {
    let sawBody = "";
    const result = await syncIntegrationWith(
      GENERIC_IMPORT_PROVIDER_ID,
      {
        sport: "padel",
        playedAt: "2026-09-06T10:00:00.000Z",
        title: "Club night",
      },
      {
        fetch: async (url, init) => {
          assert.match(
            String(url),
            /\/api\/me\/integrations\/generic-import\/sync$/,
          );
          assert.equal(init?.method, "POST");
          sawBody = String(init?.body ?? "");
          return new Response(
            JSON.stringify({
              provider: {
                ...CONNECTED,
                importedSessionCount: 3,
              },
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );

    assert.equal(
      sawBody,
      JSON.stringify({
        sport: "padel",
        playedAt: "2026-09-06T10:00:00.000Z",
        title: "Club night",
      }),
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.importedSessionCount, 3);
  });

  it("surfaces 401 connect and 409 sync-while-disconnected", async () => {
    const unauth = await connectIntegrationWith(
      GENERIC_IMPORT_PROVIDER_ID,
      {},
      {
        fetch: async () =>
          new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
          }),
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(unauth.ok, false);
    if (!unauth.ok) assert.equal(unauth.status, 401);

    const blocked = await syncIntegrationWith(
      GENERIC_IMPORT_PROVIDER_ID,
      { sport: "padel", playedAt: "2026-09-06T10:00:00.000Z" },
      {
        fetch: async () =>
          new Response(
            JSON.stringify({ error: "Integration is not connected" }),
            { status: 409 },
          ),
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 409);
      assert.equal(blocked.error, "Integration is not connected");
    }
  });

  it("surfaces 404 unknown provider without throwing", async () => {
    const result = await connectIntegrationWith("missing-provider", {}, {
      fetch: async () =>
        new Response(JSON.stringify({ error: "Provider not found" }), {
          status: 404,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 404);
      assert.equal(result.error, "Provider not found");
    }
  });
});
