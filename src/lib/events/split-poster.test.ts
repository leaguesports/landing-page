import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fixtureSeoTitle } from "./meta.ts";
import {
  SPLIT_POSTER_NEUTRAL,
  SPLIT_POSTER_NEUTRAL_ALT,
  buildSplitPoster,
  fixtureCalendarUrl,
  grandPrixPosterLines,
  posterDisplayName,
  posterInk,
  resolveNationStripes,
  resolveTeamPosterColour,
} from "./split-poster.ts";

const SOWETO_H1 = "Pirates vs Chiefs 2026 - Where to Watch the Soweto Derby";
const MEXICO_H1 = "Mexico City Grand Prix 2026 - Where to Watch in South Africa";

const DERBY_KICKOFF = "2026-10-31T13:30:00.000Z";
const MEXICO_LIGHTS = "2026-11-01T20:00:00.000Z";

describe("resolveTeamPosterColour", () => {
  it("uses a valid CMS hex ahead of the curated kit", () => {
    const resolved = resolveTeamPosterColour({
      name: "Kaizer Chiefs",
      primaryColour: "#112233",
    });
    assert.equal(resolved.fill, "#112233");
    assert.equal(resolved.source, "cms");
  });

  it("accepts a short CMS hex and a leading hash", () => {
    assert.equal(
      resolveTeamPosterColour({ name: "Kaizer Chiefs", primaryColour: "abc" }).fill,
      "#aabbcc",
    );
    assert.equal(
      resolveTeamPosterColour({ name: "Orlando Pirates", primaryColour: "FDB913" }).source,
      "cms",
    );
  });

  it("falls back to the curated Watch kit when CMS colour is blank", () => {
    const chiefs = resolveTeamPosterColour({ name: "Kaizer Chiefs" });
    assert.equal(chiefs.fill, "#ffd200");
    assert.equal(chiefs.source, "curated");

    const pirates = resolveTeamPosterColour({
      name: "Orlando Pirates FC",
      primaryColour: "  ",
    });
    assert.equal(pirates.fill, "#000000");
    assert.equal(pirates.source, "curated");
  });

  it("does not treat a non-hex CMS colour as the curated kit", () => {
    const resolved = resolveTeamPosterColour({
      name: "Kaizer Chiefs",
      primaryColour: "gold",
    });
    assert.equal(resolved.fill, SPLIT_POSTER_NEUTRAL);
    assert.equal(resolved.source, "neutral");
  });

  it("uses neutral slate for an unknown team", () => {
    const resolved = resolveTeamPosterColour({ name: "Unknown Athletic" });
    assert.equal(resolved.fill, SPLIT_POSTER_NEUTRAL);
    assert.equal(resolved.source, "neutral");
  });
});

describe("resolveNationStripes", () => {
  it("paints Mexico in the locked green, cream, and red bands", () => {
    const fromCode = resolveNationStripes({ countryCode: "MEX" });
    assert.equal(fromCode.source, "curated");
    assert.deepEqual(fromCode.stripes, ["#0B6B47", "#F3EFE6", "#C8213A"]);

    const fromName = resolveNationStripes({ countryName: "Mexico" });
    assert.equal(fromName.key, "mex");
    assert.deepEqual(fromName.stripes, fromCode.stripes);
  });

  it("infers a host nation from the GP title when no country was supplied", () => {
    const stripes = resolveNationStripes({ hint: "Mexico City Grand Prix" });
    assert.equal(stripes.key, "mex");
    assert.equal(stripes.source, "curated");
  });

  it("uses a neutral band for an unknown nation and does not guess from the title", () => {
    const unknown = resolveNationStripes({
      countryCode: "ZZ",
      countryName: "Nowhere",
      hint: "Mexico City Grand Prix",
    });
    assert.equal(unknown.source, "neutral");
    assert.deepEqual(unknown.stripes, [SPLIT_POSTER_NEUTRAL]);

    const blank = resolveNationStripes({ hint: "Invitation race" });
    assert.equal(blank.source, "neutral");
    assert.equal(blank.key, "neutral");
  });
});

describe("posterInk", () => {
  it("puts dark ink on gold and white ink on black or slate", () => {
    assert.equal(posterInk("#ffd200"), "#0B0B0B");
    assert.equal(posterInk("#FDB913"), "#0B0B0B");
    assert.equal(posterInk("#000000"), "#ffffff");
    assert.equal(posterInk(SPLIT_POSTER_NEUTRAL), "#ffffff");
  });
});

