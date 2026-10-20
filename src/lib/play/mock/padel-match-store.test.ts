import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PLAY_MODE_SESSION_LIVE } from "../mode.ts";
import { PADEL_HOME_COPY, PadelHomeView } from "../padel-home.ts";
import { fillSlot, initialPadelDraft, setDraftVenue } from "./padel-record.ts";
import { stepGames, stepTiebreak, type PadelSet } from "./padel-score.ts";
import {
  PADEL_MOCK_FLAG_KEY,
  PADEL_MOCK_MATCHES_KEY,
  PADEL_MOCK_SHARE_TOAST,
  buildSavedMatch,
  isPadelMockEnabled,
  padelRecordDecision,
  readPadelMatches,
  readPadelMockEnabled,
  recentCardsForHome,
  savePadelMatch,
  summaryFromDraft,
} from "./padel-match-store.ts";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

function pump(set: PadelSet, side: "A" | "B", times: number, tiebreak = false): PadelSet {
  let next = set;
  for (let i = 0; i < times; i += 1) {
    next = tiebreak ? stepTiebreak(next, side, 1) : stepGames(next, side, 1);
  }
  return next;
}

function doublesDraft() {
  let draft = initialPadelDraft();
  draft = fillSlot(draft, "A2", "alex-nkosi");
  draft = fillSlot(draft, "B1", "sam-pillay");
  draft = fillSlot(draft, "B2", "riley-botha");
  draft = setDraftVenue(draft, "harbour-padel");
  const setOne = pump(pump(draft.sets[0]!, "A", 6), "B", 4);
  const setTwo = pump(pump(draft.sets[1]!, "A", 3), "B", 6);
  let setThree = pump(pump(draft.sets[0]!, "A", 6), "B", 6);
  setThree = pump(setThree, "A", 5, true);
  setThree = pump(setThree, "B", 5, true);
  setThree = pump(setThree, "A", 2, true);
  draft = { ...draft, sets: [setOne, setTwo, setThree] };
  return draft;
}

function home(recent: { id: string; teams: string; score: string; detail: string; demo: boolean }[]) {
  return renderToStaticMarkup(
    createElement(PadelHomeView, {
      eyebrow: "PADEL · TUE 20 OCT",
      title: "Game on",
      notice: null,
      recent,
      showDemo: recent.length > 0,
      onAction() {},
    }),
  );
}

describe("padel mock gate", () => {
  it("opens the flow for ?mock=1 or the localStorage flag, and keeps Coming soon otherwise", () => {
    assert.equal(PLAY_MODE_SESSION_LIVE, false);
    assert.equal(isPadelMockEnabled({ search: "?mode=padel&mock=1", flag: null }), true);
    assert.equal(isPadelMockEnabled({ search: "mode=padel&mock=1", flag: null }), true);
    assert.equal(isPadelMockEnabled({ search: "?mock=1&mode=padel", flag: null }), true);
    assert.equal(isPadelMockEnabled({ search: "?mode=padel", flag: "1" }), true);
    assert.equal(isPadelMockEnabled({ search: "?mode=padel", flag: "true" }), true);
    assert.equal(isPadelMockEnabled({ search: "?mode=padel", flag: null }), false);
    assert.equal(isPadelMockEnabled({ search: "?mode=padel&mock=0", flag: null }), false);
    assert.equal(isPadelMockEnabled({ search: "?mock=true", flag: "" }), false);
    assert.equal(isPadelMockEnabled({ search: "?mock=2", flag: "yes" }), false);

    const store = memory();
    assert.equal(readPadelMockEnabled({ search: "?mode=padel", storage: store }), false);
    store.setItem(PADEL_MOCK_FLAG_KEY, "1");
    assert.equal(readPadelMockEnabled({ search: "?mode=padel", storage: store }), true);
    assert.equal(
      readPadelMockEnabled({
        search: "?mode=padel&mock=1",
        storage: {
          getItem() {
            throw new Error("private");
          },
        },
      }),
      true,
    );

    assert.deepEqual(padelRecordDecision(false), { open: false, notice: "Coming soon" });
    assert.deepEqual(padelRecordDecision(true), { open: true });
    assert.equal(PADEL_MOCK_SHARE_TOAST, "Demo only. Nothing was shared.");
  });
});

