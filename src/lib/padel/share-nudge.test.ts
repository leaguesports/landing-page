import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dismissPadelShareNudge,
  isPadelShareNudgeDismissed,
  padelShareNudgeDismissKey,
} from "./share-nudge.ts";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

describe("padelShareNudgeDismissKey", () => {
  it("scopes the key to the match id", () => {
    assert.equal(
      padelShareNudgeDismissKey("match_01HZX"),
      "ls_padel_share_nudge_dismissed:match_01HZX",
    );
  });
});

describe("isPadelShareNudgeDismissed / dismissPadelShareNudge", () => {
  it("is false until dismissed for that matchId", () => {
    const storage = memoryStorage();
    assert.equal(isPadelShareNudgeDismissed("a", storage), false);
    dismissPadelShareNudge("a", storage);
    assert.equal(isPadelShareNudgeDismissed("a", storage), true);
    assert.equal(isPadelShareNudgeDismissed("b", storage), false);
  });

  it("treats missing or empty matchId as not dismissed", () => {
    const storage = memoryStorage();
    assert.equal(isPadelShareNudgeDismissed("", storage), false);
    dismissPadelShareNudge("", storage);
    assert.equal(storage.length, 0);
  });

  it("returns false when storage is unavailable", () => {
    assert.equal(isPadelShareNudgeDismissed("a", null), false);
    dismissPadelShareNudge("a", null);
  });
});
