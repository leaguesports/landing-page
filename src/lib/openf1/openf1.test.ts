import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  eventRaceReplaySlug,
  findOpenF1RaceSession,
  formatOpenF1SessionWhen,
  getOpenF1WeekendByEventSlugWith,
  groupOpenF1SessionsBySaDay,
  isOpenF1EnrichableFixture,
  isOpenF1EventSlug,
  OPENF1_MEDIA_HOST,
  OPENF1_PUBLIC_ORIGIN,
  OPENF1_REVALIDATE_SECONDS,
  openF1CircuitImageUrl,
  openF1CircuitLine,
  openF1CountryFlagUrl,
  openF1EventSlugForFixture,
  openF1EventSlugFromNameAndInstant,
  openF1PublicMeetingsUrl,
  openF1PublicSessionsUrl,
  openF1SessionStatus,
  parseOpenF1MediaUrl,
  parseOpenF1Weekend,
  slugifyOpenF1Name,
} from "./openf1.ts";

const SPANISH_MEETING = {
  meetingKey: 1294,
  meetingName: "Spanish Grand Prix",
  meetingOfficialName: "FORMULA 1 TAG HEUER GRAN PREMIO DE ESPAÑA 2026",
  eventSlug: "spanish-grand-prix-2026-09-13",
  circuitKey: 153,
  circuitShortName: "Madring",
  circuitType: "Temporary - Street",
  circuitImage:
    "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png",
  circuitInfoUrl: null,
  countryKey: 1,
  countryCode: "ESP",
  countryName: "Spain",
  countryFlag:
    "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/spain-flag.png",
  dateStart: "2026-09-11T11:30:00+00:00",
  dateEnd: "2026-09-13T15:00:00+00:00",
  gmtOffset: "02:00:00",
  isCancelled: false,
  location: "Madrid",
  year: 2026,
};

const SPANISH_SESSIONS = [
  {
    sessionKey: 10_001,
    sessionName: "Practice 1",
    sessionType: "Practice",
    meetingKey: 1294,
    circuitKey: 153,
    circuitShortName: "Madring",
    countryKey: 1,
    countryCode: "ESP",
    countryName: "Spain",
    dateStart: "2026-09-11T11:30:00+00:00",
    dateEnd: "2026-09-11T12:30:00+00:00",
    gmtOffset: "02:00:00",
    isCancelled: false,
    location: "Madrid",
    year: 2026,
  },
  {
    sessionKey: 10_002,
    sessionName: "Qualifying",
    sessionType: "Qualifying",
    meetingKey: 1294,
    circuitKey: 153,
    circuitShortName: "Madring",
    countryKey: 1,
    countryCode: "ESP",
    countryName: "Spain",
    dateStart: "2026-09-12T14:00:00+00:00",
    dateEnd: "2026-09-12T15:00:00+00:00",
    gmtOffset: "02:00:00",
    isCancelled: false,
    location: "Madrid",
    year: 2026,
  },
  {
    sessionKey: 10_003,
    sessionName: "Race",
    sessionType: "Race",
    meetingKey: 1294,
    circuitKey: 153,
    circuitShortName: "Madring",
    countryKey: 1,
    countryCode: "ESP",
    countryName: "Spain",
    dateStart: "2026-09-13T13:00:00+00:00",
    dateEnd: "2026-09-13T15:00:00+00:00",
    gmtOffset: "02:00:00",
    isCancelled: false,
    location: "Madrid",
    year: 2026,
  },
];

