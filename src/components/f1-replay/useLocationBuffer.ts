"use client";

import { appendLocationPoints, type DriverTracks } from "@/lib/openf1/location-buffer";
import {
  bufferFillRatio,
  lookaheadMsForSpeed,
  LOCATION_CHUNK_MS,
  type LoadedRange,
} from "@/lib/openf1/replay";
import { fetchReplayLocationChunk } from "@/lib/openf1/replay-client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

export function useLocationBuffer({
  sessionKey,
  startMs,
  endMs,
  getPlayhead,
  getSpeed,
  enabled,
}: {
  sessionKey: number | null;
  startMs: number;
  endMs: number;
  getPlayhead: () => number;
  getSpeed: () => number;
  enabled: boolean;
}): {
  tracksRef: MutableRefObject<DriverTracks>;
  fill: number;
  primed: boolean;
} {
  const tracksRef = useRef<DriverTracks>(new Map());
  const [fill, setFill] = useState(0);
  const [primed, setPrimed] = useState(false);

  useEffect(() => {
    if (!enabled || sessionKey === null || endMs <= startMs) {
      return;
    }

    let cancelled = false;
    const tracks: DriverTracks = new Map();
    const ranges: LoadedRange[] = [];
    let cursor = startMs;
    let fetching = false;
    tracksRef.current = tracks;

    async function ensure() {
      if (cancelled || fetching || sessionKey === null) return;
      const needUntil = Math.min(
        endMs,
        getPlayhead() + lookaheadMsForSpeed(getSpeed()),
      );
      if (cursor >= needUntil) {
        setPrimed(true);
        return;
      }
      fetching = true;
      const from = cursor;
      const to = Math.min(endMs, from + LOCATION_CHUNK_MS);
      try {
        const chunk = await fetchReplayLocationChunk(
          sessionKey,
          iso(from),
          iso(to),
        );
        if (cancelled) return;
        appendLocationPoints(tracks, chunk.points);
        ranges.push({ from, to });
        cursor = to;
        tracksRef.current = tracks;
        setFill(bufferFillRatio(ranges, startMs, endMs));
        setPrimed(true);
      } catch (error) {
        console.error("[f1-replay] location chunk failed", error);
        setPrimed(true);
      } finally {
        fetching = false;
      }
    }

    void ensure();
    const id = window.setInterval(() => {
      void ensure();
    }, 450);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, sessionKey, startMs, endMs, getPlayhead, getSpeed]);

  return { tracksRef, fill, primed };
}
