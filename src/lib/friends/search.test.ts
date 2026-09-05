import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { searchUsersWith } from "./search.ts";

describe("user search client", () => {
  it("queries /api/users/search and parses relationship", async () => {
    let sawUrl = "";
    const result = await searchUsersWith("bla", {
      fetch: async (input) => {
        sawUrl = String(input);
        return new Response(
          JSON.stringify({
            users: [
              {
                id: "user-b",
                displayName: "Blake Golfer",
                handle: "blake",
                avatarUrl: null,
                relationship: "none",
              },
            ],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://app.test",
    });

    assert.equal(result.ok, true);
    assert.match(sawUrl, /\/api\/users\/search\?/);
    assert.match(sawUrl, /q=bla/);
    if (result.ok) {
      assert.equal(result.users[0]?.handle, "blake");
      assert.equal(result.users[0]?.relationship, "none");
    }
  });

  it("returns empty results for blank queries without fetching", async () => {
    let fetched = false;
    const result = await searchUsersWith("  ", {
      fetch: async () => {
        fetched = true;
        return new Response("{}", { status: 500 });
      },
      baseUrl: "https://app.test",
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.users, []);
    assert.equal(fetched, false);
  });
});
