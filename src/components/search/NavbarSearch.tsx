"use client";

import { useVenueNameSearch } from "@/hooks/useVenueNameSearch";
import {
  NAVBAR_SEARCH_START,
  navbarSearchSubmitHref,
  planNavbarSearch,
  type NavbarSearchGroup,
} from "@/lib/search/navbarSearch";
import { LoaderCircle, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

const INPUT_CLASS =
  "h-10 w-full min-w-0 rounded-full border border-white/10 bg-black/30 pr-10 pl-9 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 [&::-webkit-search-cancel-button]:hidden";

const GROUP_LABEL: Record<NavbarSearchGroup | "venue", string> = {
  match: "Go to",
  name: "Venue name",
  venue: "Venues",
  sport: "Sports",
  place: "Places",
  start: "Explore",
};

type SearchRow = {
  id: string;
  label: string;
  detail: string;
  href: string;
  group: NavbarSearchGroup | "venue";
};

function venueQueryFromUrl(pathname: string, query: string | null): string {
  if (pathname !== "/venues") return "";
  return query?.trim() ?? "";
}

export function NavbarSearchFallback() {
  return (
    <div className="relative min-w-0">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
      <input
        type="search"
        readOnly
        tabIndex={-1}
        placeholder="Search venues, sports, cities…"
        aria-hidden
        className={INPUT_CLASS}
      />
    </div>
  );
}

export function NavbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQuery = venueQueryFromUrl(pathname, params.get("q"));
  const navigationKey = `${pathname}\n${urlQuery}`;
  const listId = useId();
  const inputId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [field, setField] = useState(() => ({
    key: navigationKey,
    query: urlQuery,
    open: Boolean(urlQuery),
    active: -1,
  }));
  if (field.key !== navigationKey) {
    setField({
      key: navigationKey,
      query: urlQuery,
      open: Boolean(urlQuery),
      active: -1,
    });
  }
  const query = field.key === navigationKey ? field.query : urlQuery;
  const open = field.key === navigationKey ? field.open : Boolean(urlQuery);
  const active = field.key === navigationKey ? field.active : -1;
  const venueSearch = useVenueNameSearch(query);
  const trimmed = query.trim();
  const plan = useMemo(() => planNavbarSearch(trimmed), [trimmed]);

  const rows = useMemo(() => {
    if (!trimmed) return [...NAVBAR_SEARCH_START];
    const venues: SearchRow[] = venueSearch.results.slice(0, 5).map((venue) => ({
      id: `venue-${venue.cmsId}`,
      label: venue.name,
      detail: venue.city ?? "South Africa",
      href: `/venues/${venue.slug}`,
      group: "venue",
    }));
    const combined = [
      ...(plan.destination ? [plan.destination] : []),
      ...venues,
      ...plan.catalog,
      ...(plan.nameSearch ? [plan.nameSearch] : []),
    ];
    const seen = new Set<string>();
    return combined.filter((row) => {
      if (seen.has(row.href)) return false;
      seen.add(row.href);
      return true;
    });
  }, [plan, trimmed, venueSearch.results]);

  const updateField = useCallback(
    (next: { query?: string; open?: boolean; active?: number }) => {
      setField((current) => {
        const base =
          current.key === navigationKey
            ? current
            : {
                key: navigationKey,
                query: urlQuery,
                open: Boolean(urlQuery),
                active: -1,
              };
        return { ...base, key: navigationKey, ...next };
      });
    },
    [navigationKey, urlQuery],
  );

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        updateField({ open: false });
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, updateField]);

  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${listId}-option-${active}`)?.scrollIntoView({
      block: "nearest",
    });
  }, [active, listId]);

  function go(href: string) {
    updateField({ open: false, active: -1 });
    router.push(href);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const highlighted = active >= 0 ? rows[active] : null;
    if (highlighted) {
      go(highlighted.href);
      return;
    }
    go(navbarSearchSubmitHref(trimmed, venueSearch.results));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      updateField({
        open: true,
        active: Math.min(active + 1, rows.length - 1),
      });
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      updateField({
        open: true,
        active: Math.max(active - 1, 0),
      });
      return;
    }
    if (event.key === "Escape") {
      updateField({ open: false, active: -1 });
    }
  }

  const showPanel = open && (rows.length > 0 || trimmed.length > 0);
  const showHint =
    open && venueSearch.tooShort && plan.catalog.length === 0 && !plan.destination;
  const showEmpty =
    open &&
    venueSearch.empty &&
    plan.catalog.length === 0 &&
    !plan.destination &&
    venueSearch.results.length === 0;
  const showError = open && Boolean(venueSearch.error);

  return (
    <form
      ref={rootRef}
      role="search"
      onSubmit={handleSubmit}
      className="relative min-w-0"
    >
      <label className="sr-only" htmlFor={inputId}>
        Search venues, sports, and cities
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={
          active >= 0 ? `${listId}-option-${active}` : undefined
        }
        value={query}
        placeholder="Search venues, sports, cities…"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => {
          updateField({ query: event.target.value, active: -1, open: true });
        }}
        onFocus={() => updateField({ open: true })}
        onKeyDown={handleKeyDown}
        className={INPUT_CLASS}
      />
      {venueSearch.pending ? (
        <LoaderCircle
          className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500"
          aria-hidden
        />
      ) : trimmed ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            updateField({ query: "", active: -1, open: true });
          }}
          className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 hover:bg-white/8 hover:text-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}

      {showPanel ? (
        <div className="absolute top-[calc(100%+0.4rem)] left-0 z-[70] w-[min(28rem,calc(100vw-1.5rem))] max-sm:fixed max-sm:inset-x-3 max-sm:top-[4.35rem] max-sm:w-auto sm:w-[28rem]">
          <ul
            id={listId}
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-[min(24rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#141814] py-1 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.75)]"
          >
            {rows.map((row, index) => {
              const heading =
                index === 0 || rows[index - 1]?.group !== row.group
                  ? GROUP_LABEL[row.group]
                  : null;
              const selected = index === active;
              return (
                <li key={row.id} role="presentation">
                  {heading ? (
                    <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                      {heading}
                    </p>
                  ) : null}
                  <button
                    id={`${listId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => updateField({ active: index })}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => go(row.href)}
                    className={[
                      "flex w-full min-h-11 items-center justify-between gap-3 px-3 py-2 text-left",
                      selected ? "bg-white/8" : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">
                        {row.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500">
                        {row.detail}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {venueSearch.pending && trimmed ? (
              <li className="px-3 py-2 text-sm text-zinc-400">Searching venues…</li>
            ) : null}
            {showHint ? (
              <li className="px-3 py-2 text-sm text-zinc-500">{venueSearch.hint}</li>
            ) : null}
            {showError ? (
              <li className="px-3 py-2 text-sm text-amber-300/90">
                {venueSearch.errorCopy}
              </li>
            ) : null}
            {showEmpty ? (
              <li className="px-3 py-2 text-sm text-zinc-500">
                {venueSearch.emptyCopy}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
