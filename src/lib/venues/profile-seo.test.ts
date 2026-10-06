import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  venueDirectoryLinks,
  venueProfileAbout,
  venueProfileCrumbs,
  venueProfileDescription,
  venueProfileFaqs,
  venueProfileKind,
  venueProfileLede,
  venueProfileTitle,
  type VenueProfileInput,
} from "./profile-seo.ts";

const sportsBar: VenueProfileInput = {
  name: "Benchwarmers Sports Bar",
  slug: "benchwarmers",
  address: {
    street: "1 Cradock Ave",
    suburb: "Rosebank",
    city: "Johannesburg",
    province: "Gauteng",
  },
  broadcasts: [
    { name: "Soccer", slug: "soccer" },
    { name: "Rugby", slug: "rugby" },
  ],
  sports: [],
  has_big_screens: true,
  has_live_audio: true,
  phone: "0115550101",
  description:
    "A neighbourhood screen for the weekend. Playtomic booking is an internal note.",
};

const court: VenueProfileInput = {
  name: "Action Padel",
  slug: "action-padel",
  address: { suburb: "Century City", city: "Cape Town" },
  broadcasts: [],
  sports: [{ name: "Padel", slug: "padel" }],
  has_parking: true,
  description: "Action Padel has 2 outdoor courts. Call 0821234567 to book.",
};

const hybrid: VenueProfileInput = {
  name: "The Baron",
  slug: "the-baron",
  address: { suburb: "Sandton", city: "Johannesburg" },
  broadcasts: [{ name: "Rugby", slug: "rugby" }],
  sports: [{ name: "Padel", slug: "padel" }],
  description: "Screens and two courts.",
};

describe("venue profile kind", () => {
  it("splits watch, play, hybrid, and a plain listing", () => {
    assert.equal(venueProfileKind(sportsBar), "watch");
    assert.equal(venueProfileKind(court), "play");
    assert.equal(venueProfileKind(hybrid), "hybrid");
    assert.equal(
      venueProfileKind({ name: "Hall", broadcasts: [], sports: [] }),
      "listing",
    );
  });
});

describe("venue profile copy", () => {
  it("writes a watch title, lede, and description from the sports it screens", () => {
    assert.equal(
      venueProfileTitle(sportsBar),
      "Watch soccer and rugby at Benchwarmers Sports Bar, Rosebank, Johannesburg",
    );
    assert.match(venueProfileLede(sportsBar), /Rosebank, Johannesburg/);
    assert.match(venueProfileLede(sportsBar), /soccer and rugby/);
    assert.match(venueProfileLede(sportsBar), /big screens/i);
    assert.equal(venueProfileLede(sportsBar).toLowerCase().includes("playtomic"), false);
    assert.ok(venueProfileDescription(sportsBar).length <= 155);
  });

  it("writes play copy from the sport and the court count in the description", () => {
    assert.equal(
      venueProfileTitle(court),
      "Play padel at Action Padel, Century City, Cape Town",
    );
    assert.match(venueProfileLede(court), /play padel/);
    assert.match(venueProfileLede(court), /2 outdoor courts/);
    const about = venueProfileAbout(court.description);
    assert.equal(about[0]?.includes("0821234567"), false);
    assert.match(venueProfileFaqs(court)[1]?.answer ?? "", /2 outdoor courts/);
  });

  it("says a hybrid both screens and hosts play", () => {
    assert.match(venueProfileTitle(hybrid), /^Watch and play at The Baron/);
    assert.match(venueProfileLede(hybrid), /watch Rugby and play padel/i);
    assert.match(
      venueProfileFaqs(hybrid).map((faq) => faq.question).join(" "),
      /watch and play/i,
    );
  });

  it("links the city and the sports, and keeps publish notes out of the about", () => {
    assert.deepEqual(
      venueProfileCrumbs(sportsBar).map((crumb) => crumb.name),
      ["Home", "Venues", "Johannesburg", "Benchwarmers Sports Bar"],
    );
    assert.deepEqual(venueDirectoryLinks(sportsBar).map((link) => link.href), [
      "/watch/soccer/johannesburg",
      "/watch/rugby/johannesburg",
    ]);
    assert.deepEqual(
      venueDirectoryLinks(sportsBar).map((link) => link.label),
      ["Soccer", "Rugby"],
    );
    assert.match(
      venueDirectoryLinks(sportsBar)[0]?.description ?? "",
      /screening Soccer in Johannesburg/,
    );
    assert.deepEqual(venueDirectoryLinks(court).map((link) => link.href), [
      "/play/padel/cape-town",
    ]);
    assert.equal(venueDirectoryLinks(court)[0]?.label, "Padel");
    assert.equal(
      venueProfileAbout(sportsBar.description).some((line) => /playtomic/i.test(line)),
      false,
    );
    assert.match(venueProfileFaqs(sportsBar)[0]?.answer ?? "", /Cradock Ave/);
  });
});
