import { OpenF1CountryFlag } from "@/components/events/OpenF1WeekendSection";
import {
  formatOpenF1SessionWhen,
  openF1CountryFlagUrl,
  type OpenF1Meeting,
} from "@/lib/openf1/openf1";
import { meetingMatchesEventSlug } from "@/lib/openf1/upstream";
import type {
  ReplayCatalogItem,
  ReplayCatalogStatus,
} from "@/lib/openf1/replay-catalog";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

const STATUS_LABEL: Record<ReplayCatalogStatus, string> = {
  replay: "Replay ready",
  live: "Live",
  upcoming: "After lights out",
};

function statusClass(
  status: ReplayCatalogStatus,
  tone: "replay" | "motorsport",
): string {
  if (tone === "motorsport") {
    if (status === "live") return "bg-emerald-500/15 text-emerald-400";
    if (status === "replay") return "bg-white/8 text-zinc-300";
    return "bg-white/8 text-zinc-500";
  }
  if (status === "live") return "bg-emerald-500/15 text-emerald-300";
  if (status === "replay") return "bg-[var(--color-brand)]/15 text-[var(--color-brand)]";
  return "bg-white/8 text-zinc-400";
}

function ctaLabel(status: ReplayCatalogStatus): string {
  if (status === "replay") return "Watch replay";
  if (status === "live") return "Watch live";
  return "Open weekend";
}

function isCurrentRace(
  race: ReplayCatalogItem,
  eventSlug?: string | null,
  meetingKey?: number | null,
): boolean {
  if (meetingKey && race.meetingKey === meetingKey) return true;
  if (!eventSlug) return false;
  if (race.eventSlug === eventSlug) return true;
  return meetingMatchesEventSlug(race, eventSlug);
}

