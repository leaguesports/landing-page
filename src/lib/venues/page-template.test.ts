import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GolfCourseCms } from "../../types/golf-round.ts";
import {
  classifyVenuePage,
  venueAddressLine,
  venueCourtFacility,
  venueCustomerAbout,
  venueDistinctPlaySports,
  venueGoodForLabels,
  venueHoursLine,
  venuePlayFactsLine,
  venuePlayPlace,
  venueShortDisplayName,
  venueStartMatchHref,
  venueWatchPlace,
  venueWatchScreensLine,
  type VenueTemplateInput,
} from "./page-template.ts";

function playableCourse(): GolfCourseCms {
  return {
    holesTotal: 18,
    holes: Array.from({ length: 18 }, (_, index) => ({
      number: index + 1,
      par: 4,
      strokeIndex: index + 1,
    })),
  };
}

const benchwarmers: VenueTemplateInput = {
  name: "Benchwarmers Sports Bar",
  slug: "benchwarmers-sports-bar",
  broadcasts: [
    { _id: "soccer", name: "Soccer", slug: "soccer" },
    { _id: "rugby", name: "Rugby", slug: "rugby" },
    { _id: "golf", name: "Golf", slug: "golf" },
  ],
  upcoming_screenings: [
    { title: "Orlando Pirates vs Kaizer Chiefs", startsAt: "2026-10-31T13:30:00.000Z" },
  ],
  sports: [],
  has_big_screens: true,
  has_live_audio: true,
  has_food_menu: true,
  has_outdoor_area: true,
  has_generator_backup: true,
  has_craft_drafts: true,
  has_parking: true,
};

const actionPadel: VenueTemplateInput = {
  name: "Action Padel Century City",
  slug: "action-padel-century-city",
  broadcasts: [],
  upcoming_screenings: [],
  sports: [{ name: "Padel", slug: "padel" }],
  has_food_menu: true,
  has_outdoor_area: true,
  has_parking: true,
  description:
    "Action Padel Century City — 2 outdoor courts at Fives Futbol, Century City. One of Cape Town’s oldest public padel venues. Book on Playtomic only; no confirmed public phone/website at publish.",
};

