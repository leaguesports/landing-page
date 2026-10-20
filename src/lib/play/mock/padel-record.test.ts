import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PADEL_MOCK_PLAYERS,
  PADEL_MOCK_VENUES,
  PADEL_MOCK_YOU_ID,
} from "./padel-mock-data.ts";
import {
  assignPlayer,
  availablePlayers,
  initialPadelDraft,
  removePlayer,
  setDraftFormat,
  setDraftVenue,
  slotCount,
  teamsReady,
} from "./padel-record.ts";

describe("padel mock players", () => {
  it("includes You and assigns two or four players", () => {
    assert.equal(PADEL_MOCK_PLAYERS[0]?.id, PADEL_MOCK_YOU_ID);
    assert.equal(PADEL_MOCK_PLAYERS[0]?.name, "You");
    assert.ok(PADEL_MOCK_PLAYERS.length >= 5);
    assert.ok(PADEL_MOCK_VENUES.length >= 3);
    assert.equal(slotCount("singles"), 1);
    assert.equal(slotCount("doubles"), 2);

    let draft = initialPadelDraft();
    assert.equal(draft.format, "doubles");
    assert.equal(teamsReady(draft), false);
    for (const id of ["you", "alex-nkosi", "sam-pillay", "riley-botha"]) {
      draft = assignPlayer(draft, id);
    }
    assert.deepEqual(draft.teamA, ["you", "alex-nkosi"]);
    assert.deepEqual(draft.teamB, ["sam-pillay", "riley-botha"]);
    assert.equal(teamsReady(draft), true);
    assert.equal(assignPlayer(draft, "jordan-naidoo"), draft);
    assert.equal(assignPlayer(draft, "you"), draft);
    assert.equal(assignPlayer(draft, "not-a-person"), draft);

    draft = removePlayer(draft, "alex-nkosi");
    assert.equal(teamsReady(draft), false);
    assert.deepEqual(
      availablePlayers(draft).map((player) => player.id),
      ["alex-nkosi", "jordan-naidoo", "casey-mokoena"],
    );

    draft = setDraftFormat(draft, "singles");
    assert.deepEqual(draft.teamA, ["you"]);
    assert.deepEqual(draft.teamB, ["sam-pillay"]);
    assert.equal(teamsReady(draft), true);
    draft = setDraftFormat(draft, "doubles");
    assert.equal(teamsReady(draft), false);

    const venueId = PADEL_MOCK_VENUES[0]?.id ?? "";
    draft = setDraftVenue(draft, venueId);
    assert.equal(draft.venueId, venueId);
    draft = setDraftVenue(draft, venueId);
    assert.equal(draft.venueId, null);
    assert.equal(setDraftVenue(draft, "nope").venueId, null);
  });
});
