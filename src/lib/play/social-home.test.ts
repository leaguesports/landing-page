import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PLAY_MODE_SESSION_LIVE } from "./mode.ts";
import {
  SOCIAL_HOME_ACTIVITY,
  SOCIAL_HOME_COPY,
  SOCIAL_LEGEND,
  SocialHomeView,
  beginSocialCompose,
  initialSocialHome,
  nextSocialFeed,
  parseSocialFeed,
  reduceSocialHome,
  reduceSocialNotice,
  socialComposePress,
  socialFeedFromSearch,
  socialFeedHref,
  type SocialFeed,
} from "./social-home.ts";

const SAMPLE =
  /Jay|Thandi|Lerato|Soweto|Kyle|Bloc11|Killarney|Hogshead|Braamfontein|Pieter|birdies|Darts/;

function html(feed: SocialFeed, notice: string | null): string {
  return renderToStaticMarkup(
    createElement(SocialHomeView, {
      feed,
      notice,
      onFeed() {},
      onCompose() {},
    }),
  );
}

function selectedFeed(markup: string): string | null {
  const buttons = markup.match(/<button[^>]*role="tab"[^>]*>/g) ?? [];
  const selected = buttons.find((button) => button.includes('aria-selected="true"'));
  return selected?.match(/data-feed="(friends|nearby)"/)?.[1] ?? null;
}

describe("social feed toggle", () => {
  it("defaults to Friends and reads Nearby from the URL", () => {
    assert.equal(parseSocialFeed(null), null);
    assert.equal(parseSocialFeed("darts"), null);
    assert.equal(parseSocialFeed(" Nearby "), "nearby");
    assert.equal(initialSocialHome(null).feed, "friends");
    assert.equal(initialSocialHome("nope").feed, "friends");
    assert.equal(initialSocialHome("nearby").feed, "nearby");
    assert.equal(socialFeedFromSearch(""), "friends");
    assert.equal(socialFeedFromSearch("?mode=social"), "friends");
    assert.equal(socialFeedFromSearch("?mode=social&feed=friends"), "friends");
    assert.equal(socialFeedFromSearch("?mode=social&feed=nearby"), "nearby");
    assert.equal(socialFeedFromSearch("feed=nearby"), "nearby");
    assert.equal(socialFeedFromSearch("?mode=social&feed=darts"), "friends");
    assert.equal(socialFeedHref("friends"), "/play?mode=social");
    assert.equal(socialFeedHref("nearby"), "/play?mode=social&feed=nearby");
  });

  it("moves with the arrow keys and syncs the choice through the reducer", () => {
    const friends = initialSocialHome(null);
    assert.equal(friends.notice, null);
    assert.equal(nextSocialFeed("friends", "ArrowRight"), "nearby");
    assert.equal(nextSocialFeed("nearby", "ArrowLeft"), "friends");
    assert.equal(nextSocialFeed("friends", "ArrowLeft"), "nearby");
    assert.equal(nextSocialFeed("nearby", "ArrowRight"), "friends");
    assert.equal(nextSocialFeed("nearby", "ArrowUp"), "friends");
    assert.equal(nextSocialFeed("friends", "ArrowDown"), "nearby");
    assert.equal(nextSocialFeed("nearby", "Home"), "friends");
    assert.equal(nextSocialFeed("friends", "End"), "nearby");
    assert.equal(nextSocialFeed("friends", "Tab"), null);
    assert.equal(nextSocialFeed("friends", "Enter"), null);

    const nearby = reduceSocialHome(friends, { type: "select", feed: "nearby" });
    assert.equal(nearby.feed, "nearby");
    assert.equal(socialFeedHref(nearby.feed), "/play?mode=social&feed=nearby");
    const back = reduceSocialHome(nearby, { type: "key", key: "ArrowLeft" });
    assert.equal(back.feed, "friends");
    assert.equal(socialFeedHref(back.feed), "/play?mode=social");
    assert.equal(reduceSocialHome(friends, { type: "select", feed: "darts" }), friends);
    assert.equal(
      reduceSocialHome(friends, { type: "hydrate", search: "?mode=social&feed=nearby" }).feed,
      "nearby",
    );
    assert.equal(
      reduceSocialHome(nearby, { type: "hydrate", search: "?mode=social&feed=nearby" }),
      nearby,
    );
  });
});

