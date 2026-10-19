import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { makeGuestPlayer, makeUserPlayer } from "./recent-players.ts";
import {
  capturePairingsReady,
  playerInitials,
  playerIsSelf,
  swapCaptureSlots,
} from "./capture-court.ts";
import type { PadelPlayer } from "../../types/padel-match.ts";

const self = makeUserPlayer({
  id: "user-1",
  displayName: "Alex Morgan",
  userId: "user-1",
});

function guests(): Record<"a1" | "a2" | "b1" | "b2", PadelPlayer | null> {
  return {
    a1: self,
    a2: makeGuestPlayer("Sam"),
    b1: makeGuestPlayer("Jordan"),
    b2: makeGuestPlayer("Riley"),
  };
}

describe("swapCaptureSlots", () => {
  it("swaps two players across teams", () => {
    const slots = guests();
    const next = swapCaptureSlots(slots, "a1", "b2");
    assert.equal(next.a1?.id, slots.b2?.id);
    assert.equal(next.b2?.id, self.id);
    assert.equal(next.a2?.id, slots.a2?.id);
    assert.equal(next.b1?.id, slots.b1?.id);
    assert.equal(capturePairingsReady(next, self), true);
  });

  it("swaps a player into an empty slot", () => {
    const slots = { ...guests(), b2: null };
    const next = swapCaptureSlots(slots, "a2", "b2");
    assert.equal(next.b2?.id, slots.a2?.id);
    assert.equal(next.a2, null);
    assert.equal(capturePairingsReady(next, self), false);
  });

  it("leaves slots unchanged when the same slot is chosen twice", () => {
    const slots = guests();
    assert.equal(swapCaptureSlots(slots, "b1", "b1"), slots);
  });
});

describe("capturePairingsReady", () => {
  it("requires all four slots", () => {
    const slots = { ...guests(), a2: null };
    assert.equal(capturePairingsReady(slots, self), false);
    assert.equal(capturePairingsReady(guests(), null), true);
  });

  it("requires the signed-in player to remain seated", () => {
    const replaced = { ...guests(), a1: makeGuestPlayer("Kim") };
    assert.equal(capturePairingsReady(replaced, self), false);
    assert.equal(capturePairingsReady(replaced, null), true);
  });

  it("treats the same user id in another slot as seated", () => {
    const moved = makeUserPlayer({
      id: "other-row",
      displayName: "Alex Morgan",
      userId: "user-1",
    });
    const slots = { ...guests(), a1: makeGuestPlayer("Kim"), b1: moved };
    assert.equal(playerIsSelf(moved, self), true);
    assert.equal(capturePairingsReady(slots, self), true);
  });
});

describe("playerInitials", () => {
  it("uses the first and last name and drops the guest suffix", () => {
    assert.equal(playerInitials("Sam (Guest)"), "SA");
    assert.equal(playerInitials("Alex Morgan"), "AM");
    assert.equal(playerInitials("Jo"), "JO");
  });
});

describe("capture screen wiring", () => {
  const padelDir = join(
    dirname(fileURLToPath(import.meta.url)),
    "../../components/padel",
  );

  it("uses the court on capture and leaves live start on PlayerPairings", () => {
    const capture = readFileSync(join(padelDir, "PadelCaptureForm.tsx"), "utf8");
    const live = readFileSync(join(padelDir, "PadelQuickStart.tsx"), "utf8");
    const pairings = readFileSync(join(padelDir, "PlayerPairings.tsx"), "utf8");

    assert.match(capture, /<CaptureCourtPairings/);
    assert.doesNotMatch(capture, /<PlayerPairings/);
    assert.match(live, /<PlayerPairings/);
    assert.doesNotMatch(live, /CaptureCourtPairings/);
    assert.match(pairings, /Tap to pick/);
  });
});