describe("padel mock match store", () => {
  it("saves matches in localStorage, newest first, and hides them when mock mode is off", () => {
    const now = new Date(2026, 9, 20, 9, 30);
    const draft = doublesDraft();
    const summary = summaryFromDraft(draft, now);
    assert.equal(summary?.winner, "Team A");
    assert.deepEqual(summary?.sets, ["6-4", "3-6", "7-6 (7-5)"]);
    assert.equal(summary?.teamA, "You & Alex Nkosi");
    assert.equal(summary?.teamB, "Sam Pillay & Riley Botha");
    assert.equal(summary?.venue, "Harbour Padel");
    assert.equal(summary?.date, "20 Oct 2026");
    assert.equal(summaryFromDraft(initialPadelDraft(), now), null);

    const older = buildSavedMatch(draft, { id: "older", now: new Date(2026, 9, 19, 8) });
    const newer = buildSavedMatch(draft, { id: "newer", now });
    assert.ok(older && newer);
    assert.equal(buildSavedMatch(initialPadelDraft(), { id: "nope", now }), null);
    assert.equal(buildSavedMatch({ ...draft, sets: [draft.sets[0]!] }, { id: "partial", now }), null);

    const store = memory();
    assert.deepEqual(readPadelMatches(store), []);
    assert.ok(savePadelMatch(store, older!));
    const saved = savePadelMatch(store, newer!);
    assert.deepEqual(
      saved?.map((match) => match.id),
      ["newer", "older"],
    );
    assert.equal(store.getItem(PADEL_MOCK_MATCHES_KEY)?.includes("Harbour Padel"), true);
    assert.deepEqual(
      readPadelMatches(store).map((match) => match.id),
      ["newer", "older"],
    );

    const cards = recentCardsForHome(true, readPadelMatches(store));
    assert.equal(cards[0]?.demo, true);
    assert.equal(cards[0]?.id, "newer");
    assert.match(cards[0]?.teams ?? "", /You & Alex Nkosi vs Sam Pillay & Riley Botha/);
    assert.equal(cards[0]?.score, "6-4, 3-6, 7-6 (7-5)");
    assert.match(cards[0]?.detail ?? "", /Team A won · Harbour Padel · 20 Oct 2026/);
    assert.equal(recentCardsForHome(false, readPadelMatches(store)).length, 0);

    const withMatches = home(cards);
    assert.ok(withMatches.indexOf("20 Oct 2026") < withMatches.indexOf("19 Oct 2026"));
    assert.match(withMatches, /class="demo-tag">Demo</);
    assert.match(withMatches, /6-4, 3-6, 7-6 \(7-5\)/);
    assert.doesNotMatch(withMatches, /No matches yet/);

    const hidden = home(recentCardsForHome(false, readPadelMatches(store)));
    assert.match(hidden, new RegExp(PADEL_HOME_COPY.recentEmpty.replace(/[.]/g, "\\.")));
    assert.doesNotMatch(hidden, /demo-tag|Harbour Padel|6-4, 3-6/);

    store.setItem(PADEL_MOCK_MATCHES_KEY, "{");
    assert.deepEqual(readPadelMatches(store), []);
    store.setItem(PADEL_MOCK_MATCHES_KEY, JSON.stringify([{ id: "bad" }, newer]));
    assert.deepEqual(
      readPadelMatches(store).map((match) => match.id),
      ["newer"],
    );
    assert.equal(
      savePadelMatch(
        {
          getItem: () => "[]",
          setItem() {
            throw new Error("full");
          },
        },
        newer!,
      ),
      null,
    );
    assert.equal(readPadelMatches(null).length, 0);
    assert.doesNotMatch(hidden, /<a /);
  });

  it("keeps the session flag untouched and wires the gate without a request", () => {
    const shell = readFileSync(new URL("../../../components/play/PadelHome.tsx", import.meta.url), "utf8");
    const flow = readFileSync(
      new URL("../../../components/play/PadelRecordFlow.tsx", import.meta.url),
      "utf8",
    );
    const mode = readFileSync(new URL("../mode.ts", import.meta.url), "utf8");
    assert.match(shell, /padelRecordDecision/);
    assert.match(shell, /readPadelMockEnabled/);
    assert.match(shell, /savePadelMatch/);
    assert.match(shell, /reducePadelNotice/);
    assert.match(flow, /PADEL_MOCK_SHARE_TOAST/);
    assert.match(mode, /export const PLAY_MODE_SESSION_LIVE = false/);
    assert.doesNotMatch(shell + flow, /fetch\(|XMLHttpRequest|navigator\.share|router\.push/);
  });
});
