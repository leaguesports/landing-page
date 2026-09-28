import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SOWETO_DERBY_EVENT_SLUG } from "../../data/events/faqs.ts";
import { buildEventJsonLd, findEventJsonLdNode } from "./jsonLd.ts";
import { resolveFixturePageFaqs } from "./fixtureFaqs.ts";

const CMS_FAQS = [
  {
    question: "What time is Orlando Pirates vs Kaizer Chiefs kickoff in SA?",
    answer:
      "Kickoff is listed as 15:30 SAST on 31 October 2026 (13:30 UTC). Confirm on the day because Premiership kickoffs sometimes move for TV.",
  },
  {
    question: "How do I find bars showing the Soweto derby?",
    answer:
      "This page is the LeagueSports hub for the Betway Premiership Soweto derby fixture. Use Find where to watch once screening venues are listed.",
  },
  {
    question: "Is the Soweto derby busy in Joburg sports bars?",
    answer:
      "Joburg derby days fill Sandton, Soweto corridor, and northern-suburbs screens early. Shortlist from LeagueSports Joburg sports-bar guides.",
  },
  {
    question: "Should I follow Pirates vs Chiefs on LeagueSports?",
    answer:
      "Yes. Following keeps kickoff and any new screening venues tied to this slug so the fixture stays easy to find.",
  },
];

describe("resolveFixturePageFaqs", () => {
  it("prepends the Soweto Derby where-to-watch FAQ and replaces the stale bars answer", () => {
    const faqs = resolveFixturePageFaqs(SOWETO_DERBY_EVENT_SLUG, CMS_FAQS);
    assert.equal(faqs[0]?.question, "Where to watch the Soweto Derby?");
    assert.match(faqs[0]?.answer ?? "", /\/guides\/best-sports-bars-johannesburg/);
    assert.match(faqs[0]?.answer ?? "", /\/watch\/soccer\/johannesburg/);
    assert.match(faqs[0]?.answer ?? "", /15:30 SAST/);
    assert.doesNotMatch(faqs[0]?.answer ?? "", /\b\d{1,2}\s?(am|pm)\b/i);

    const bars = faqs.find(
      (faq) => faq.question === "How do I find bars showing the Soweto derby?",
    );
    assert.ok(bars);
    assert.match(bars.answer, /listed on this page/);
    assert.match(bars.answer, /best-sports-bars-johannesburg/);
    assert.doesNotMatch(bars.answer, /once screening venues are listed/);

    assert.equal(faqs.length, 5);
    assert.ok(
      faqs.some((faq) =>
        faq.question.startsWith("What time is Orlando Pirates"),
      ),
    );
  });

  it("leaves other fixtures on CMS FAQs only", () => {
    const faqs = resolveFixturePageFaqs("springboks-vs-all-blacks-2026", CMS_FAQS);
    assert.equal(faqs.length, 4);
    assert.equal(faqs[0]?.question, CMS_FAQS[0]?.question);
    assert.match(faqs[1]?.answer ?? "", /once screening venues are listed/);
  });

  it("emits FAQPage JSON-LD with plain-text link labels", () => {
    const faqs = resolveFixturePageFaqs(SOWETO_DERBY_EVENT_SLUG, CMS_FAQS);
    const jsonLd = buildEventJsonLd({
      title: "Pirates vs Chiefs 2026 - Where to Watch the Soweto Derby",
      slug: SOWETO_DERBY_EVENT_SLUG,
      description: "Where to watch the Soweto Derby in Johannesburg.",
      startsAt: "2026-10-31T13:30:00.000Z",
      sportName: "Soccer",
      faqs,
      siteUrl: "https://leaguesports.co.za",
    });
    const faqPage = findEventJsonLdNode(jsonLd, "FAQPage");
    assert.equal(
      faqPage?.["@id"],
      `https://leaguesports.co.za/events/${SOWETO_DERBY_EVENT_SLUG}#faq`,
    );
    assert.equal(faqPage?.mainEntity[0]?.name, "Where to watch the Soweto Derby?");
    const text = faqPage?.mainEntity[0]?.acceptedAnswer.text ?? "";
    assert.match(text, /best sports bars in Johannesburg/);
    assert.doesNotMatch(text, /\]\(/);
  });
});
