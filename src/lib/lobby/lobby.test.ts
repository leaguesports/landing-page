import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyLobbyFilters,
  buildLobbyListQuery,
  buildLobbyWhatsAppShare,
  conversionBlockedCtas,
  defaultSlotsNeeded,
  filterLobbySnapshot,
  formatLookingTtl,
  hubLobbyHref,
  hubLobbyProposalHref,
  isLobbyGaEvent,
  isLobbySourceNote,
  listLobbyWith,
  lobbyEmptyCopy,
  lobbyGameStartParams,
  lobbyInboxHref,
  lobbyOrganiseHandoffHref,
  LOBBY_GA_EVENTS,
  LOBBY_HREF,
  LOBBY_PROXY_SOURCES,
  needNMoreCopy,
  parseLobbyListSnapshot,
  parseOwnOpenGame,
  parseProposal,
  slotsNeededRange,
} from "./lobby.ts";

const WINDOW = {
  windowStart: "2026-12-01T16:00:00.000Z",
  windowEnd: "2026-12-01T18:00:00.000Z",
};

const LOOKING = {
  id: "look-1",
  firstName: "Alex",
  sport: "golf",
  ...WINDOW,
  city: "Cape Town",
  area: "Sea Point",
};

const OPEN = {
  id: "open-1",
  firstName: "Blake",
  sport: "padel",
  ...WINDOW,
  city: "Cape Town",
  area: null,
  slotsNeeded: 4,
  slotsFilled: 1,
  slotsRemaining: 3,
};

describe("lobby list filters", () => {
  it("builds sport and city query strings and omits blanks", () => {
    assert.equal(buildLobbyListQuery({}), "");
    assert.equal(buildLobbyListQuery({ sport: "padel" }), "?sport=padel");
    assert.equal(
      buildLobbyListQuery({ sport: "golf", city: "Cape Town" }),
      "?sport=golf&city=Cape+Town",
    );
    assert.equal(buildLobbyListQuery({ sport: "rugby", city: "  " }), "");
  });

  it("filters lookings and open games by sport and city", () => {
    const snapshot = parseLobbyListSnapshot({
      lookings: [LOOKING, { ...LOOKING, id: "look-2", sport: "darts", city: "Durban" }],
      openGames: [OPEN, { ...OPEN, id: "open-2", sport: "golf", city: "Johannesburg" }],
      viewer: { looking: null },
    });
    const padel = filterLobbySnapshot(snapshot, { sport: "padel" });
    assert.equal(padel.lookings.length, 0);
    assert.deepEqual(
      padel.openGames.map((row) => row.id),
      ["open-1"],
    );
    const cape = applyLobbyFilters(snapshot.lookings, { city: "cape town" });
    assert.deepEqual(
      cape.map((row) => row.id),
      ["look-1"],
    );
  });
});

describe("looking TTL display", () => {
  it("shows ON plus remaining hours, minutes, and expired", () => {
    const now = new Date("2026-12-01T12:00:00.000Z");
    const hours = formatLookingTtl("2026-12-01T15:00:00.000Z", now);
    assert.equal(hours.on, true);
    assert.equal(hours.expired, false);
    assert.equal(hours.label, "Expires in 3 hours");
    assert.equal(hours.statusLabel, "Looking ON · expires in 3 hours");

    const minutes = formatLookingTtl("2026-12-01T12:12:00.000Z", now);
    assert.equal(minutes.label, "Expires in 12 min");

    const expired = formatLookingTtl("2026-12-01T11:00:00.000Z", now);
    assert.equal(expired.on, false);
    assert.equal(expired.expired, true);
    assert.equal(expired.label, "Expired");
    assert.equal(expired.statusLabel, "Looking expired");
  });
});

describe("conversionBlocked CTAs", () => {
  it("never invents a venue and offers invite or pick-venue", () => {
    const venue = conversionBlockedCtas("venue_required", {
      sport: "padel",
      city: "Cape Town",
    });
    assert.equal(venue.reason, "venue_required");
    assert.match(venue.body, /won’t invent/i);
    assert.equal(venue.primaryLabel, "Invite friends");
    assert.equal(venue.secondaryLabel, "Pick a venue");
    assert.equal(venue.secondaryHref, "/venues?sport=padel&city=Cape%20Town");
    assert.ok(!/invented|placeholder venue/i.test(venue.body));

    const missing = conversionBlockedCtas("venue_not_found", { sport: "golf" });
    assert.equal(missing.secondaryLabel, "Pick a venue");
    assert.match(missing.body, /won’t invent/i);

    const darts = conversionBlockedCtas("unsupported_sport", { sport: "darts" });
    assert.equal(darts.reason, "unsupported_sport");
    assert.match(darts.body, /darts/i);
    assert.equal(darts.primaryLabel, "Invite friends");
    assert.equal(darts.secondaryLabel, "Find a venue");
  });
});

describe("lobby proxy path order", () => {
  it("lists looking, open-games, and proposals before any :id catch-all", () => {
    const sources = [...LOBBY_PROXY_SOURCES];
    assert.equal(sources[0], "/api/lobby");
    const looking = sources.indexOf("/api/lobby/looking");
    const open = sources.indexOf("/api/lobby/open-games");
    const proposals = sources.indexOf("/api/lobby/proposals");
    const join = sources.indexOf("/api/lobby/open-games/:id/join");
    const kick = sources.indexOf("/api/lobby/open-games/:id/kick");
    const accept = sources.indexOf("/api/lobby/proposals/:id/accept");
    const pass = sources.indexOf("/api/lobby/proposals/:id/pass");
    assert.ok(looking >= 0 && looking < join);
    assert.ok(open >= 0 && open < join);
    assert.ok(open < kick);
    assert.ok(proposals >= 0 && proposals < accept);
    assert.ok(proposals < pass);
    assert.deepEqual(sources, [
      "/api/lobby",
      "/api/lobby/looking",
      "/api/lobby/open-games",
      "/api/lobby/open-games/:id/join",
      "/api/lobby/open-games/:id/kick",
      "/api/lobby/proposals",
      "/api/lobby/proposals/:id/accept",
      "/api/lobby/proposals/:id/pass",
    ]);
  });
});

