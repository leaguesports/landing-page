import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HUB_PLAY_DEEP_LINK_REDIRECTS } from "./hub-redirects.ts";

describe("Play deep-link redirects (#192)", () => {
  it("aliases /organise and former Play entries onto current destinations", () => {
    assert.deepEqual(
      HUB_PLAY_DEEP_LINK_REDIRECTS.map((row) => [row.source, row.destination]),
      [
        ["/organise", "/play/organise"],
        ["/play/lobby", "/lobby"],
        ["/play/team-matches", "/team-matches"],
        ["/play/team-matches/:path*", "/team-matches/:path*"],
        ["/play/tournaments", "/tournaments"],
        ["/play/tournaments/:path*", "/tournaments/:path*"],
      ],
    );
  });
});