describe("classifyVenuePage", () => {
  it("uses the Watch template when a venue screens and does not host play", () => {
    assert.equal(classifyVenuePage(benchwarmers), "watch");
    assert.equal(
      classifyVenuePage({
        broadcasts: [],
        sports: [],
        upcoming_screenings: [
          { title: "Sharks vs Stormers", startsAt: "2026-10-03T15:00:00+02:00" },
        ],
      }),
      "watch",
    );
    assert.deepEqual(venueDistinctPlaySports(benchwarmers), []);
  });

  it("uses the Play template for exactly one play sport and no screens", () => {
    assert.equal(classifyVenuePage(actionPadel), "play");
    assert.deepEqual(
      venueDistinctPlaySports(actionPadel).map((sport) => sport.key),
      ["padel"],
    );
    assert.equal(
      classifyVenuePage({
        sports: [{ name: "Padel", slug: "paddle" }],
        broadcasts: [],
      }),
      "play",
    );
    assert.equal(
      classifyVenuePage({
        sports: [
          { name: "Darts", slug: "darts" },
          { name: "Autodarts", slug: "autodarts" },
        ],
        broadcasts: [],
      }),
      "play",
    );
    assert.equal(
      classifyVenuePage({
        sports: [{ name: "Karting", slug: "karting" }],
        broadcasts: [],
        upcoming_screenings: [],
      }),
      "play",
    );
    assert.equal(
      classifyVenuePage({
        sports: [{ name: "Indoor Golf", slug: "indoor-golf" }],
        broadcasts: [],
      }),
      "play",
    );
  });

  it("counts a playable golf course as the one play sport", () => {
    assert.equal(
      classifyVenuePage({
        sports: [],
        broadcasts: [],
        golfCourse: playableCourse(),
        slug: "glendower",
      }),
      "play",
    );
  });

  it("leaves multi-play venues on the current page", () => {
    const club: VenueTemplateInput = {
      name: "Multi Sport Club",
      slug: "multi-sport-club",
      broadcasts: [],
      upcoming_screenings: [],
      sports: [
        { name: "Padel", slug: "padel" },
        { name: "Golf", slug: "golf" },
      ],
      golfCourse: playableCourse(),
    };
    assert.equal(classifyVenuePage(club), "default");
    assert.deepEqual(
      venueDistinctPlaySports(club).map((sport) => sport.name),
      ["Padel", "Golf"],
    );
    assert.equal(
      classifyVenuePage({
        sports: [
          { name: "Climbing", slug: "climbing" },
          { name: "Karting", slug: "karting" },
        ],
        broadcasts: [],
      }),
      "default",
    );
    assert.equal(
      classifyVenuePage({
        sports: [
          { name: "Padel", slug: "padel" },
          { name: "Indoor Golf", slug: "indoor-golf" },
        ],
        broadcasts: [],
      }),
      "default",
    );
  });

  it("leaves hybrids that screen and host play on the current page", () => {
    assert.equal(
      classifyVenuePage({
        ...benchwarmers,
        sports: [{ name: "Darts", slug: "darts" }],
      }),
      "default",
    );
    assert.equal(
      classifyVenuePage({
        broadcasts: [],
        sports: [{ name: "Padel", slug: "padel" }],
        upcoming_screenings: [
          { title: "Pirates vs Chiefs", startsAt: "2026-10-31T13:30:00.000Z" },
        ],
      }),
      "default",
    );
    assert.equal(
      classifyVenuePage({
        broadcasts: [{ name: "Soccer", slug: "soccer" }],
        sports: [],
        golfCourse: playableCourse(),
      }),
      "default",
    );
  });

  it("leaves a venue with neither screens nor play sports on the current page", () => {
    assert.equal(
      classifyVenuePage({
        broadcasts: [],
        sports: [{ name: "  ", slug: null }],
        upcoming_screenings: [],
      }),
      "default",
    );
  });
});

describe("venue short name and place", () => {
  it("keeps SEO phrasing out of the H1", () => {
    assert.equal(
      venueShortDisplayName("Benchwarmers Sports Bar", {
        suburb: "Rosebank",
        city: "Johannesburg",
      }),
      "Benchwarmers",
    );
    assert.equal(
      venueShortDisplayName("Action Padel Century City", {
        suburb: "Century City",
        city: "Cape Town",
      }),
      "Action Padel",
    );
    assert.equal(
      venueShortDisplayName("The Baron Sandton", { suburb: "Sandton" }),
      "The Baron",
    );
    assert.equal(venueWatchPlace({ suburb: "Rosebank", city: "Johannesburg" }), "Rosebank");
    assert.equal(
      venuePlayPlace({ suburb: "Century City", city: "Cape Town" }),
      "Century City, Cape Town",
    );
  });
});

