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
        // Prefer Johannesburg hub until reverse-geocode is wired to Sanity locations.
        const nearQuery = "Johannesburg";
        setQuery(nearQuery);
        setSelected({
          id: "city-johannesburg",
          label: "Johannesburg",
          kind: "city",
          citySlug: "johannesburg",
        });
        setGeoStatus("idle");
        setOpen(false);
        navigate(buildSearchPath(intent, nearQuery, {
          id: "city-johannesburg",
          label: "Johannesburg",
          kind: "city",
          citySlug: "johannesburg",
        }));
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  const accent =
    intent === "watch"
      ? {
          tab: "bg-blue-500 text-white",
          idle: "bg-white/5 text-zinc-400 hover:text-white",
          ring: "focus-within:ring-blue-500/40",
          btn: "bg-blue-500 hover:bg-blue-400 text-white",
          near: "border-blue-500/40 text-blue-300 hover:bg-blue-500/10",
        }
      : {
          tab: "bg-green-500 text-white",
          idle: "bg-white/5 text-zinc-400 hover:text-white",
          ring: "focus-within:ring-green-500/40",
          btn: "bg-green-500 hover:bg-green-400 text-white",
          near: "border-green-500/40 text-green-300 hover:bg-green-500/10",
        };

  return (
    <div className="w-full max-w-3xl">
      {/* Intent tabs */}
      <div
        className="inline-flex rounded-xl border border-white/10 bg-zinc-950/80 p-1 mb-4"
        role="tablist"
        aria-label="Search intent"
      >
        <button
          type="button"
          role="tab"
          aria-selected={intent === "watch"}
          onClick={() => setIntent("watch")}
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black uppercase italic tracking-wider transition-colors ${
            intent === "watch" ? accent.tab : accent.idle
          }`}
        >
          <Tv className="h-4 w-4 shrink-0" aria-hidden />
          Watch Sports
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={intent === "play"}
          onClick={() => setIntent("play")}
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black uppercase italic tracking-wider transition-colors ${
            intent === "play" ? accent.tab : accent.idle
          }`}
        >
          <Trophy className="h-4 w-4 shrink-0" aria-hidden />
          Play Sports
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div
          className={`relative flex flex-col sm:flex-row gap-2 rounded-2xl border border-white/10 bg-zinc-950/90 p-2 shadow-xl shadow-black/40 ring-2 ring-transparent ${accent.ring}`}
        >
          <div className="relative flex-1 min-w-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
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
              placeholder="Enter suburb, city, or sport (e.g. Sea Point, Padel, Rugby)..."
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                // Delay so suggestion click registers
                window.setTimeout(() => setOpen(false), 150);
              }}
              className="w-full min-h-12 rounded-xl bg-transparent pl-10 pr-3 text-sm sm:text-base text-white placeholder:text-zinc-500 outline-none"
            />

            {open && suggestions.length > 0 && (
              <ul
                id={listId}
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-64 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
              >
                {suggestions.map((s) => (
                  <li key={s.id} role="option" aria-selected={selected?.id === s.id}>
                    <button
                      type="button"
                      className="flex w-full min-h-11 items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(s)}
                    >
                      <span className="text-sm font-semibold text-white">
                        {s.label}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {s.kind}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNearMe}
              disabled={geoStatus === "loading"}
              className={`inline-flex min-h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-60 ${accent.near}`}
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {geoStatus === "loading" ? "Locating…" : "Near Me"}
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex min-h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-5 sm:px-6 text-xs sm:text-sm font-black uppercase italic tracking-wider transition-colors disabled:opacity-70 ${accent.btn}`}
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              Search Venues
            </button>
          </div>
        </div>

        {geoStatus === "error" && (
          <p className="text-xs text-amber-400/90 font-medium">
            Couldn&apos;t access location. Enter a suburb or city instead.
          </p>
        )}
      </form>
    </div>
  );
}
