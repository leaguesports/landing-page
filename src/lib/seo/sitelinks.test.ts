import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { staticSitemapRoutes } from "../../app/sitemap/entries.ts";
import { eventsListCopy } from "../events/scope.ts";
import { intentBrowseDescription } from "../intent/copy.ts";
import {
  HEADER_SITELINKS,
  SITEMAP_PAGE_LINK,
  sitemapSections,
} from "./sitelinks.ts";

const ORIGIN = "https://leaguesports.co.za";
const NOW = new Date("2026-10-06T00:00:00.000Z");

describe("brand sitelinks", () => {
  it("uses short titles and the destination page description", () => {
    const soccer = HEADER_SITELINKS.find((link) => link.href === "/watch/soccer");
    assert.equal(soccer?.title, "Soccer");
    assert.equal(soccer?.description, intentBrowseDescription("watch", "Soccer"));
    assert.equal(
      sitemapSections()
        .flatMap((section) => section.links)
        .find((link) => link.href === "/events")?.description,
      eventsListCopy({}).description,
    );
  });

  it("keeps header labels unique and free of the brand name", () => {
    const titles = HEADER_SITELINKS.map((link) => link.title);
    assert.equal(new Set(titles).size, titles.length);
    assert.ok(titles.every((title) => title.length <= 20));
    assert.ok(titles.every((title) => !/leaguesports/i.test(title)));
  });

  it("lists header links and the site map in the static sitemap", () => {
    const urls = staticSitemapRoutes(ORIGIN, NOW).map((route) => route.url);
    for (const link of [...HEADER_SITELINKS, SITEMAP_PAGE_LINK]) {
      assert.ok(urls.includes(`${ORIGIN}${link.href}`), link.href);
    }
    const playCities = sitemapSections()
      .flatMap((section) => section.links)
      .filter((link) => /^\/play\/[^/]+\/[^/]+$/.test(link.href));
    assert.ok(playCities.length > 0);
    for (const link of playCities) {
      assert.equal(urls.includes(`${ORIGIN}${link.href}`), false, link.href);
    }
  });

  it("does not repeat a path or link a noindex play dashboard", () => {
    const hrefs = sitemapSections().flatMap((section) =>
      section.links.map((link) => link.href),
    );
    assert.equal(new Set(hrefs).size, hrefs.length);
    assert.equal(hrefs.includes(SITEMAP_PAGE_LINK.href), false);
    assert.equal(hrefs.includes("/play/padel"), false);
    assert.equal(hrefs.includes("/play/golf"), false);
    assert.equal(hrefs.includes("/play/darts"), false);
  });
});
