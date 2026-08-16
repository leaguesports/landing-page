"use client";

import {
  buildSearchPath,
  filterSuggestions,
  type IntentMode,
  type SearchSuggestion,
} from "@/data/cities";
import { MapPin, Search, Trophy, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";

type HeroSearchProps = {
  onIntentChange?: (intent: IntentMode) => void;
};

export function HeroSearch({ onIntentChange }: HeroSearchProps) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [intent, setIntent] = useState<IntentMode>("watch");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchSuggestion | null>(null);
  const [open, setOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();

  const suggestions = filterSuggestions(query);

  useEffect(() => {
    onIntentChange?.(intent);
  }, [intent, onIntentChange]);

  function selectSuggestion(suggestion: SearchSuggestion) {
    setSelected(suggestion);
    setQuery(suggestion.label);
    setOpen(false);
    inputRef.current?.focus();
  }

  function navigate(path: string) {
    startTransition(() => {
      router.push(path);
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const path = buildSearchPath(intent, query, selected);
    navigate(path);
  }

  function handleNearMe() {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      () => {
        const nearQuery = "Johannesburg";
        const suggestion: SearchSuggestion = {
          id: "city-johannesburg",
          label: "Johannesburg",
          kind: "city",
          citySlug: "johannesburg",
        };
        setQuery(nearQuery);
        setSelected(suggestion);
        setGeoStatus("idle");
        setOpen(false);
        navigate(buildSearchPath(intent, nearQuery, suggestion));
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  const isWatch = intent === "watch";

  return (
    <div className="relative z-20 w-full max-w-2xl overflow-visible">
      <div
        className="mb-3 inline-flex rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md"
        role="tablist"
        aria-label="Search intent"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isWatch}
          onClick={() => setIntent("watch")}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            isWatch
              ? "bg-sky-500 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Tv className="h-4 w-4 shrink-0" aria-hidden />
          Watch
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isWatch}
          onClick={() => setIntent("play")}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !isWatch
              ? "bg-emerald-500 text-zinc-950"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Trophy className="h-4 w-4 shrink-0" aria-hidden />
          Play
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-3 overflow-visible">
        <div
          className={`relative flex flex-col gap-2 rounded-2xl border border-white/12 bg-black/55 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl ring-2 ring-transparent transition sm:flex-row ${
            isWatch
              ? "focus-within:ring-sky-400/30"
              : "focus-within:ring-emerald-400/30"
          }`}
        >
          <div className="relative min-w-0 flex-1 overflow-visible">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={query}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={open && suggestions.length > 0}
              placeholder="Suburb, city, or sport…"
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 150);
              }}
              className="w-full min-h-12 rounded-xl bg-transparent pl-11 pr-3 text-[15px] text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNearMe}
              disabled={geoStatus === "loading"}
              className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors disabled:opacity-60 sm:flex-none ${
                isWatch
                  ? "border-sky-400/30 text-sky-200 hover:bg-sky-400/10"
                  : "border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/10"
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {geoStatus === "loading" ? "Locating…" : "Near Me"}
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors disabled:opacity-70 sm:flex-none ${
                isWatch
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
              }`}
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              Search
            </button>
          </div>

          {/* Anchored to the full search shell so it isn't clipped by row layout */}
          {open && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute left-0 right-0 bottom-[calc(100%+0.5rem)] z-[60] max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#121512] p-1 shadow-2xl"
            >
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  role="option"
                  aria-selected={selected?.id === s.id}
                >
                  <button
                    type="button"
                    className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left hover:bg-white/6"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(s)}
                  >
                    <span className="text-sm font-medium text-white">
                      {s.label}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                      {s.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {geoStatus === "error" && (
          <p className="text-xs text-amber-300/90">
            Couldn&apos;t access location. Enter a suburb or city instead.
          </p>
        )}
      </form>
    </div>
  );
}