describe("OpenF1 slug helpers", () => {
  it("accepts CMS event slugs and rejects incomplete ones", () => {
    assert.equal(isOpenF1EventSlug("spanish-grand-prix-2026-09-13"), true);
    assert.equal(isOpenF1EventSlug("spanish-grand-prix"), false);
    assert.equal(isOpenF1EventSlug("spanish-grand-prix-2026-13-40"), false);
  });

  it("builds an event slug from a meeting name and race instant", () => {
    assert.equal(
      openF1EventSlugFromNameAndInstant(
        "Spanish Grand Prix",
        "2026-09-13T15:00:00+00:00",
      ),
      "spanish-grand-prix-2026-09-13",
    );
    assert.equal(
      openF1EventSlugFromNameAndInstant(
        "spanish-grand-prix-2026-09-11",
        "2026-09-13T15:00:00+00:00",
      ),
      "spanish-grand-prix-2026-09-11",
    );
    assert.equal(slugifyOpenF1Name("Gran Premio de España"), "gran-premio-de-espana");
  });

  it("prefers the public fixture slug for CMS event URLs", () => {
    assert.equal(
      openF1EventSlugForFixture({
        slug: "spanish-grand-prix-2026-09-13",
        title: "Spanish Grand Prix",
        startsAt: "2026-09-11T11:30:00.000Z",
      }),
      "spanish-grand-prix-2026-09-13",
    );
  });
});

describe("isOpenF1EnrichableFixture", () => {
  it("matches F1 series and motorsport/f1 event pages, not F2", () => {
    assert.equal(
      isOpenF1EnrichableFixture({ series: "f1", eventPageHref: null }),
      true,
    );
    assert.equal(
      isOpenF1EnrichableFixture({
        series: "formula-1",
        eventPageHref: "/watch/motorsport",
      }),
      true,
    );
    assert.equal(
      isOpenF1EnrichableFixture({
        series: null,
        eventPageHref: "/motorsport/f1/spanish-grand-prix",
      }),
      true,
    );
    assert.equal(
      isOpenF1EnrichableFixture({
        series: "f2",
        eventPageHref: "/motorsport/f2",
      }),
      false,
    );
    assert.equal(
      isOpenF1EnrichableFixture({
        series: "rugby",
        eventPageHref: "/watch/rugby",
      }),
      false,
    );
  });
});

describe("eventRaceReplaySlug", () => {
  it("does not treat dated rugby CMS slugs as F1 race replays", () => {
    assert.equal(isOpenF1EventSlug("springboks-vs-all-blacks-2026-09-13"), true);
    assert.equal(
      eventRaceReplaySlug({
        slug: "springboks-vs-all-blacks-2026-09-13",
        fixture: { series: "springboks", eventPageHref: "/watch/rugby" },
      }),
      null,
    );
    assert.equal(
      eventRaceReplaySlug({
        slug: "springboks-vs-all-blacks-2026-09-13",
        fixture: { series: "rugby", eventPageHref: null },
        weekendEventSlug: "spanish-grand-prix-2026-09-13",
      }),
      null,
    );
    assert.equal(
      eventRaceReplaySlug({
        slug: "springboks-vs-all-blacks-2026-09-13",
        fixture: { series: null, eventPageHref: null },
      }),
      null,
    );
  });

  it("keeps F1 fixtures and slug-only GP pages eligible", () => {
    assert.equal(
      eventRaceReplaySlug({
        slug: "spanish-grand-prix-2026-09-13",
        fixture: { series: "f1", eventPageHref: null },
        weekendEventSlug: "spanish-grand-prix-2026-09-13",
      }),
      "spanish-grand-prix-2026-09-13",
    );
    assert.equal(
      eventRaceReplaySlug({
        slug: "spanish-grand-prix-2026-09-13",
        fixture: { series: "formula-1", eventPageHref: "/motorsport/f1/spanish-grand-prix" },
      }),
      "spanish-grand-prix-2026-09-13",
    );
    assert.equal(
      eventRaceReplaySlug({
        slug: "spanish-grand-prix-2026-09-13",
        fixture: null,
      }),
      "spanish-grand-prix-2026-09-13",
    );
  });
});