describe("lobby GA event names", () => {
  it("exports the required funnel events", () => {
    assert.deepEqual([...LOBBY_GA_EVENTS], [
      "lobby_looking_on",
      "lobby_post_open",
      "lobby_join",
      "lobby_propose_shown",
      "lobby_propose_accept",
    ]);
    for (const event of LOBBY_GA_EVENTS) {
      assert.equal(isLobbyGaEvent(event), true);
    }
    assert.equal(isLobbyGaEvent("game_start"), false);
    assert.deepEqual(lobbyGameStartParams("padel"), {
      page_type: "organise",
      sport: "padel",
      source: "lobby",
    });
  });
});

describe("organise handoff href from organiseGameId", () => {
  it("navigates to organised detail and stays null when blocked", () => {
    assert.equal(
      lobbyOrganiseHandoffHref("game-1"),
      "/play/organised/game-1",
    );
    assert.equal(lobbyOrganiseHandoffHref("  game-2  "), "/play/organised/game-2");
    assert.equal(lobbyOrganiseHandoffHref(null), null);
    assert.equal(lobbyOrganiseHandoffHref(""), null);
    assert.equal(lobbyOrganiseHandoffHref("   "), null);

    const filled = parseOwnOpenGame({
      ...OPEN,
      status: "filled",
      venueCmsId: null,
      skill: null,
      organiseGameId: "org-9",
      source: "lobby",
      conversionBlocked: null,
    });
    assert.equal(lobbyOrganiseHandoffHref(filled?.organiseGameId), "/play/organised/org-9");

    const blocked = parseOwnOpenGame({
      ...OPEN,
      status: "filled",
      venueCmsId: null,
      skill: null,
      organiseGameId: null,
      source: "lobby",
      conversionBlocked: "venue_required",
    });
    assert.equal(lobbyOrganiseHandoffHref(blocked?.organiseGameId), null);
    assert.equal(blocked?.conversionBlocked, "venue_required");
  });
});

describe("lobby copy helpers", () => {
  it("formats need-N-more, empty, share, and source notes", () => {
    assert.equal(needNMoreCopy(3), "Need 3 more");
    assert.equal(needNMoreCopy(1), "Need 1 more");
    assert.equal(needNMoreCopy(0), "Game is full");
    assert.equal(lobbyEmptyCopy({ sport: "padel", city: "Cape Town" }).title, "Be first for padel in Cape Town");
    const share = buildLobbyWhatsAppShare({
      kind: "need_more",
      sport: "padel",
      city: "Cape Town",
      slotsRemaining: 2,
      origin: "https://leaguesports.co.za",
    });
    assert.match(share.text, /Need 2 more/);
    assert.match(share.href, /^https:\/\/wa\.me\/\?text=/);
    assert.equal(isLobbySourceNote("source=lobby openGame=abc"), true);
    assert.equal(isLobbySourceNote("Bring balls"), false);
    assert.equal(hubLobbyHref(), LOBBY_HREF);
    assert.equal(
      hubLobbyProposalHref("p1"),
      "/lobby?proposal=p1",
    );
    assert.equal(
      lobbyInboxHref({ proposalId: "p1", sport: "padel" }),
      "/lobby?proposal=p1",
    );
    assert.equal(
      lobbyInboxHref({ organiseGameId: "org-1" }),
      "/play/organised/org-1",
    );
    assert.equal(defaultSlotsNeeded("padel"), 4);
    assert.equal(defaultSlotsNeeded("darts"), 2);
    assert.deepEqual(slotsNeededRange("golf"), { min: 2, max: 4, defaultValue: 4 });
  });

  it("parses a proposal with conversion fields", () => {
    const proposal = parseProposal({
      id: "prop-1",
      sport: "padel",
      city: "Cape Town",
      area: null,
      ...WINDOW,
      status: "accepted",
      organiseGameId: "org-1",
      source: "lobby",
      conversionBlocked: null,
      members: [
        { firstName: "Alex", partySize: 2, response: "accept", isYou: true },
        { firstName: "Blake", partySize: 2, response: "accept", isYou: false },
      ],
    });
    assert.equal(proposal?.organiseGameId, "org-1");
    assert.equal(lobbyOrganiseHandoffHref(proposal?.organiseGameId), "/play/organised/org-1");
    assert.equal(proposal?.members[0]?.isYou, true);
  });
});

describe("lobby list client", () => {
  it("GETs /api/lobby with sport and city", async () => {
    const calls: string[] = [];
    const result = await listLobbyWith(
      { sport: "padel", city: "Cape Town" },
      {
        baseUrl: "https://api.example.test",
        fetch: async (input) => {
          calls.push(String(input));
          return new Response(
            JSON.stringify({
              lookings: [LOOKING],
              openGames: [OPEN],
              viewer: { looking: null },
            }),
            { status: 200 },
          );
        },
      },
    );
    assert.equal(result.ok, true);
    assert.equal(
      calls[0],
      "https://api.example.test/api/lobby?sport=padel&city=Cape+Town",
    );
    if (result.ok) {
      assert.equal(result.value.openGames[0]?.slotsRemaining, 3);
    }
  });
});
