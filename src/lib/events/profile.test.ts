import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describeFixtureLinks, buildFixtureProfile } from "./profile.ts";

describe("fixture profile", () => {
  it("writes a lede, facts, and questions from the fixture", () => {
    const profile = buildFixtureProfile({
      title: "Unused title",
      sportName: "Rugby",
      competition: "Rugby Championship",
      teams: [{ name: "Springboks" }, { name: "All Blacks" }],
      startsAt: "2026-09-06T16:00:00.000Z",
      broadcastInfo: "SuperSport is showing the Test.",
      hostVenue: { name: "Ellis Park", slug: "ellis-park", city: "Johannesburg" },
      venues: [
        { name: "The Local", slug: "the-local", city: "Johannesburg" },
        { name: "Cape Town Bar", slug: "cape-town-bar", city: "Cape Town" },
      ],
    });

    assert.equal(profile.shortName, "Springboks vs All Blacks");
    assert.equal(profile.eyebrow, "Rugby · Rugby Championship");
    assert.match(profile.lede, /rugby match in the Rugby Championship/);
    assert.equal(profile.facts.find((fact) => fact.value.includes("18:00 SAST"))?.label, "Kickoff");
    assert.match(profile.lede, /6 September 2026 at 18:00 SAST/);
    assert.match(profile.lede, /Ellis Park in Johannesburg/);
    assert.match(profile.lede, /SuperSport/);
    assert.equal(
      profile.facts.find((fact) => fact.label === "Host")?.href,
      "/venues/ellis-park",
    );
    assert.equal(profile.facts.find((fact) => fact.label === "Screenings")?.value, "2 venues");
    assert.match(profile.headings.watch, /Where to watch Springboks vs All Blacks/);
    assert.ok(profile.faqs.some((faq) => faq.question.startsWith("When is")));
    assert.ok(profile.faqs.some((faq) => faq.question.startsWith("Where can I watch")));
    assert.ok(profile.keywords.includes("Cape Town"));
    assert.ok(profile.keywords.includes("where to watch"));
  });

  it("uses the circuit when the fixture is a race weekend", () => {
    const profile = buildFixtureProfile({
      title: "Spanish Grand Prix",
      sportName: "Formula 1",
      circuitLine: "Madring, Madrid, Spain",
      startsAt: "2026-09-13T13:00:00.000Z",
    });

    assert.match(profile.lede, /formula 1 race/);
    assert.equal(profile.facts.find((fact) => fact.value.includes("SAST"))?.label, "Lights out");
    assert.match(profile.lede, /Madring, Madrid, Spain/);
    assert.equal(profile.faqs[1]?.question, "Where is Spanish Grand Prix?");
    assert.match(profile.faqs[1]?.answer ?? "", /Madring, Madrid, Spain/);
  });

  it("describes related pages and leaves venue rows to the screening list", () => {
    const links = describeFixtureLinks(
      [
        { href: "/venues/ellis-park", label: "Ellis Park", kind: "venue" },
        { href: "/guides/best-sports-bars-joburg", label: "Best sports bars", kind: "guide" },
        { href: "/watch/rugby/johannesburg", label: "Watch Rugby in johannesburg", kind: "watch" },
      ],
      { title: "Springboks vs All Blacks", sportName: "Rugby" },
    );

    assert.equal(links.some((link) => link.kind === "venue"), false);
    assert.match(links[0]?.description ?? "", /Springboks vs All Blacks/);
    assert.match(links[1]?.description ?? "", /screening rugby/);
  });
});
