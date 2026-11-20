import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyPadelCaptureDraft,
  padelCapturePayload,
  validatePadelCaptureDraft,
} from "./padel-capture.ts";

describe("padel capture draft", () => {
  it("requires players on both teams and a finished scoreline", () => {
    const draft = emptyPadelCaptureDraft();
    assert.equal(validatePadelCaptureDraft(draft)?.field, "players");

    draft.teamA = [{ name: "Alex" }, { name: "Sam" }];
    draft.teamB = [{ name: "Jordan" }, { name: "Chris" }];
    draft.sets = [
      { a: 6, b: 4 },
      { a: 6, b: 3 },
    ];
    assert.equal(validatePadelCaptureDraft(draft), null);

    const payload = padelCapturePayload(draft);
    assert.equal(payload?.event.type, "match.recorded");
    assert.deepEqual(payload?.event.data.sets, [
      { a: 6, b: 4 },
      { a: 6, b: 3 },
    ]);
  });
});
