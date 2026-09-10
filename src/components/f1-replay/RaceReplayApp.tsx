"use client";

import {
  fetchReplayBootstrap,
  fetchReplayBootstrapByEventSlug,
} from "@/lib/openf1/replay-client";
import type { ReplayBootstrap } from "@/lib/openf1/replay";
import { useCallback, useEffect, useRef, useState } from "react";
import { createReplayEngine, type ReplayEngine } from "./createReplayEngine";
import { RaceReplayHud } from "./RaceReplayHud";
import { useLocationBuffer } from "./useLocationBuffer";

function readTSeconds(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URL(window.location.href).searchParams.get("t");
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function writeTSeconds(seconds: number) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("t", String(Math.max(0, Math.round(seconds))));
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function RaceReplayApp({
  sessionKey,
  eventSlug,
  variant = "embed",
}: {
  sessionKey?: number | null;
  eventSlug?: string | null;
  variant?: "embed" | "page";
}) {
  const [bootstrap, setBootstrap] = useState<ReplayBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [follow, setFollow] = useState<number | null>(null);
  const [hudTime, setHudTime] = useState(0);

  const playheadRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const followRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReplayEngine | null>(null);

  const getPlayhead = useCallback(() => playheadRef.current, []);
  const getSpeed = useCallback(() => speedRef.current, []);
  const getFollow = useCallback(() => followRef.current, []);
  const getPlaying = useCallback(() => playingRef.current, []);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    followRef.current = follow;
    engineRef.current?.setFollow(follow);
  }, [follow]);

  useEffect(() => {
    let cancelled = false;
    const load = sessionKey
      ? fetchReplayBootstrap(sessionKey)
      : eventSlug
        ? fetchReplayBootstrapByEventSlug(eventSlug)
        : Promise.reject(new Error("Missing session"));
    void load
      .then((data) => {
        if (cancelled) return;
        setBootstrap(data);
        const t = readTSeconds();
        const start = data.window.startMs;
        const offset = t === null ? 0 : Math.min(data.window.durationMs, t * 1000);
        playheadRef.current = start + offset;
        setHudTime(playheadRef.current);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Replay unavailable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionKey, eventSlug]);

  const { tracksRef, fill, primed } = useLocationBuffer({
    sessionKey: bootstrap?.config.sessionKey ?? sessionKey ?? null,
    startMs: bootstrap?.window.startMs ?? 0,
    endMs: bootstrap?.window.endMs ?? 0,
    getPlayhead,
    getSpeed,
    enabled: Boolean(bootstrap),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bootstrap) return;
    const engine = createReplayEngine({
      canvas,
      circuit: bootstrap.circuit,
      drivers: bootstrap.drivers,
      getPlayhead,
      getTracks: () => tracksRef.current,
      getFollow,
      getPlaying,
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [bootstrap, getPlayhead, getFollow, getPlaying, tracksRef]);

  useEffect(() => {
    if (!bootstrap) return;
    let raf = 0;
    let last = performance.now();
    let lastHud = 0;
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      if (playingRef.current) {
        const next = Math.min(
          bootstrap.window.endMs,
          playheadRef.current + dt * speedRef.current,
        );
        playheadRef.current = next;
        if (next >= bootstrap.window.endMs) {
          playingRef.current = false;
          setPlaying(false);
        }
      }
      if (now - lastHud > 100) {
        lastHud = now;
        setHudTime(playheadRef.current);
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [bootstrap]);

  function handleScrub(ms: number) {
    if (!bootstrap) return;
    const clamped = Math.min(bootstrap.window.endMs, Math.max(bootstrap.window.startMs, ms));
    playheadRef.current = clamped;
    setHudTime(clamped);
    writeTSeconds((clamped - bootstrap.window.startMs) / 1000);
  }

  const heightClass =
    variant === "page" ? "h-[calc(100dvh-5.5rem)] min-h-[32rem]" : "h-[min(78vh,46rem)] min-h-[28rem]";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f0c] ${heightClass}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <RaceReplayHud
        bootstrap={bootstrap}
        playheadMs={hudTime}
        playing={playing}
        speed={speed}
        follow={follow}
        fill={fill}
        started={started}
        primed={primed}
        loading={loading}
        error={error}
        onTogglePlay={() => {
          if (!started) return;
          setPlaying((value) => !value);
        }}
        onSpeed={setSpeed}
        onScrub={handleScrub}
        onFollow={setFollow}
        onStart={() => {
          if (!bootstrap || !primed) return;
          setStarted(true);
          setPlaying(true);
        }}
        onRestart={() => {
          if (!bootstrap) return;
          playheadRef.current = bootstrap.window.startMs;
          setHudTime(bootstrap.window.startMs);
          setPlaying(true);
          writeTSeconds(0);
        }}
      />
    </div>
  );
}