describe("parseOpenF1Weekend", () => {
  it("maps the public meeting + sessions contract and sorts by start", () => {
    const weekend = parseOpenF1Weekend({
      meeting: SPANISH_MEETING,
      sessions: [SPANISH_SESSIONS[2], SPANISH_SESSIONS[0], SPANISH_SESSIONS[1]],
    });
    assert.equal(weekend?.meeting.meetingKey, 1294);
    assert.equal(weekend?.meeting.eventSlug, "spanish-grand-prix-2026-09-13");
    assert.equal(
      weekend?.meeting.circuitImage,
      "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png",
    );
    assert.equal(
      weekend?.meeting.countryFlag,
      "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/spain-flag.png",
    );
    assert.deepEqual(
      weekend?.sessions.map((session) => session.sessionName),
      ["Practice 1", "Qualifying", "Race"],
    );
    assert.equal(findOpenF1RaceSession(weekend?.sessions ?? [])?.sessionKey, 10_003);
    assert.equal(
      openF1CircuitLine(weekend!.meeting),
      "Madring, Madrid, Spain",
    );
  });

  it("drops an invalid meeting payload", () => {
    assert.equal(
      parseOpenF1Weekend({ meeting: { meetingName: "Spanish Grand Prix" } }),
      null,
    );
  });

  it("drops circuit and flag URLs that are not on the F1 media CDN", () => {
    const weekend = parseOpenF1Weekend({
      meeting: {
        ...SPANISH_MEETING,
        circuitImage: "https://evil.example/track.png",
        countryFlag: "javascript:alert(1)",
      },
      sessions: SPANISH_SESSIONS,
    });
    assert.equal(weekend?.meeting.circuitImage, null);
    assert.equal(weekend?.meeting.countryFlag, null);
  });
});

describe("parseOpenF1MediaUrl", () => {
  it("keeps HTTPS F1 media URLs and rejects other hosts", () => {
    const track =
      "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png";
    assert.equal(parseOpenF1MediaUrl(track), track);
    assert.equal(openF1CircuitImageUrl(SPANISH_MEETING), track);
    assert.equal(
      openF1CountryFlagUrl(SPANISH_MEETING),
      "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/spain-flag.png",
    );
    assert.equal(parseOpenF1MediaUrl("http://media.formula1.com/flag.png"), null);
    assert.equal(parseOpenF1MediaUrl("https://cdn.sanity.io/flag.png"), null);
    assert.equal(parseOpenF1MediaUrl("https://user:pass@media.formula1.com/x.png"), null);
    assert.equal(OPENF1_MEDIA_HOST, "media.formula1.com");
  });
});

describe("OpenF1 session display", () => {
  const now = new Date("2026-09-12T14:30:00.000Z");

  it("labels live / upcoming / completed / cancelled sessions", () => {
    assert.equal(openF1SessionStatus(SPANISH_SESSIONS[0]!, now), "completed");
    assert.equal(openF1SessionStatus(SPANISH_SESSIONS[1]!, now), "live");
    assert.equal(openF1SessionStatus(SPANISH_SESSIONS[2]!, now), "upcoming");
    assert.equal(
      openF1SessionStatus({ ...SPANISH_SESSIONS[2]!, isCancelled: true }, now),
      "cancelled",
    );
  });

  it("groups sessions by SA calendar day and formats SAST times", () => {
    const groups = groupOpenF1SessionsBySaDay(SPANISH_SESSIONS);
    assert.deepEqual(
      groups.map((group) => group.day),
      ["2026-09-11", "2026-09-12", "2026-09-13"],
    );
    assert.match(groups[0]?.label ?? "", /Friday/i);
    assert.match(
      formatOpenF1SessionWhen("2026-09-13T13:00:00+00:00") ?? "",
      /Sun,?\s*13\s+Sept?\.?\s*·\s*15:00/,
    );
  });
});

function snakeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    out[snake] = value;
  }
  delete out.event_slug;
  return out;
}

