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
        ["/play/padel/organise", "/play/padel"],
        ["/play/golf/organise", "/play/golf"],
        ["/play/lobby", "/play"],
        ["/play/team-matches", "/play"],
        ["/play/team-matches/:path*", "/play"],
        ["/play/tournaments", "/play"],
        ["/play/tournaments/:path*", "/play"],
        ["/play/golf-tours", "/play/golf"],
        ["/play/golf-tours/:path*", "/play/golf"],
        ["/play/golf/tours", "/play/golf"],
        ["/play/golf/tours/:path*", "/play/golf"],
      ],
    );
  });
});