describe("social empty feed", () => {
  it("renders both empty states and no sample activity", () => {
    assert.equal(SOCIAL_HOME_ACTIVITY, "omitted");
    assert.equal(PLAY_MODE_SESSION_LIVE, false);
    assert.deepEqual(
      SOCIAL_LEGEND.map((chip) => chip.label),
      ["Golf", "Padel", "Watch"],
    );
    assert.equal(SOCIAL_LEGEND.some((chip) => chip.label === "Darts"), false);

    const friends = html("friends", null);
    assert.equal(selectedFeed(friends), "friends");
    assert.match(friends, /role="tablist"/);
    assert.match(friends, /aria-label="Social feed"/);
    assert.equal(friends.match(/aria-controls="social-panel"/g)?.length, 2);
    assert.match(friends, /id="social-panel"/);
    assert.match(friends, />Friends</);
    assert.match(friends, />Nearby</);
    assert.equal(friends.match(/class="feed/g)?.length, 1);
    assert.match(friends, /data-empty="true"/);
    assert.match(friends, /Your friends&#x27; activity shows up here|Your friends' activity shows up here/);
    assert.match(friends, /people you follow/);
    assert.match(friends, /going to a screening/);
    assert.match(friends, /class="chip chip-golf"/);
    assert.match(friends, /class="chip chip-padel"/);
    assert.match(friends, /class="chip chip-watch"/);
    assert.match(friends, /aria-hidden="true"/);
    assert.doesNotMatch(friends, /Games and screenings near you/);
    assert.doesNotMatch(friends, SAMPLE);
    assert.doesNotMatch(friends, /<a /);

    const nearby = html("nearby", null);
    assert.equal(selectedFeed(nearby), "nearby");
    assert.equal(nearby.match(/class="feed/g)?.length, 1);
    assert.match(nearby, /Games and screenings near you show up here/);
    assert.match(nearby, /live games near you/);
    assert.doesNotMatch(nearby, /Your friends/);
    assert.doesNotMatch(nearby, /chip-golf|chip-padel|chip-watch|people you follow/);
    assert.doesNotMatch(nearby, SAMPLE);
    assert.doesNotMatch(friends + nearby, /class="fh"|class="live"|class="pts"/);
  });

  it("shows a coming-soon notice from the compose button", () => {
    assert.equal(socialComposePress().live, false);
    assert.equal(socialComposePress().notice, "Coming soon");
    assert.equal(reduceSocialNotice(null), SOCIAL_HOME_COPY.notice);
    assert.equal(beginSocialCompose(), null);
    const shown = reduceSocialHome(initialSocialHome(null), { type: "compose" });
    assert.equal(shown.feed, "friends");
    assert.equal(shown.notice, "Coming soon");

    const withNotice = html("friends", "Coming soon");
    assert.match(withNotice, /id="social-coming-soon"/);
    assert.match(withNotice, /role="status"/);
    assert.match(withNotice, />Coming soon</);
    assert.match(withNotice, /aria-label="New post"/);
    assert.match(withNotice, /data-social-action="compose"/);
    assert.match(withNotice, /aria-describedby="social-coming-soon"/);
    assert.doesNotMatch(withNotice, SAMPLE);

    assert.deepEqual(socialComposePress(true), { live: true, action: "compose" });
    assert.equal(beginSocialCompose(true), "compose");
    assert.equal(reduceSocialNotice(null, true), null);
    assert.equal(reduceSocialNotice("Coming soon", true), "Coming soon");
  });

  it("keeps the session API unwired and replaces the Social stub", () => {
    const home = readFileSync(new URL("./social-home.ts", import.meta.url), "utf8");
    const shell = readFileSync(
      new URL("../../components/play/SocialHome.tsx", import.meta.url),
      "utf8",
    );
    const app = readFileSync(
      new URL("../../components/play/PlayModeApp.tsx", import.meta.url),
      "utf8",
    );
    const page = readFileSync(new URL("../../app/play/page.tsx", import.meta.url), "utf8");
    const css = readFileSync(
      new URL("../../components/play/play-mode.css", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(home + shell, /fetch\(|localStorage|router\.push|poolApi|<a /);
    assert.match(shell, /socialFeedHref/);
    assert.match(shell, /replaceState/);
    assert.match(shell, /reduceSocialHome/);
    assert.match(app, /<SocialHome/);
    assert.match(app, /GolfHome/);
    assert.match(app, /PadelHome/);
    assert.doesNotMatch(app, /className="soon"/);
    assert.match(page, /initialFeedParam/);
    assert.match(css, /\.social-home \.seg[\s\S]*border-radius:\s*999px/);
    assert.match(css, /\.social-home \.seg button[\s\S]*transition:\s*none/);
    assert.match(css, /\.social-home \.seg button\[aria-selected="true"\][\s\S]*background:\s*#09090b/);
    assert.match(css, /\.social-home \.seg button:focus-visible[\s\S]*outline:\s*2px solid var\(--ink\)/);
    assert.match(css, /\.social-home \.seg button:focus \{\s*background:\s*transparent/);
    assert.match(css, /\.social-home \.feed[\s\S]*border-radius:\s*16px/);
    assert.match(css, /\.fab[\s\S]*border-radius:\s*50%/);
    assert.match(css, /safe-area-inset-bottom/);
    assert.match(css, /\.fab[\s\S]*var\(--mint\)/);
    assert.match(css, /#09090b|var\(--ink\)/);
    assert.doesNotMatch(home + shell, /Jay|Thandi|Lerato|Soweto|Kyle|Bloc11|Killarney|Hogshead/);
  });
});
