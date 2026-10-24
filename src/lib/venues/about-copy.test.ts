import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VENUE_ABOUT_EXPAND_CHARS,
  venueAboutExpands,
  venueAboutParagraphs,
} from "./about-copy.ts";
import {
  venueProfileAbout,
  venueProfileDescription,
  type VenueProfileInput,
} from "./profile-seo.ts";

function block(text: string, key: string) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
  };
}

const ARENA_BLOCKS = [
  block(
    "Arena X is an indoor sports and family entertainment hub at 9 Racecourse Road, Milnerton, Cape Town, open daily 9:00–23:00. You can play indoor soccer (5-a-side and 4-a-side), netball, cricket, dodgeball, lawn bowls, pickleball, padel (three indoor courts run by Serpents Padel), table tennis and basketball, plus a golf simulator, competition pool tables, darts and SpeedDarts.",
    "b0",
  ),
  block(
    "There are leagues, kids' parties and school-holiday clinics, along with Jump X trampolines and inflatables, Multiball and DIDIM interactive wall games, and Nerf wars. Soccer and multisport courts are reserved online through Arena X, while pickleball, padel and table tennis run on Playtomic.",
    "b1",
  ),
  block(
    "Leagues run for soccer, netball, cricket, dodgeball and bowls, and the CBC Premier League is a 12-week, Friday-night franchise cricket league. Pickleball has social Americanos and PCI-certified coaching, padel socials are listed on Playtomic, and Netted is a junior cricket academy. Holiday clinics for ages 6–16 run Mon–Fri 9:00–12:00 and cost R900 a week or R220 a day. Two-hour kids' parties cost R1,500–R5,000 and cover soccer, netball, cricket, dodgeball, Jump X, Multiball, Nerf wars, bowls, pickleball, pool & darts and golf sim. Companies can enter league teams or sponsor a court. The X Bar serves craft beer, Café X serves food, and parking is free on site.",
    "b2",
  ),
  block(
    "Published prices: social games R800–R1,400 (60–90 min), practice from R500 an hour and league games R420–R640 per team. Golf sim is R200 an hour (+R100 per extra player), pool R100 an hour, darts R50 per board per hour and table tennis R180 per table per hour. Pool, darts and table tennis can also be booked at the bar/kiosk. A 50% non-refundable deposit secures bookings.",
    "b3",
  ),
  block(
    "Phone +27 50 031 8914 | info@arenax.co.za | https://arenax.co.za/",
    "b4",
  ),
];

const WINGATE_BLOCKS = [
  block(
    "Wingate Park Country Club is a family-friendly sports and social club at 539 Norval Street in Moreletapark, in Pretoria's eastern suburbs. Its centrepiece is an 18-hole golf course with lovely views and quick, well-kept greens.",
    "w0",
  ),
  block(
    "Golf is only the start. The grounds also have five bowling greens, six newly upgraded tennis courts and four padel courts, and the club is home to a road-running club, so there is something for every age and level.",
    "w1",
  ),
  block(
    "After your round or match, the licensed clubhouse restaurant serves full meals, including pizza from its large pizza oven, and golfers can refuel mid-round at the halfway house. Free WiFi is available.",
    "w2",
  ),
  block(
    "For golf bookings, golf days and membership, call the club on 012 997 1312 or email admin@wingatecc.co.za. Padel courts are booked on the Playtomic app under Proactive Padel@Wingate (padel bookings: 065 532 1590). Restaurant food orders: 068 675 6388.",
    "w3",
  ),
];

describe("venue about paragraphs", () => {
  it("keeps every Sanity block, including prices, booking, contact, and urls", () => {
    const about = venueAboutParagraphs(ARENA_BLOCKS);
    assert.equal(about.length, 5);
    assert.equal(about[1]?.includes("Playtomic"), true);
    assert.equal(about[1]?.includes("reserved online"), true);
    assert.equal(about[2]?.includes("R1,500–R5,000"), true);
    assert.equal(about[3]?.includes("R800–R1,400"), true);
    assert.equal(about[3]?.includes("booked at the bar"), true);
    assert.equal(
      about[4],
      "Phone +27 50 031 8914 | info@arenax.co.za | https://arenax.co.za/",
    );
    assert.equal(venueProfileAbout(ARENA_BLOCKS).join("\n"), about.join("\n"));
  });

  it("does not split one block into a paragraph per sentence", () => {
    const about = venueAboutParagraphs(WINGATE_BLOCKS);
    assert.equal(about.length, 4);
    assert.equal(about[0]?.startsWith("Wingate Park Country Club"), true);
    assert.equal(about[0]?.includes("18-hole golf course"), true);
    assert.equal(about[3]?.includes("012 997 1312"), true);
    assert.equal(about[3]?.includes("Playtomic"), true);
    assert.equal(about[3]?.includes("065 532 1590"), true);
    assert.equal(about[3]?.includes("admin@wingatecc.co.za"), true);
  });

  it("splits a plain string on newlines and still drops an editorial note", () => {
    const about = venueAboutParagraphs(
      "A neighbourhood screen for the weekend.\nPlaytomic booking is an internal note.\nBook a table on https://example.co.za/book or call 011 268 0871.",
    );
    assert.deepEqual(about, [
      "A neighbourhood screen for the weekend.",
      "Book a table on https://example.co.za/book or call 011 268 0871.",
    ]);
  });

  it("drops an editorial sentence inside a block and keeps the booking sentence", () => {
    const about = venueAboutParagraphs(
      "Courts from R200 an hour. Do not publish the draft rate. Book on Playtomic.",
    );
    assert.deepEqual(about, ["Courts from R200 an hour. Book on Playtomic."]);
  });

  it("returns nothing for an empty description", () => {
    assert.deepEqual(venueAboutParagraphs(null), []);
    assert.deepEqual(venueAboutParagraphs([]), []);
    assert.deepEqual(venueAboutParagraphs("  \n  "), []);
  });
});

describe("venue about expander", () => {
  it("expands a full offering and leaves a short blurb open", () => {
    assert.equal(venueAboutExpands(venueAboutParagraphs(ARENA_BLOCKS)), true);
    assert.equal(venueAboutExpands(venueAboutParagraphs(WINGATE_BLOCKS)), true);
    assert.equal(venueAboutExpands(["A padel club with a terrace."]), false);
    assert.equal(
      venueAboutExpands(["x".repeat(VENUE_ABOUT_EXPAND_CHARS)]),
      false,
    );
    assert.equal(
      venueAboutExpands(["x".repeat(VENUE_ABOUT_EXPAND_CHARS + 1)]),
      true,
    );
  });
});

describe("venue meta description stays short", () => {
  it("does not put the long about, prices, or contact url into the meta description", () => {
    const venue: VenueProfileInput = {
      name: "Arena X",
      slug: "arena-x-milnerton",
      address: { suburb: "Milnerton", city: "Cape Town" },
      broadcasts: [],
      sports: [{ name: "Padel", slug: "padel" }],
      description: ARENA_BLOCKS,
    };
    const meta = venueProfileDescription(venue);
    assert.ok(meta.length <= 155);
    assert.equal(meta.includes("arenax.co.za"), false);
    assert.equal(meta.includes("R800"), false);
    assert.equal(meta.includes("+27 50"), false);
    assert.match(meta, /Arena X/);
  });
});
