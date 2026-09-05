import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GUIDE_FAQS_BY_SLUG,
  JOBURG_PADEL_GUIDE_SLUG,
  getGuideFaqs,
} from "../../data/guides/faqs.ts";
import {
  buildGuideJsonLd,
  findJsonLdNode,
} from "./guideJsonLd.ts";

const JOBURG_FAQS = getGuideFaqs(JOBURG_PADEL_GUIDE_SLUG);

const REQUIRED_JOBURG_QUESTIONS = [
  "How much does it cost to book a padel court in Johannesburg?",
  "Do I need to buy an expensive racket before my first game?",
  "How do I find other players if I don't have a four-ball?",
];

const JOBURG_GUIDE = {
  title: "The Ultimate Guide to the Best Padel Courts in Johannesburg",
  description:
    "Looking for the perfect court, top-tier turf, and the best post-match gees in Jozi?",
  slug: JOBURG_PADEL_GUIDE_SLUG,
  imageUrl: "https://cdn.sanity.io/images/example/guide.jpg",
  datePublished: "2026-03-15T08:00:00.000Z",
  faqs: JOBURG_FAQS,
};

describe("getGuideFaqs", () => {
  it("returns the Joburg padel FAQs by slug", () => {
    assert.equal(JOBURG_FAQS.length, 6);
    assert.equal(
      GUIDE_FAQS_BY_SLUG[JOBURG_PADEL_GUIDE_SLUG],
      JOBURG_FAQS,
    );
    assert.deepEqual(
      JOBURG_FAQS.slice(0, 3).map((faq) => faq.question),
      REQUIRED_JOBURG_QUESTIONS,
    );
  });

  it("returns an empty list for guides without structured FAQs", () => {
    assert.deepEqual(getGuideFaqs("unknown-guide"), []);
  });
});

describe("buildGuideJsonLd", () => {
  it("emits a BlogPosting node with LeagueSports authorship and the page URL", () => {
    const jsonLd = buildGuideJsonLd(JOBURG_GUIDE);
    const posting = findJsonLdNode(jsonLd, "BlogPosting");

    assert.equal(posting?.["@type"], "BlogPosting");
    assert.equal(posting?.headline, JOBURG_GUIDE.title);
    assert.equal(posting?.description, JOBURG_GUIDE.description);
    assert.equal(posting?.image, JOBURG_GUIDE.imageUrl);
    assert.equal(posting?.author.name, "LeagueSports");
    assert.equal(posting?.author.url, "https://leaguesports.co.za");
    assert.equal(posting?.publisher.name, "LeagueSports");
    assert.equal(posting?.datePublished, JOBURG_GUIDE.datePublished);
    assert.equal(
      posting?.mainEntityOfPage["@id"],
      `https://leaguesports.co.za/guides/${JOBURG_PADEL_GUIDE_SLUG}`,
    );
  });

  it("builds FAQPage mainEntity from the same FAQ array", () => {
    const jsonLd = buildGuideJsonLd(JOBURG_GUIDE);
    const faqPage = findJsonLdNode(jsonLd, "FAQPage");

    assert.ok(faqPage);
    assert.equal(faqPage.mainEntity.length, 6);
    assert.deepEqual(
      faqPage.mainEntity.slice(0, 3).map((entity) => entity.name),
      REQUIRED_JOBURG_QUESTIONS,
    );
    assert.deepEqual(
      faqPage.mainEntity.map((entity) => entity.name),
      JOBURG_FAQS.map((faq) => faq.question),
    );
    assert.deepEqual(
      faqPage.mainEntity.map((entity) => entity.acceptedAnswer.text),
      JOBURG_FAQS.map((faq) => faq.answer),
    );

    for (const entity of faqPage.mainEntity) {
      assert.equal(entity["@type"], "Question");
      assert.equal(entity.acceptedAnswer["@type"], "Answer");
      assert.equal(/<[^>]+>/.test(entity.acceptedAnswer.text), false);
      assert.equal(/<[^>]+>/.test(entity.name), false);
    }
  });

  it("keeps FAQ answers in sync when the source array grows", () => {
    const extra = {
      question: "Are walk-ins available?",
      answer: "Peak slots should be booked ahead on Playtomic.",
    };
    const jsonLd = buildGuideJsonLd({
      ...JOBURG_GUIDE,
      faqs: [...JOBURG_FAQS, extra],
    });
    const faqPage = findJsonLdNode(jsonLd, "FAQPage");

    assert.equal(faqPage?.mainEntity.length, JOBURG_FAQS.length + 1);
    assert.equal(faqPage?.mainEntity.at(-1)?.name, extra.question);
    assert.equal(faqPage?.mainEntity.at(-1)?.acceptedAnswer.text, extra.answer);
  });

  it("builds BreadcrumbList Home → Guides → title with canonical URLs", () => {
    const jsonLd = buildGuideJsonLd(JOBURG_GUIDE);
    const crumbs = findJsonLdNode(jsonLd, "BreadcrumbList");

    assert.ok(crumbs);
    assert.equal(crumbs.itemListElement.length, 3);
    assert.deepEqual(
      crumbs.itemListElement.map((item) => ({
        position: item.position,
        name: item.name,
        item: item.item,
      })),
      [
        {
          position: 1,
          name: "Home",
          item: "https://leaguesports.co.za",
        },
        {
          position: 2,
          name: "Guides",
          item: "https://leaguesports.co.za/guides",
        },
        {
          position: 3,
          name: JOBURG_GUIDE.title,
          item: `https://leaguesports.co.za/guides/${JOBURG_PADEL_GUIDE_SLUG}`,
        },
      ],
    );
  });

  it("omits FAQPage when a guide has no structured FAQs", () => {
    const jsonLd = buildGuideJsonLd({
      ...JOBURG_GUIDE,
      slug: "another-guide",
      faqs: [],
    });

    assert.equal(findJsonLdNode(jsonLd, "FAQPage"), undefined);
    assert.equal(findJsonLdNode(jsonLd, "BlogPosting")?.["@type"], "BlogPosting");
    assert.equal(
      findJsonLdNode(jsonLd, "BreadcrumbList")?.itemListElement.length,
      3,
    );
  });

  it("omits image and datePublished when they are missing", () => {
    const jsonLd = buildGuideJsonLd({
      title: "Premier League sports bars in Joburg",
      description: "Where to watch.",
      slug: "premier-league-sports-bars-joburg",
    });
    const posting = findJsonLdNode(jsonLd, "BlogPosting");

    assert.equal("image" in (posting ?? {}), false);
    assert.equal("datePublished" in (posting ?? {}), false);
  });

  it("strips HTML from FAQ JSON-LD text", () => {
    const jsonLd = buildGuideJsonLd({
      ...JOBURG_GUIDE,
      faqs: [
        {
          question: "What is <em>padel</em>?",
          answer: "A racket sport. <a href='/venues?intent=play'>Book a court</a>.",
        },
      ],
    });
    const faqPage = findJsonLdNode(jsonLd, "FAQPage");

    assert.equal(faqPage?.mainEntity[0]?.name, "What is padel?");
    assert.equal(
      faqPage?.mainEntity[0]?.acceptedAnswer.text,
      "A racket sport. Book a court.",
    );
  });
});