describe("customer about and play facts", () => {
  it("strips publish notes and states padel facts once", () => {
    const about = venueCustomerAbout(actionPadel.description);
    assert.match(about ?? "", /oldest public padel venues/);
    assert.equal(about?.toLowerCase().includes("playtomic"), false);
    assert.equal(about?.toLowerCase().includes("no confirmed"), false);
    assert.equal(
      venueCourtFacility(actionPadel.description),
      "2 outdoor courts",
    );
    assert.equal(
      venuePlayFactsLine(actionPadel, "Padel"),
      "2 outdoor courts. Padel. Food, outdoor, parking.",
    );
    assert.equal(
      venuePlayFactsLine(actionPadel, "Padel")?.toLowerCase().includes("golf"),
      false,
    );
    assert.equal(
      venuePlayFactsLine(actionPadel, "Padel")?.toLowerCase().includes("darts"),
      false,
    );
    assert.equal(
      venuePlayFactsLine(actionPadel, "Padel")?.toLowerCase().includes("playtomic"),
      false,
    );
  });

  it("does not turn outdoor seating into outdoor courts", () => {
    const venue: VenueTemplateInput = {
      ...actionPadel,
      description: "A padel club with a terrace.",
      has_outdoor_area: true,
    };
    assert.equal(venueCourtFacility(venue.description), null);
    assert.equal(venuePlayFactsLine(venue, "Padel"), "Padel. Food, outdoor, parking.");
  });

  it("keeps the full Benchwarmers customer paragraph", () => {
    const about = venueCustomerAbout(
      "Rosebank’s loud multi-screen sports bar for nights when rugby, soccer and F1 overlap. Screens everywhere, generator backup, live commentary and a full food-and-draft setup with outdoor seating and on-site parking. LeagueSports flagship Watch pick for Springboks Tests and Grand Prix weekends—book early on big fixtures.",
    );
    assert.equal(
      about,
      "Rosebank’s loud multi-screen sports bar for nights when rugby, soccer and F1 overlap. Screens everywhere, generator backup, live commentary and a full food-and-draft setup with outdoor seating and on-site parking. LeagueSports flagship Watch pick for Springboks Tests and Grand Prix weekends—book early on big fixtures.",
    );
  });

  it("lists every live amenity label once", () => {
    assert.deepEqual(venueGoodForLabels(benchwarmers, true), [
      "Generator / Inverter Backup",
      "HD Big Screens",
      "Live Commentary On",
      "Draft Beer",
      "Food Menu",
      "Outdoor Area",
      "On-site Parking",
    ]);
    assert.deepEqual(venueGoodForLabels(actionPadel, false), [
      "Food Menu",
      "Outdoor Area",
      "On-site Parking",
    ]);
  });

  it("writes the street address and the sports this bar screens", () => {
    assert.equal(
      venueAddressLine({
        street: "2 Bolton Road",
        suburb: "Rosebank",
        city: "Johannesburg",
        province: "Gauteng",
      }),
      "2 Bolton Road, Rosebank, Johannesburg, Gauteng",
    );
    assert.equal(
      venueAddressLine({
        street: "Century Boulevard (Fives Futbol), Century City",
        suburb: "Century City",
        city: "Cape Town",
        province: "Western Cape",
      }),
      "Century Boulevard (Fives Futbol), Century City, Cape Town, Western Cape",
    );
    assert.equal(venueAddressLine({ street: "  ", suburb: "" }), null);
    assert.equal(
      venueWatchScreensLine(benchwarmers),
      "Screens Soccer, Rugby, and Golf.",
    );
    assert.equal(
      venueWatchScreensLine({
        broadcasts: [
          { name: "Motorsport" },
          { name: "Soccer" },
          { name: "Golf" },
          { name: "Rugby" },
        ],
      }),
      "Screens Motorsport, Soccer, Golf, and Rugby.",
    );
    assert.equal(venueWatchScreensLine(actionPadel), null);
    assert.equal(
      venueWatchScreensLine({
        broadcasts: [{ name: "Golf" }, { name: " golf " }],
      }),
      "Screens Golf.",
    );
  });

  it("hides hours unless the venue record has them", () => {
    assert.equal(venueHoursLine({}), null);
    assert.equal(venueHoursLine({ hours: "   " }), null);
    assert.equal(venueHoursLine({ hours: "Tue–Sun 11:00–23:00" }), "Tue–Sun 11:00–23:00");
  });

  it("opens match create with the venue and its one sport", () => {
    assert.equal(
      venueStartMatchHref(actionPadel),
      "/padel/new?venue=action-padel-century-city",
    );
    assert.equal(
      venueStartMatchHref({
        slug: "extreme-go-karting",
        sports: [{ name: "Karting", slug: "karting" }],
        broadcasts: [],
      }),
      null,
    );
    assert.equal(venueStartMatchHref(benchwarmers), null);
  });
});