describe("getOpenF1WeekendByEventSlugWith", () => {
  const meetingsUrl = openF1PublicMeetingsUrl(2026);
  const sessionsUrl = openF1PublicSessionsUrl(1294);

  function publicFetch(options: {
    meetingsStatus?: number;
    sessionsStatus?: number;
    throwOn?: "meetings" | "sessions";
  } = {}) {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      const seen = String(url);
      calls.push({ url: seen, init });
      if (seen === meetingsUrl && options.throwOn === "meetings") {
        throw new Error("meetings down");
      }
      if (seen === sessionsUrl && options.throwOn === "sessions") {
        throw new Error("sessions down");
      }
      if (seen === meetingsUrl) {
        if ((options.meetingsStatus ?? 200) !== 200) {
          return new Response("no", { status: options.meetingsStatus });
        }
        return new Response(
          JSON.stringify([
            snakeRow({
              ...SPANISH_MEETING,
              meetingName: "Monaco Grand Prix",
              dateStart: "2026-06-05T11:30:00+00:00",
              dateEnd: "2026-06-07T15:00:00+00:00",
              meetingKey: 1200,
            }),
            snakeRow(SPANISH_MEETING),
          ]),
          { status: 200 },
        );
      }
      if (seen === sessionsUrl) {
        if ((options.sessionsStatus ?? 200) !== 200) {
          return new Response("no", { status: options.sessionsStatus });
        }
        return new Response(
          JSON.stringify(SPANISH_SESSIONS.map((session) => snakeRow(session))),
          { status: 200 },
        );
      }
      return new Response("unexpected", { status: 500 });
    };
    return { fetchImpl, calls };
  }

  it("maps a public meetings+sessions weekend and caches both reads", async () => {
    const { fetchImpl, calls } = publicFetch();
    const weekend = await getOpenF1WeekendByEventSlugWith(
      "spanish-grand-prix-2026-09-13",
      { fetch: fetchImpl },
    );

    assert.deepEqual(
      calls.map((call) => call.url),
      [meetingsUrl, sessionsUrl],
    );
    assert.equal(meetingsUrl, `${OPENF1_PUBLIC_ORIGIN}/meetings?year=2026`);
    assert.equal(calls[0]?.init?.method, "GET");
    assert.equal(calls[0]?.init?.cache, "force-cache");
    assert.deepEqual(
      (calls[0]?.init as { next?: { revalidate?: number; tags?: string[] } })
        .next,
      {
        revalidate: OPENF1_REVALIDATE_SECONDS,
        tags: ["openf1-meetings-2026"],
      },
    );
    assert.deepEqual(
      (calls[1]?.init as { next?: { revalidate?: number; tags?: string[] } })
        .next,
      {
        revalidate: OPENF1_REVALIDATE_SECONDS,
        tags: ["openf1-sessions-1294"],
      },
    );
    assert.equal(weekend?.meeting.location, "Madrid");
    assert.equal(weekend?.meeting.eventSlug, "spanish-grand-prix-2026-09-13");
    assert.equal(weekend?.sessions[2]?.sessionName, "Race");
    assert.equal(weekend?.sessions.length, 3);
  });

  it("matches a slug that falls inside the meeting window", async () => {
    const { fetchImpl, calls } = publicFetch();
    const weekend = await getOpenF1WeekendByEventSlugWith(
      "spanish-grand-prix-2026-09-11",
      { fetch: fetchImpl },
    );
    assert.equal(weekend?.meeting.meetingKey, 1294);
    assert.deepEqual(
      calls.map((call) => call.url),
      [meetingsUrl, sessionsUrl],
    );
  });

  it("returns null on 404, 503, network errors, and malformed slugs without throwing", async () => {
    const missing = publicFetch({ meetingsStatus: 404 });
    const unavailable = publicFetch({ sessionsStatus: 503 });
    const thrown = publicFetch({ throwOn: "meetings" });
    assert.equal(
      await getOpenF1WeekendByEventSlugWith("spanish-grand-prix-2026-09-13", {
        fetch: missing.fetchImpl,
      }),
      null,
    );
    assert.deepEqual(
      missing.calls.map((call) => call.url),
      [meetingsUrl],
    );
    assert.equal(
      await getOpenF1WeekendByEventSlugWith("spanish-grand-prix-2026-09-13", {
        fetch: unavailable.fetchImpl,
      }),
      null,
    );
    assert.equal(
      await getOpenF1WeekendByEventSlugWith("spanish-grand-prix-2026-09-13", {
        fetch: thrown.fetchImpl,
      }),
      null,
    );
    let fetched = false;
    const badSlug = await getOpenF1WeekendByEventSlugWith("spanish-grand-prix", {
      fetch: async () => {
        fetched = true;
        throw new Error("should not fetch");
      },
    });
    assert.equal(badSlug, null);
    assert.equal(fetched, false);
  });
});