describe("buildSplitPoster", () => {
  it("keeps home on the left for Orlando Pirates vs Kaizer Chiefs", () => {
    const poster = buildSplitPoster({
      title: "Orlando Pirates vs Kaizer Chiefs",
      sportSlug: "soccer",
      sportName: "Soccer",
      competition: "Betway Premiership",
      startsAt: DERBY_KICKOFF,
      teams: [{ name: "Orlando Pirates" }, { name: "Kaizer Chiefs" }],
    });
    assert.equal(poster.kind, "match");
    if (poster.kind !== "match") return;
    assert.equal(poster.home.name, "Orlando Pirates");
    assert.equal(poster.away.name, "Kaizer Chiefs");
    assert.equal(poster.headlineHome, "Pirates");
    assert.equal(poster.headlineAway, "Chiefs");
    assert.equal(poster.home.fill, "#000000");
    assert.equal(poster.home.texture, "pinstripe");
    assert.equal(poster.home.ink, "#ffffff");
    assert.equal(poster.home.epithet, "Black & white");
    assert.equal(poster.away.fill, "#ffd200");
    assert.equal(poster.away.source, "curated");
    assert.equal(poster.away.ink, "#0B0B0B");
    assert.equal(poster.away.texture, "halftone");
    assert.equal(poster.away.epithet, "Gold & black");
    assert.equal(poster.cornerTitle, "The Soweto derby");
    assert.equal(poster.eyebrow, "Watch Soccer · The Soweto derby");
    assert.equal(poster.metaDate, "Sat 31 Oct 2026");
    assert.equal(poster.metaClock, "Kick-off 15:30");
    assert.equal(poster.dateLine, "SAT 31 OCT 2026 · KICK-OFF 15:30");
    assert.equal(poster.breadcrumb, "Pirates vs Chiefs");
  });

  it("keeps CMS colours and says kick-off is TBC when there is no start", () => {
    const poster = buildSplitPoster({
      title: "Unused",
      sportName: "Soccer",
      teams: [
        { name: "Kaizer Chiefs", primaryColour: "#111111" },
        { name: "Mamelodi Sundowns", primaryColour: "#00aa00" },
      ],
    });
    assert.equal(poster.kind, "match");
    if (poster.kind !== "match") return;
    assert.equal(poster.home.name, "Kaizer Chiefs");
    assert.equal(poster.home.fill, "#111111");
    assert.equal(poster.home.source, "cms");
    assert.equal(poster.away.name, "Mamelodi Sundowns");
    assert.equal(poster.away.fill, "#00aa00");
    assert.equal(poster.away.texture, "solid");
    assert.equal(poster.metaClock, "Kick-off TBC");
    assert.equal(poster.dateLine, "KICK-OFF TBC");
    assert.equal(poster.cornerTitle, null);
  });

  it("splits two unknown teams onto distinct neutral fields", () => {
    const poster = buildSplitPoster({
      title: "Blue Rovers vs Red Athletic",
      sportName: "Rugby",
    });
    assert.equal(poster.kind, "match");
    if (poster.kind !== "match") return;
    assert.equal(poster.home.source, "neutral");
    assert.equal(poster.away.source, "neutral");
    assert.equal(poster.home.fill, SPLIT_POSTER_NEUTRAL);
    assert.equal(poster.away.fill, SPLIT_POSTER_NEUTRAL_ALT);
    assert.notEqual(poster.home.fill, poster.away.fill);
    assert.equal(poster.home.ink, "#ffffff");
    assert.equal(poster.away.ink, "#ffffff");
  });

  it("builds the Mexico City GP sash from the title when the nation is not on the fixture", () => {
    const poster = buildSplitPoster({
      title: "Mexico City Grand Prix",
      sportSlug: "motorsport",
      sportName: "Motorsport",
      series: "f1",
      startsAt: MEXICO_LIGHTS,
      weekendStart: "2026-10-30T18:00:00.000Z",
      weekendEnd: "2026-11-01T20:00:00.000Z",
    });
    assert.equal(poster.kind, "race");
    if (poster.kind !== "race") return;
    assert.equal(poster.headline, "MEXICO CITY GP");
    assert.equal(poster.breadcrumb, "Mexico City GP");
    assert.equal(poster.lead, "MEXICO");
    assert.equal(poster.rest, "CITY");
    assert.equal(poster.stripeSource, "curated");
    assert.deepEqual(poster.stripes, ["#0B6B47", "#F3EFE6", "#C8213A"]);
    assert.equal(poster.eyebrow, "Watch Motorsport · Mexico City");
    assert.equal(poster.metaDate, "Sun 1 Nov 2026");
    assert.equal(poster.metaClock, "Lights out 22:00");
    assert.equal(poster.dateLine, "SUN 1 NOV 2026 · LIGHTS OUT 22:00");
    assert.equal(poster.weekendLine, "RACE WEEKEND · 30 OCT – 1 NOV");
    assert.equal(poster.numeral, "01.11");
  });

  it("keeps an explicit unknown nation on the neutral band", () => {
    const poster = buildSplitPoster({
      title: "Mexico City Grand Prix",
      sportSlug: "motorsport",
      countryCode: "ZZ",
      countryName: "Nowhere",
    });
    assert.equal(poster.kind, "race");
    if (poster.kind !== "race") return;
    assert.equal(poster.stripeSource, "neutral");
    assert.deepEqual(poster.stripes, [SPLIT_POSTER_NEUTRAL]);
    assert.equal(poster.metaClock, "Lights out TBC");
    assert.equal(poster.weekendLine, null);
  });

  it("labels the race day when the weekend range is missing", () => {
    const poster = buildSplitPoster({
      title: "Mexico City Grand Prix",
      sportSlug: "motorsport",
      startsAt: MEXICO_LIGHTS,
    });
    assert.equal(poster.kind, "race");
    if (poster.kind !== "race") return;
    assert.equal(poster.weekendLine, "RACE DAY · 1 NOV");
  });

  it("uses a single neutral field when the event is not a match or a race", () => {
    const poster = buildSplitPoster({
      title: "Club finals night",
      sportName: "Padel",
      competition: "Club night",
    });
    assert.equal(poster.kind, "title");
    if (poster.kind !== "title") return;
    assert.equal(poster.headline, "Club finals night");
    assert.equal(poster.fill, SPLIT_POSTER_NEUTRAL);
    assert.equal(poster.dateLine, null);
  });
});

