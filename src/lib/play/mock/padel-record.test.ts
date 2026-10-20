import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PADEL_MOCK_PLAYERS,
  PADEL_MOCK_VENUES,
  PADEL_MOCK_YOU_ID,
} from "./padel-mock-data.ts";
import {
  addGuestToSlot,
  clearSlot,
  courtSlots,
  fillSlot,
  initialPadelDraft,
  matchingPlayers,
  matchingVenues,
  readSlot,
  setDraftFormat,
  setDraftVenue,
  slotCount,
  teamsReady,
} from "./padel-record.ts";

describe("padel court slots", () => {
  it("starts You in A1 on a doubles court", () => {
    assert.equal(PADEL_MOCK_PLAYERS[0]?.id, PADEL_MOCK_YOU_ID);
    assert.equal(PADEL_MOCK_PLAYERS[0]?.name, "You");
    assert.ok(PADEL_MOCK_PLAYERS.length >= 5);
    assert.ok(PADEL_MOCK_VENUES.length >= 3);
    assert.equal(slotCount("singles"), 1);
    assert.equal(slotCount("doubles"), 2);
    assert.deepEqual(courtSlots("doubles"), ["A1", "A2", "B1", "B2"]);
    assert.deepEqual(courtSlots("singles"), ["A1", "B1"]);

    const draft = initialPadelDraft();
    assert.equal(draft.format, "doubles");
    assert.equal(readSlot(draft, "A1"), "you");
    assert.equal(readSlot(draft, "A2"), null);
    assert.equal(readSlot(draft, "B1"), null);
    assert.equal(readSlot(draft, "B2"), null);
    assert.equal(teamsReady(draft), false);
  });

  it("fills a slot and swaps when that player is already on court", () => {
    let draft = initialPadelDraft();
    draft = fillSlot(draft, "A2", "alex-nkosi");
    draft = fillSlot(draft, "B1", "sam-pillay");
    draft = fillSlot(draft, "B2", "riley-botha");
    assert.deepEqual(draft.teamA, ["you", "alex-nkosi"]);
    assert.deepEqual(draft.teamB, ["sam-pillay", "riley-botha"]);
    assert.equal(teamsReady(draft), true);

    const swapped = fillSlot(draft, "B2", "you");
    assert.equal(readSlot(swapped, "A1"), "riley-botha");
    assert.equal(readSlot(swapped, "B2"), "you");
    assert.equal(teamsReady(swapped), true);

    const moved = fillSlot(initialPadelDraft(), "B1", "you");
    assert.equal(readSlot(moved, "A1"), null);
    assert.equal(readSlot(moved, "B1"), "you");

    assert.equal(fillSlot(draft, "A1", "you"), draft);
    assert.equal(fillSlot(draft, "A1", "not-a-person"), draft);
    const singles = setDraftFormat(draft, "singles");
    assert.equal(fillSlot(singles, "A2", "jordan-naidoo"), singles);
  });

  it("clears a filled slot and leaves an empty one alone", () => {
    const draft = fillSlot(initialPadelDraft(), "A2", "alex-nkosi");
    const cleared = clearSlot(draft, "A1");
    assert.equal(readSlot(cleared, "A1"), null);
    assert.equal(readSlot(cleared, "A2"), "alex-nkosi");
    assert.equal(teamsReady(cleared), false);
    assert.equal(clearSlot(cleared, "A1"), cleared);
    assert.equal(clearSlot(cleared, "B2"), cleared);
  });

  it("confirms a guest into the slot and drops them when the slot is cleared", () => {
    const draft = addGuestToSlot(initialPadelDraft(), "B1", "  Jamie   Botha ");
    assert.equal(readSlot(draft, "B1")?.startsWith("guest-jamie-botha"), true);
    assert.equal(draft.guests[0]?.name, "Jamie Botha");
    assert.equal(addGuestToSlot(draft, "B1", "   "), draft);
    assert.equal(addGuestToSlot(draft, "A2", ""), draft);

    const again = addGuestToSlot(draft, "B2", "Jamie Botha");
    assert.notEqual(readSlot(again, "B1"), readSlot(again, "B2"));
    assert.equal(again.guests.length, 2);

    const replaced = fillSlot(draft, "B1", "sam-pillay");
    assert.equal(readSlot(replaced, "B1"), "sam-pillay");
    assert.deepEqual(replaced.guests, []);

    const cleared = clearSlot(draft, "B1");
    assert.equal(readSlot(cleared, "B1"), null);
    assert.deepEqual(cleared.guests, []);
  });

  it("keeps A1 and B1 when the format switches to singles", () => {
    let draft = initialPadelDraft();
    draft = fillSlot(draft, "A2", "alex-nkosi");
    draft = addGuestToSlot(draft, "B1", "Jamie");
    draft = fillSlot(draft, "B2", "riley-botha");
    const guestId = readSlot(draft, "B1");

    const singles = setDraftFormat(draft, "singles");
    assert.deepEqual(singles.teamA, ["you"]);
    assert.deepEqual(singles.teamB, [guestId]);
    assert.equal(singles.guests.length, 1);
    assert.equal(teamsReady(singles), true);
    assert.equal(setDraftFormat(singles, "singles"), singles);

    const doubles = setDraftFormat(singles, "doubles");
    assert.deepEqual(doubles.teamA, ["you", null]);
    assert.deepEqual(doubles.teamB, [guestId, null]);
    assert.equal(teamsReady(doubles), false);
  });

  it("enables Continue only when every slot is filled", () => {
    let draft = initialPadelDraft();
    assert.equal(teamsReady(draft), false);
    draft = fillSlot(draft, "A2", "alex-nkosi");
    draft = fillSlot(draft, "B1", "sam-pillay");
    assert.equal(teamsReady(draft), false);
    draft = fillSlot(draft, "B2", "riley-botha");
    assert.equal(teamsReady(draft), true);

    const singles = setDraftFormat(draft, "singles");
    assert.equal(teamsReady(singles), true);
    assert.equal(teamsReady(clearSlot(singles, "B1")), false);
  });

  it("sets a venue without toggling, and filters the sheet lists", () => {
    let draft = initialPadelDraft();
    const venueId = PADEL_MOCK_VENUES[0]?.id ?? "";
    draft = setDraftVenue(draft, venueId);
    assert.equal(draft.venueId, venueId);
    assert.equal(setDraftVenue(draft, venueId), draft);
    assert.equal(setDraftVenue(draft, "nope"), draft);
    assert.equal(setDraftVenue(draft, null).venueId, null);
    const fresh = initialPadelDraft();
    assert.equal(setDraftVenue(fresh, null), fresh);

    assert.deepEqual(
      matchingPlayers("nk").map((player) => player.id),
      ["alex-nkosi"],
    );
    assert.equal(matchingPlayers("  ").length, PADEL_MOCK_PLAYERS.length);
    assert.deepEqual(
      matchingVenues("KLOOF").map((venue) => venue.name),
      ["Kloof Club"],
    );
  });
});
