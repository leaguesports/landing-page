import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelMatchVenue, PadelPairing } from "../../types/padel-match.ts";
import {
  buildPadelWhatsAppShare,
  padelMatchAbsoluteUrl,
  padelShareText,
  padelWhatsAppHref,
} from "./whatsapp-share.ts";

const pairings: PadelPairing = {
  teamA: [
    { id: "a1", displayName: "Alex Rivera", isGuest: false, userId: "a1" },
    { id: "a2", displayName: "Sam (Guest)", isGuest: true, userId: null },
  ],
  teamB: [
    { id: "b1", displayName: "Jordan Lee", isGuest: false, userId: "b1" },
    { id: "b2", displayName: "Riley (Guest)", isGuest: true, userId: null },
  ],
};

const venue: PadelMatchVenue = {
  id: "cms-padel-lab",
  slug: "padel-lab-rivonia",
  name: "Padel Lab Rivonia",
};

describe("padelShareText", () => {
  it("includes venue, first-name teams, and the absolute match URL", () => {
    assert.equal(
      padelShareText({
        matchId: "api-match-1",
        teamALabel: "Alex & Sam",
        teamBLabel: "Jordan & Riley",
        venueName: "Padel Lab Rivonia",
        origin: "https://leaguesports.co.za",
      }),
      [
        "Live padel at Padel Lab Rivonia",
        "Alex & Sam vs Jordan & Riley",
        "https://leaguesports.co.za/padel/api-match-1",
      ].join("\n"),
    );
  });

  it("omits the court line when venue is missing", () => {
    assert.equal(
      padelShareText({
        matchId: "api-match-1",
        teamALabel: "Alex & Sam",
        teamBLabel: "Jordan & Riley",
        venueName: null,
        origin: "https://leaguesports.co.za",
      }),
      "Alex & Sam vs Jordan & Riley\nhttps://leaguesports.co.za/padel/api-match-1",
    );
  });

  it("omits the court line when venue is blank", () => {
    assert.equal(
      padelShareText({
        matchId: "m",
        teamALabel: "A",
        teamBLabel: "B",
        venueName: "   ",
        origin: "https://leaguesports.co.za",
      }),
      "A vs B\nhttps://leaguesports.co.za/padel/m",
    );
  });

  it("uses team labels as-is and does not rewrite join delimiters", () => {
    assert.equal(
      padelShareText({
        matchId: "m",
        teamALabel: "Alex / Sam",
        teamBLabel: "Jordan / Riley",
        venueName: null,
        origin: "https://leaguesports.co.za",
      }),
      "Alex / Sam vs Jordan / Riley\nhttps://leaguesports.co.za/padel/m",
    );
  });
});

describe("padelMatchAbsoluteUrl", () => {
  it("strips a trailing slash on origin", () => {
    assert.equal(
      padelMatchAbsoluteUrl("abc", "https://leaguesports.co.za/"),
      "https://leaguesports.co.za/padel/abc",
    );
  });

  it("uses the current origin when provided (preview / localhost)", () => {
    assert.equal(
      padelMatchAbsoluteUrl("abc", "http://localhost:3000"),
      "http://localhost:3000/padel/abc",
    );
  });

  it("encodes reserved characters in the matchId path segment", () => {
    const matchId = "id with spaces&foo?bar#baz/José";
    const url = new URL(
      padelMatchAbsoluteUrl(matchId, "https://leaguesports.co.za"),
    );
    assert.equal(url.search, "");
    assert.equal(url.hash, "");
    assert.equal(url.pathname, `/padel/${encodeURIComponent(matchId)}`);
    assert.equal(decodeURIComponent(url.pathname), `/padel/${matchId}`);
  });
});

describe("buildPadelWhatsAppShare", () => {
  it("builds wa.me text from getTeamLabel pairings and venue", () => {
    const share = buildPadelWhatsAppShare(
      { id: "api-match-1", pairings, venue },
      "https://leaguesports.co.za",
    );

    assert.equal(
      share.text,
      [
        "Live padel at Padel Lab Rivonia",
        "Alex & Sam vs Jordan & Riley",
        "https://leaguesports.co.za/padel/api-match-1",
      ].join("\n"),
    );
    assert.equal(
      share.matchUrl,
      "https://leaguesports.co.za/padel/api-match-1",
    );
    const url = new URL(share.href);
    assert.equal(url.origin + url.pathname, "https://wa.me/");
    assert.equal(url.searchParams.get("text"), share.text);
    assert.match(url.pathname, /^\/$/);
  });

  it("does not mint a new id — share path is the API match id", () => {
    const share = buildPadelWhatsAppShare(
      { id: "match_01HZX", pairings, venue: null },
      "https://leaguesports.co.za",
    );
    assert.match(share.matchUrl, /\/padel\/match_01HZX$/);
    assert.equal(share.text.includes("match_01HZX"), true);
  });

  it("URL-encodes newlines and spaces for wa.me", () => {
    const text = padelShareText({
      matchId: "id",
      teamALabel: "Alex & Sam",
      teamBLabel: "Jordan & Riley",
      venueName: "Padel Lab Rivonia",
      origin: "https://leaguesports.co.za",
    });
    const href = padelWhatsAppHref(text);
    assert.equal(href.includes("\n"), false);
    assert.equal(href.includes(" "), false);
    assert.ok(href.includes("%0A"));
    assert.ok(href.includes("%20"));
  });

  it("joins first names with & without depending on getTeamLabel's default delimiter", () => {
    const share = buildPadelWhatsAppShare(
      { id: "api-match-1", pairings, venue: null },
      "https://leaguesports.co.za",
    );
    assert.equal(
      share.text.startsWith("Alex & Sam vs Jordan & Riley\n"),
      true,
    );
    assert.equal(share.text.includes(" / "), false);
  });

  it("round-trips adversarial names and ids through the wa.me text param", () => {
    const adversarialPairings: PadelPairing = {
      teamA: [
        {
          id: "a1",
          displayName: 'Alex & "Sam"',
          isGuest: false,
          userId: "a1",
        },
        {
          id: "a2",
          displayName: "José <Guest>",
          isGuest: true,
          userId: null,
        },
      ],
      teamB: [
        {
          id: "b1",
          displayName: "Jordan? Lee#",
          isGuest: false,
          userId: "b1",
        },
        {
          id: "b2",
          displayName: "Riley / Extra",
          isGuest: true,
          userId: null,
        },
      ],
    };
    const matchId = "id with spaces&foo?bar#baz";
    const share = buildPadelWhatsAppShare(
      {
        id: matchId,
        pairings: adversarialPairings,
        venue: {
          id: "v",
          slug: "padel-co",
          name: 'Padel & Co <script> "quotes"',
        },
      },
      "https://leaguesports.co.za",
    );

    assert.equal(
      share.text,
      [
        'Live padel at Padel & Co <script> "quotes"',
        'Alex & José vs Jordan? & Riley',
        `https://leaguesports.co.za/padel/${encodeURIComponent(matchId)}`,
      ].join("\n"),
    );

    const href = share.href;
    const encodedText = href.slice(href.indexOf("text=") + "text=".length);
    assert.equal(encodedText.includes("&"), false);
    assert.equal(encodedText.includes("<"), false);
    assert.equal(encodedText.includes(" "), false);
    assert.equal(encodedText.includes("\n"), false);

    const url = new URL(href);
    assert.equal(url.searchParams.get("text"), share.text);
    assert.equal(url.searchParams.get("foo"), null);
  });
});
