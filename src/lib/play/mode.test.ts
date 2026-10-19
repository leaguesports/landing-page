import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  PLAY_MODE_STORAGE_KEY,
  initialModeSheet,
  isPlayModeAppPath,
  modeSheetRows,
  nextFocusIndex,
  parsePlayMode,
  playModeHref,
  playModeUrlDecision,
  readStoredPlayMode,
  reduceModeSheet,
  resolvePlayMode,
  writeStoredPlayMode,
} from "./mode.ts";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("play mode parsing and persistence", () => {
  it("accepts social, golf, and padel only", () => {
    assert.equal(parsePlayMode("golf"), "golf");
    assert.equal(parsePlayMode(" Golf "), "golf");
    assert.equal(parsePlayMode("PADEL"), "padel");
    assert.equal(parsePlayMode("social"), "social");
    assert.equal(parsePlayMode("darts"), null);
    assert.equal(parsePlayMode("tennis"), null);
    assert.equal(parsePlayMode(""), null);
    assert.equal(parsePlayMode(null), null);
  });

  it("lets the URL win, then storage, then Social", () => {
    assert.equal(
      resolvePlayMode({ urlMode: null, storedMode: null, urlPresent: false }),
      "social",
    );
    assert.equal(
      resolvePlayMode({ urlMode: null, storedMode: "golf", urlPresent: false }),
      "golf",
    );
    assert.equal(
      resolvePlayMode({ urlMode: "padel", storedMode: "golf", urlPresent: true }),
      "padel",
    );
    assert.equal(
      resolvePlayMode({ urlMode: "darts", storedMode: "golf", urlPresent: true }),
      "social",
    );
    assert.equal(
      resolvePlayMode({ urlMode: "", storedMode: "padel", urlPresent: true }),
      "social",
    );
  });

  it("rewrites an invalid or stored mode without a full reload path", () => {
    assert.deepEqual(
      playModeUrlDecision({ urlMode: "golf", storedMode: "social", urlPresent: true }),
      { mode: "golf", href: null },
    );
    assert.deepEqual(
      playModeUrlDecision({ urlMode: "Golf", storedMode: null, urlPresent: true }),
      { mode: "golf", href: "/play?mode=golf" },
    );
    assert.deepEqual(
      playModeUrlDecision({ urlMode: "nope", storedMode: "padel", urlPresent: true }),
      { mode: "social", href: "/play?mode=social" },
    );
    assert.deepEqual(
      playModeUrlDecision({ urlMode: null, storedMode: "padel", urlPresent: false }),
      { mode: "padel", href: "/play?mode=padel" },
    );
    assert.deepEqual(
      playModeUrlDecision({ urlMode: null, storedMode: null, urlPresent: false }),
      { mode: "social", href: null },
    );
    assert.equal(playModeHref("social"), "/play?mode=social");
    assert.equal(isPlayModeAppPath("/play"), true);
    assert.equal(isPlayModeAppPath("/play/golf"), false);
    assert.equal(isPlayModeAppPath("/play/padel"), false);
    assert.equal(isPlayModeAppPath("/play/darts"), false);
    assert.equal(isPlayModeAppPath("/play/quick"), false);
  });

  it("round-trips the last mode through storage", () => {
    const store = memory();
    assert.equal(readStoredPlayMode(store), null);
    writeStoredPlayMode(store, "golf");
    assert.equal(store.getItem(PLAY_MODE_STORAGE_KEY), "golf");
    assert.equal(
      resolvePlayMode({
        urlMode: null,
        storedMode: readStoredPlayMode(store),
        urlPresent: false,
      }),
      "golf",
    );
    writeStoredPlayMode(
      {
        setItem() {
          throw new Error("private");
        },
      },
      "padel",
    );
  });
});

describe("mode sheet", () => {
  it("opens, ticks the current row, selects, and closes", () => {
    const closed = initialModeSheet("social");
    assert.equal(closed.open, false);
    const open = reduceModeSheet(closed, { type: "open" });
    assert.equal(open.open, true);
    assert.equal(open.cursor, 0);
    let rows = modeSheetRows(open.mode);
    assert.deepEqual(
      rows.map((row) => [row.id, row.current, row.disabled]),
      [
        ["social", true, false],
        ["golf", false, false],
        ["padel", false, false],
        ["add", false, true],
      ],
    );
    assert.equal(rows.some((row) => (row.id as string) === "darts"), false);
    assert.equal(rows.find((row) => row.id === "social")?.detail, "Activity from everyone you follow");
    assert.equal(rows.find((row) => row.id === "golf")?.detail, "Rounds, scores and handicap");
    assert.equal(rows.find((row) => row.id === "padel")?.detail, "Matches and open games");

    const moved = reduceModeSheet(open, { type: "key", key: "ArrowDown" });
    assert.equal(moved.cursor, 1);
    const picked = reduceModeSheet(moved, { type: "key", key: "Enter" });
    assert.equal(picked.open, false);
    assert.equal(picked.mode, "golf");
    rows = modeSheetRows(picked.mode);
    assert.equal(rows.find((row) => row.id === "golf")?.current, true);
    assert.equal(rows.find((row) => row.id === "social")?.current, false);

    const again = reduceModeSheet(picked, { type: "open" });
    const stayed = reduceModeSheet(again, { type: "key", key: "Escape" });
    assert.equal(stayed.open, false);
    assert.equal(stayed.mode, "golf");
    const blocked = reduceModeSheet(again, { type: "select", id: "add" });
    assert.equal(blocked.open, true);
    assert.equal(blocked.mode, "golf");
    assert.deepEqual(reduceModeSheet(again, { type: "select", id: "padel" }), {
      open: false,
      mode: "padel",
      cursor: 2,
    });
  });

  it("wraps keyboard focus around the enabled rows", () => {
    assert.equal(nextFocusIndex(3, 2, false), 0);
    assert.equal(nextFocusIndex(3, 0, true), 2);
    const open = reduceModeSheet(initialModeSheet("social"), { type: "open" });
    const up = reduceModeSheet(open, { type: "key", key: "ArrowUp" });
    assert.equal(up.cursor, 2);
    assert.equal(reduceModeSheet(open, { type: "key", key: "Escape" }).mode, "social");
    assert.equal(reduceModeSheet(initialModeSheet("golf"), { type: "key", key: "Enter" }).open, false);
  });

  it("keeps the /play shell free of the bottom tab bar and live fetches", () => {
    const page = readFileSync(new URL("../../app/play/page.tsx", import.meta.url), "utf8");
    const app = readFileSync(
      new URL("../../components/play/PlayModeApp.tsx", import.meta.url),
      "utf8",
    );
    const chrome = readFileSync(
      new URL("../../components/ChromeFrame.tsx", import.meta.url),
      "utf8",
    );
    assert.match(page, /PlayModeApp/);
    assert.doesNotMatch(page, /HubBottomNav|PlayHubChrome/);
    assert.match(app, /role="dialog"/);
    assert.match(app, /aria-modal="true"/);
    assert.doesNotMatch(app, /fetch\(|getServerAuthState|HubBottomNav/);
    assert.match(app, /PLAY_MODE_SESSION_LIVE/);
    assert.match(chrome, /isPlayModeAppPath/);
  });
});