export function RaceReplayCatalog({
  races,
  year,
  years = [],
  currentEventSlug,
  currentMeetingKey,
  variant = "grid",
  tone = "replay",
  heading = "Race replays",
  description,
  yearHref,
  showYearNav = false,
  libraryHref = "/motorsport/f1/replay",
}: {
  races: readonly ReplayCatalogItem[];
  year: number;
  years?: readonly number[];
  currentEventSlug?: string | null;
  currentMeetingKey?: number | null;
  variant?: "grid" | "compact";
  tone?: "replay" | "motorsport";
  heading?: string;
  description?: string;
  yearHref?: (year: number) => string;
  showYearNav?: boolean;
  libraryHref?: string | null;
}) {
  const motorsport = tone === "motorsport";
  const copy =
    description ??
    `OpenF1 GPS from ${year}. Completed Grands Prix play back now; upcoming weekends open after lights out.`;
  const headingId = "race-replay-catalog-heading";

  return (
    <section
      id="race-replays"
      aria-labelledby={headingId}
      className={
        motorsport
          ? "scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8"
          : "scroll-mt-24"
      }
    >
      <div className={motorsport ? "mx-auto max-w-7xl" : undefined}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className={
                motorsport
                  ? "text-xs font-black uppercase tracking-[0.2em] text-red-400"
                  : "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]"
              }
            >
              3D race replay
            </p>
            {motorsport ? (
              <div className="bg-red-600 mt-3 inline-block px-6 py-1.5 transform -skew-x-6">
                <h2
                  id={headingId}
                  className="text-white font-black italic uppercase text-2xl transform skew-x-6"
                >
                  {heading}
                </h2>
              </div>
            ) : (
              <h2
                id={headingId}
                className="mt-2 font-display text-3xl tracking-wide text-white sm:text-4xl"
              >
                {heading}
              </h2>
            )}
            <p
              className={
                motorsport
                  ? "mt-3 max-w-2xl text-zinc-500 font-bold uppercase tracking-widest text-xs sm:text-sm"
                  : "mt-3 max-w-2xl text-base leading-relaxed text-zinc-400"
              }
            >
              {copy}
            </p>
          </div>
          {libraryHref ? (
            <Link
              href={libraryHref}
              className={
                motorsport
                  ? "hidden sm:flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white hover:underline"
                  : "inline-flex min-h-11 items-center text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              }
            >
              All seasons
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>

        {showYearNav && years.length > 0 && yearHref ? (
          <nav aria-label="Replay season" className="mt-6 flex flex-wrap gap-2">
            {years.map((item) => {
              const active = item === year;
              return (
                <Link
                  key={item}
                  href={yearHref(item)}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "inline-flex min-h-11 items-center rounded-full bg-[var(--color-brand)] px-4 text-sm font-semibold text-zinc-950"
                      : "inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-zinc-950"
                  }
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        ) : null}

        {races.length === 0 ? (
          <p className="mt-8 border border-dashed border-white/10 px-4 py-10 text-sm text-zinc-500">
            No race weekends with GPS replay for {year} yet.
          </p>
        ) : variant === "compact" ? (
          <ol className="mt-8 divide-y border-y border-white/8 divide-white/8">
            {races.map((race) => (
              <li key={race.meetingKey}>
                <CatalogRow
                  race={race}
                  current={isCurrentRace(race, currentEventSlug, currentMeetingKey)}
                  tone={tone}
                />
              </li>
            ))}
          </ol>
        ) : motorsport ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {races.map((race) => (
              <MotorsportCard
                key={race.meetingKey}
                race={race}
                current={isCurrentRace(race, currentEventSlug, currentMeetingKey)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {races.map((race) => (
              <ReplayCard
                key={race.meetingKey}
                race={race}
                current={isCurrentRace(race, currentEventSlug, currentMeetingKey)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CatalogRow({
  race,
  current,
  tone,
}: {
  race: ReplayCatalogItem;
  current: boolean;
  tone: "replay" | "motorsport";
}) {
  const when = formatOpenF1SessionWhen(race.raceStartIso);
  return (
    <Link
      href={race.replayHref}
      aria-current={current ? "page" : undefined}
      className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-4 text-sm transition-colors hover:text-white"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="w-8 shrink-0 font-mono text-xs text-zinc-500">
          {String(race.round).padStart(2, "0")}
        </span>
        <FlagThumb meeting={race} />
        <span className="min-w-0">
          <span className="block truncate font-medium text-white">
            {race.meetingName}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {race.circuitShortName}
            {when ? ` · ${when}` : ""}
          </span>
        </span>
      </span>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(race.status, tone)}`}
      >
        {current ? "Watching" : STATUS_LABEL[race.status]}
      </span>
    </Link>
  );
}

function ReplayCard({
  race,
  current,
}: {
  race: ReplayCatalogItem;
  current: boolean;
}) {
  const when = formatOpenF1SessionWhen(race.raceStartIso);
  return (
    <Link
      href={race.replayHref}
      aria-current={current ? "page" : undefined}
      className={`group flex min-h-44 flex-col justify-between rounded-2xl border p-5 transition-colors ${
        current
          ? "border-[var(--color-brand)]/50 bg-[var(--color-brand)]/8"
          : "border-white/8 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Round {race.round}
          </p>
          <h3 className="mt-1 font-display text-xl tracking-wide text-white">
            {race.meetingName}
          </h3>
        </div>
        <FlagThumb meeting={race} className="h-5 w-8" />
      </div>
      <div className="mt-6 space-y-2 text-sm text-zinc-400">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
          <span>{race.circuitLine}</span>
        </p>
        {when ? (
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
            <span>{when}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(race.status, "replay")}`}
        >
          {current ? "Watching" : STATUS_LABEL[race.status]}
        </span>
        <span className="text-sm font-medium text-[var(--color-brand)]">
          {ctaLabel(race.status)}
        </span>
      </div>
    </Link>
  );
}

function MotorsportCard({
  race,
  current,
}: {
  race: ReplayCatalogItem;
  current: boolean;
}) {
  const when = formatOpenF1SessionWhen(race.raceStartIso);
  return (
    <Link
      href={race.replayHref}
      aria-current={current ? "page" : undefined}
      className="group relative cursor-pointer transition-all duration-300"
    >
      <div className="absolute inset-0 transform -skew-x-3 translate-x-1.5 translate-y-1.5 bg-zinc-700 transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5" />
      <div
        className={`relative overflow-hidden border bg-zinc-950 transform -skew-x-3 ${
          current ? "border-red-600/60" : "border-zinc-800 group-hover:border-red-600/40"
        }`}
      >
        <div
          className={`h-1 w-full ${current ? "bg-red-600" : "bg-zinc-700 group-hover:bg-red-600/80"}`}
        />
        <div className="transform skew-x-3 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Round {race.round}
            </span>
            <FlagThumb meeting={race} />
          </div>
          <h3 className="font-black italic uppercase leading-tight text-white group-hover:text-red-400">
            {race.meetingName}
          </h3>
          <p className="mb-5 mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
            {race.circuitShortName}
          </p>
          <div className="mb-5 space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
              <span>{race.location}</span>
            </p>
            {when ? (
              <p className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
                <span>{when}</span>
              </p>
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-zinc-800 pt-4">
            <span
              className={`inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(race.status, "motorsport")}`}
            >
              {current ? "Watching" : STATUS_LABEL[race.status]}
            </span>
            <span className="text-xs font-black uppercase italic text-red-500">
              {ctaLabel(race.status)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FlagThumb({
  meeting,
  className = "h-4 w-7",
}: {
  meeting: Pick<OpenF1Meeting, "countryFlag" | "countryName" | "countryCode">;
  className?: string;
}) {
  if (!openF1CountryFlagUrl(meeting)) {
    return (
      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {meeting.countryCode}
      </span>
    );
  }
  return <OpenF1CountryFlag meeting={meeting} className={className} />;
}
