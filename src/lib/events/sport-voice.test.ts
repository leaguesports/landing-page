import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { eventSportVoice } from "./sport-voice.ts";

describe("event sport voice", () => {
  it("speaks rugby as a match at kickoff", () => {
    const voice = eventSportVoice({ sportSlug: "rugby", sportName: "Rugby" });
    assert.equal(voice.eventNoun, "match");
    assert.equal(voice.startLabel, "Kickoff");
    assert.equal(voice.hostLabel, "Ground");
    assert.equal(voice.feedHeading, "Match updates");
    assert.match(voice.feedEmpty, /try or penalty/);
    assert.equal(voice.accentClass, "text-emerald-800");
  });

  it("speaks soccer as a match with a stadium", () => {
    const voice = eventSportVoice({ sportSlug: "soccer", sportName: "Soccer" });
    assert.equal(voice.hostLabel, "Stadium");
    assert.match(voice.feedEmpty, /goal or card/);
    assert.equal(voice.accentClass, "text-sky-800");
  });

  it("speaks cricket from the first ball", () => {
    const voice = eventSportVoice({ sportSlug: "cricket", sportName: "Cricket" });
    assert.equal(voice.startLabel, "First ball");
    assert.equal(voice.feedHeading, "Score updates");
    assert.match(voice.poolLine, /first ball/);
    assert.equal(voice.accentClass, "text-amber-800");
  });

  it("speaks a grand prix as a race even without a sport slug", () => {
    const voice = eventSportVoice({
      title: "Spanish Grand Prix",
      sportName: "Formula 1",
      circuitLine: "Madring, Madrid, Spain",
    });
    assert.equal(voice.eventNoun, "race");
    assert.equal(voice.startLabel, "Lights out");
    assert.equal(voice.feedHeading, "Race updates");
    assert.equal(voice.accentClass, "text-rose-800");
  });

  it("keeps a rugby page a match when a circuit line is absent", () => {
    const voice = eventSportVoice({ sportSlug: "rugby", title: "Springboks vs All Blacks" });
    assert.equal(voice.eventNoun, "match");
  });
});
