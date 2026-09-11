import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OrganisedGamesSnapshot } from "../organised-games/organised-games.ts";
import { HUB_GUIDES_HREF, HUB_QUICK_START_HREF } from "../sports/hub-ia.ts";
import {
  filterOrganisedGamesForSport,
  pickPlayDashboardClubs,
  playDashboardClubsExploreHref,
  playDashboardGuides,
  playDashboardMoreActions,
  playDashboardPlaceChips,
  playDashboardPlayActions,
  playDashboardReminder,
  playDashboardShortcuts,
  toPlayDashboardClub,
  type PlayClubSource,
} from "./play-dashboard.ts";

function venue(
  partial: Partial<PlayClubSource> & Pick<PlayClubSource, "_id" | "name" | "slug">,
): PlayClubSource {
  return {
    address: {
      suburb: "Sandton",
      city: "Johannesburg",
    },
    ...partial,
  };
}

function game(
  id: string,
  sport: "padel" | "golf",
  startsAt: string,
): OrganisedGamesSnapshot["hosted"][number] {
  return {
    id,
    sport,
    status: "open",
    venueCmsId: "venue-1",
    startsAt,
    notes: null,
    capacity: 4,
    host: {
      id: "host",
      displayName: "Host",
      handle: "host",
      avatarUrl: null,
    },
    invitees: [],
    inviteToken: null,
    viewer: { role: "host", rsvp: null },
    live: null,
    createdAt: startsAt,
    updatedAt: startsAt,
  };
}

describe("play sport dashboard (#playtomic home)", () => {
  it("maps Playtomic-style shortcuts without looping Book back onto the dashboard", () => {
    const padel = playDashboardShortcuts({ slug: "padel", noun: "court" });
    assert.deepEqual(
      padel.map((item) => [item.id, item.title, item.href]),
      [
        ["book", "Book a court", "/venues?sport=padel"],
        ["learn", "Learn", HUB_GUIDES_HREF],
        ["compete", "Compete", "/tournaments"],
        ["match", "Find a match", "/lobby?sport=padel"],
      ],
    );
    assert.equal(playDashboardClubsExploreHref("padel"), "/venues?sport=padel");
    assert.equal(playDashboardClubsExploreHref("golf"), "/venues?sport=golf");
    assert.notEqual(playDashboardClubsExploreHref("padel"), "/play/padel");

    const golf = playDashboardShortcuts({ slug: "golf", noun: "course" });
    assert.equal(golf[0]?.title, "Book a course");
    assert.equal(golf[3]?.href, "/lobby?sport=golf");

    const darts = playDashboardShortcuts({ slug: "darts", noun: "board" });
    assert.equal(darts[0]?.title, "Book a board");
    assert.equal(darts[0]?.href, "/venues?sport=darts");
  });

  it("prefers photographed, higher-rated clubs and caps the strip", () => {
    const clubs = pickPlayDashboardClubs(
      [
        venue({ _id: "1", name: "Zebra Range", slug: "zebra", rating: 4.9 }),
        venue({
          _id: "2",
          name: "Alpha Club",
          slug: "alpha",
          rating: 4.2,
          hero_image: { _type: "image", asset: { _ref: "img-1" } },
        }),
        venue({
          _id: "3",
          name: "Beta Club",
          slug: "beta",
          rating: 4.8,
          hero_image: { _type: "image", asset: { _ref: "img-2" } },
        }),
      ],
      2,
    );
    assert.deepEqual(
      clubs.map((club) => club.slug),
      ["beta", "alpha"],
    );
    const featured = toPlayDashboardClub(clubs[0]!, "/clubs/beta.jpg");
    assert.equal(featured.href, "/venues/beta");
    assert.match(featured.place, /Sandton/);
    assert.equal(featured.imageSrc, "/clubs/beta.jpg");
  });

  it("scopes organised games and reminds about the soonest one", () => {
    const snapshot: OrganisedGamesSnapshot = {
      hosted: [
        game("golf-later", "golf", "2026-09-20T10:00:00.000Z"),
        game("padel-soon", "padel", "2026-09-12T16:00:00.000Z"),
      ],
      invited: [game("padel-later", "padel", "2026-09-18T16:00:00.000Z")],
    };
    const padel = filterOrganisedGamesForSport(snapshot, "padel");
    assert.deepEqual(
      [...padel.hosted, ...padel.invited].map((item) => item.id),
      ["padel-soon", "padel-later"],
    );
    const reminder = playDashboardReminder(
      padel,
      { name: "Padel", noun: "court" },
      "2026-09-11T12:00:00.000Z",
    );
    assert.equal(reminder.title, "Don't forget");
    assert.equal(reminder.href, "/play/organised/padel-soon");
    assert.match(reminder.description, /padel/i);

    const empty = playDashboardReminder(
      { hosted: [], invited: [] },
      { name: "Darts", noun: "board" },
      "2026-09-11T12:00:00.000Z",
    );
    assert.equal(empty.href, HUB_QUICK_START_HREF);
  });

  it("lists city chips as /play/{sport}/{city} landings", () => {
    const chips = playDashboardPlaceChips("golf");
    assert.ok(chips.some((chip) => chip.href === "/play/golf/johannesburg"));
    assert.ok(chips.some((chip) => chip.href === "/play/golf/cape-town"));
    assert.equal(playDashboardPlaceChips(" ").length, 0);
  });

  it("keeps Start/Capture/Organise as play tools and tournaments out of that row", () => {
    const padelPlay = playDashboardPlayActions("padel").map((action) => action.id);
    const padelMore = playDashboardMoreActions("padel").map((action) => action.id);
    assert.deepEqual(padelPlay, ["start", "capture", "organise"]);
    assert.deepEqual(padelMore, ["team-matches"]);
    assert.equal(padelMore.includes("lobby"), false);
    assert.equal(padelMore.includes("tournaments"), false);

    const dartsPlay = playDashboardPlayActions("darts").map((action) => action.id);
    assert.deepEqual(dartsPlay, ["start", "capture"]);

    const golfMore = playDashboardMoreActions("golf").map((action) => action.id);
    assert.ok(golfMore.includes("golf-tours"));
    assert.equal(golfMore.includes("handicap"), false);
  });

  it("filters learn cards to the active sport", () => {
    const guides = playDashboardGuides(
      [
        { slug: "best-padel-courts-joburg", title: "Best padel courts in Joburg", description: "Courts" },
        { slug: "golf-weekend", title: "Golf weekend", description: "Courses" },
        { slug: "watch-soccer", title: "Where to watch soccer", description: "Bars" },
      ],
      "padel",
    );
    assert.deepEqual(
      guides.map((guide) => guide.href),
      ["/guides/best-padel-courts-joburg"],
    );
  });
});