describe("poster copy helpers", () => {
  it("shortens multi-word clubs and keeps a one-word name", () => {
    assert.equal(posterDisplayName("Kaizer Chiefs"), "Chiefs");
    assert.equal(posterDisplayName("Orlando Pirates"), "Pirates");
    assert.equal(posterDisplayName("Liverpool"), "Liverpool");
    assert.equal(posterDisplayName("Manchester City"), "Manchester City");
  });

  it("splits a grand prix name into a lead line and the rest", () => {
    assert.deepEqual(grandPrixPosterLines("Mexico City Grand Prix"), {
      lead: "MEXICO",
      rest: "CITY",
    });
    assert.deepEqual(grandPrixPosterLines("Monaco Grand Prix"), {
      lead: "MONACO",
      rest: "",
    });
  });
});

describe("fixtureCalendarUrl", () => {
  it("builds a Google Calendar template with a two-hour slot", () => {
    const href = fixtureCalendarUrl({
      title: "Orlando Pirates vs Kaizer Chiefs",
      startsAt: DERBY_KICKOFF,
      detailsUrl: "https://leaguesports.co.za/events/orlando-pirates-vs-kaizer-chiefs-2026-10-31",
    });
    const url = new URL(href);
    assert.equal(url.searchParams.get("action"), "TEMPLATE");
    assert.equal(url.searchParams.get("text"), "Orlando Pirates vs Kaizer Chiefs");
    assert.equal(url.searchParams.get("dates"), "20261031T133000Z/20261031T153000Z");
    assert.match(url.searchParams.get("details") ?? "", /orlando-pirates-vs-kaizer-chiefs/);
  });

  it("omits dates when kick-off is unknown", () => {
    const href = fixtureCalendarUrl({
      title: "Untitled",
      detailsUrl: "https://leaguesports.co.za/events/untitled",
    });
    assert.equal(new URL(href).searchParams.get("dates"), null);
  });
});

describe("event hero h1", () => {
  it("keeps the production where-to-watch phrase", () => {
    assert.equal(
      fixtureSeoTitle({
        title: "Orlando Pirates vs Kaizer Chiefs",
        seoTitle: SOWETO_H1,
        competition: "Betway Premiership",
        teams: [{ name: "Orlando Pirates" }, { name: "Kaizer Chiefs" }],
        startsAt: DERBY_KICKOFF,
      }),
      SOWETO_H1,
    );
    assert.equal(
      fixtureSeoTitle({
        title: "Mexico City Grand Prix",
        seoTitle: MEXICO_H1,
        competition: "Formula 1",
        startsAt: MEXICO_LIGHTS,
      }),
      MEXICO_H1,
    );
  });

  it("renders that phrase as the only h1 on the event page", () => {
    const hero = readFileSync(
      new URL("../../components/events/EventPosterHero.tsx", import.meta.url),
      "utf8",
    );
    const page = readFileSync(
      new URL("../../app/events/[slug]/page.tsx", import.meta.url),
      "utf8",
    );
    assert.equal(hero.match(/<h1\b/g)?.length, 1);
    assert.equal(page.match(/<h1\b/g)?.length ?? 0, 0);
    assert.match(hero, /<h1[^>]*>\s*\{heading\}\s*<\/h1>/);
    assert.doesNotMatch(hero, /<h1[^>]*>[\s\S]*headlineHome/);
    assert.match(page, /const heading = fixtureSeoTitle\(/);
    assert.match(page, /heading=\{heading\}/);
    assert.match(page, /seoTitle: fixture\.seoTitle/);
  });
});
