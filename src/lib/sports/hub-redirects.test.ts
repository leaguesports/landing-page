import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HUB_PLAY_DEEP_LINK_REDIRECTS } from "./hub-redirects.ts";

describe("Play deep-link redirects (#192 / #212)", () => {
  it("folds the Organise hub into /play and keeps former Play aliases", () => {
    assert.deepEqual(
      HUB_PLAY_DEEP_LINK_REDIRECTS.map((row) => [row.source, row.destination]),
      [
        ["/organise", "/play"],
        ["/play/organise", "/play"],
        ["/play/padel/organise", "/padel/organise"],
        ["/play/golf/organise", "/golf/organise"],
        ["/play/lobby", "/lobby"],
        ["/play/team-matches", "/team-matches"],
        ["/play/team-matches/:path*", "/team-matches/:path*"],
        ["/play/tournaments", "/tournaments"],
        ["/play/tournaments/:path*", "/tournaments/:path*"],
        ["/play/golf-tours", "/golf-tours"],
        ["/play/golf-tours/:path*", "/golf-tours/:path*"],
        ["/play/golf/tours", "/golf-tours"],
        ["/play/golf/tours/:path*", "/golf-tours/:path*"],
      ],
    );
  });
});
