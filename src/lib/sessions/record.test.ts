import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseRecordSessionResponse,
  recordSessionWith,
} from "./record.ts";

describe("record session client", () => {
  it("parses a recorded padel response", () => {
    const parsed = parseRecordSessionResponse({
      session: {
        id: "s1",
        sport: "padel",
        config: { format: "best_of_3" },
        status: "closed",
        venueId: null,
        lobbyId: null,
        endedAt: null,
        createdAt: "2026-11-20T12:00:00.000Z",
        updatedAt: "2026-11-20T12:00:00.000Z",
      },
      state: { winner: "A" },
      events: [{ seq: 1, type: "match.recorded", data: {}, participantId: null }],
    });
    assert.equal(parsed?.session.id, "s1");
    assert.equal(parsed?.session.status, "closed");
    assert.deepEqual(parsed?.state, { winner: "A" });
  });

  it("posts to /api/sessions/record with credentials", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const result = await recordSessionWith(
      {
        sport: "padel",
        config: {},
        events: [{ type: "match.recorded", data: { sets: [] } }],
      },
      {
        baseUrl: "http://localhost:3000",
        fetch: (async (input, init) => {
          calls.push({ url: String(input), init });
          return new Response(
            JSON.stringify({
              session: {
                id: "s1",
                sport: "padel",
                config: {},
                status: "closed",
                venueId: null,
                lobbyId: null,
                endedAt: null,
                createdAt: "2026-11-20T12:00:00.000Z",
                updatedAt: "2026-11-20T12:00:00.000Z",
              },
              state: { winner: "A" },
              events: [{ seq: 1, type: "match.recorded", data: {}, participantId: null }],
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          );
        }) as typeof fetch,
      },
    );

    assert.equal(result.ok, true);
    assert.equal(calls[0]?.url, "http://localhost:3000/api/sessions/record");
    assert.equal(calls[0]?.init?.method, "POST");
    assert.equal(calls[0]?.init?.credentials, "include");
  });

  it("returns API error messages", async () => {
    const result = await recordSessionWith(
      { sport: "padel", config: {}, events: [] },
      {
        baseUrl: "http://localhost:3000",
        fetch: (async () =>
          new Response(JSON.stringify({ error: "Padel scoreline is not a finished match" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })) as typeof fetch,
      },
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Padel scoreline is not a finished match");
      assert.equal(result.status, 400);
    }
  });
});
