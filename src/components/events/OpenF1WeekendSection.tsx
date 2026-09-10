import {
  findOpenF1RaceSession,
  formatOpenF1SessionWhen,
  groupOpenF1SessionsBySaDay,
  openF1CircuitImageUrl,
  openF1CircuitLine,
  openF1CountryFlagUrl,
  openF1SessionStatus,
  type OpenF1Meeting,
  type OpenF1SessionStatus,
  type OpenF1Weekend,
} from "@/lib/openf1/openf1";
import Image from "next/image";
import Link from "next/link";

const STATUS_LABEL: Record<OpenF1SessionStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusClass(status: OpenF1SessionStatus, tone: "event" | "motorsport"): string {
  if (tone === "motorsport") {
    if (status === "live") return "bg-emerald-500/15 text-emerald-400";
    if (status === "cancelled") return "bg-red-500/15 text-red-400";
    if (status === "completed") return "bg-white/8 text-zinc-500";
    return "bg-white/8 text-zinc-300";
  }
  if (status === "live") return "bg-emerald-500/15 text-emerald-300";
  if (status === "cancelled") return "bg-red-500/15 text-red-300";
  if (status === "completed") return "bg-white/8 text-zinc-500";
  return "bg-white/8 text-zinc-300";
}

export function OpenF1CountryFlag({
  meeting,
  className = "h-4 w-7",
}: {
  meeting: Pick<OpenF1Meeting, "countryFlag" | "countryName" | "countryCode">;
  className?: string;
}) {
  const src = openF1CountryFlagUrl(meeting);
  if (!src) return null;
  const label = meeting.countryName.trim() || meeting.countryCode.trim() || "Country flag";
  return (
    <Image
      src={src}
      alt={label}
      width={64}
      height={36}
      className={`rounded-sm object-cover ${className}`}
    />
  );
}

export function OpenF1WeekendSection({
  weekend,
  calendarHref = "/motorsport/f1/calendar",
  eventPageHref,
  replayHref,
  now,
  tone = "event",
}: {
  weekend: OpenF1Weekend;
  calendarHref?: string;
  eventPageHref?: string | null;
  replayHref?: string | null;
  now?: Date;
  tone?: "event" | "motorsport";
}) {
  const clock = now ?? new Date();
  const { meeting, sessions } = weekend;
  const days = groupOpenF1SessionsBySaDay(sessions);
  const race = findOpenF1RaceSession(sessions);
  const circuit = openF1CircuitLine(meeting);
  const raceWhen = race ? formatOpenF1SessionWhen(race.dateStart) : null;
  const motorsport = tone === "motorsport";
  const circuitImage = openF1CircuitImageUrl(meeting);
  const trackLabel = [meeting.circuitShortName, meeting.circuitType]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      id="weekend-timetable"
      aria-labelledby="openf1-weekend-heading"
      className={
        motorsport
          ? "scroll-mt-24 py-12 sm:py-20 px-4 sm:px-6 lg:px-8"
          : "scroll-mt-24 border-b border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      }
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-3">
          <OpenF1CountryFlag meeting={meeting} className="h-5 w-9" />
          <p
            className={
              motorsport
                ? "text-xs font-black uppercase tracking-[0.2em] text-red-400"
                : "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]"
            }
          >
            Formula 1 weekend
          </p>
        </div>
        <h2
          id="openf1-weekend-heading"
          className={
            motorsport
              ? "mt-2 text-xl sm:text-2xl font-black italic uppercase text-white"
              : "mt-2 font-display text-3xl tracking-wide text-white sm:text-4xl"
          }
        >
          Practice, qualifying &amp; race
        </h2>
        <p
          className={
            motorsport
              ? "mt-2 max-w-2xl text-zinc-500 font-bold uppercase tracking-widest text-xs sm:text-sm"
              : "mt-3 max-w-2xl text-base leading-relaxed text-zinc-400"
          }
        >
          {meeting.meetingOfficialName}. {circuit}
          {raceWhen ? ` · Race ${raceWhen} SAST` : ""}.
        </p>

        {meeting.isCancelled ? (
          <p
            className={
              motorsport
                ? "mt-4 text-sm font-bold uppercase tracking-widest text-red-400"
                : "mt-4 text-sm font-medium text-red-300"
            }
          >
            This meeting is marked cancelled in the official timetable.
          </p>
        ) : null}

        {circuitImage ? (
          <figure
            className={
              motorsport
                ? "mt-8 max-w-md overflow-hidden rounded-lg border border-white/10 bg-black/40 p-4 sm:p-6"
                : "mt-8 max-w-md overflow-hidden rounded-2xl border border-white/8 bg-[#141814] p-4 sm:p-6"
            }
          >
            <Image
              src={circuitImage}
              alt={`${meeting.circuitShortName} track map`}
              width={640}
              height={480}
              className="mx-auto h-auto w-full max-w-sm object-contain"
            />
            {trackLabel ? (
              <figcaption className="mt-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {trackLabel}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        {days.length > 0 ? (
          <ol className="mt-8 grid gap-6 lg:grid-cols-3">
            {days.map((group) => (
              <li
                key={group.day}
                className={
                  motorsport
                    ? "rounded-lg border border-white/10 bg-white/2 p-4 sm:p-5"
                    : "rounded-2xl border border-white/8 bg-[#141814] px-4 py-5 sm:px-5"
                }
              >
                <h3
                  className={
                    motorsport
                      ? "text-[10px] font-black uppercase tracking-widest text-zinc-500"
                      : "text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  }
                >
                  {group.label}
                </h3>
                <ol className="mt-4 flex flex-col gap-3">
                  {group.sessions.map((session) => {
                    const status = openF1SessionStatus(session, clock);
                    const when = formatOpenF1SessionWhen(session.dateStart);
                    return (
                      <li
                        key={session.sessionKey}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium text-white sm:text-base ${status === "cancelled" ? "line-through opacity-70" : ""}`}
                          >
                            {session.sessionName}
                          </p>
                          {when ? (
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {when} SAST
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusClass(status, tone)}`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">
            Session times for this meeting have not been published yet.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={calendarHref}
            className={
              motorsport
                ? "inline-flex min-h-11 items-center text-xs font-black uppercase italic tracking-wider text-zinc-400 hover:text-white"
                : "inline-flex min-h-11 items-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            }
          >
            Full F1 calendar
          </Link>
          {eventPageHref ? (
            <Link
              href={eventPageHref}
              className={
                motorsport
                  ? "inline-flex min-h-11 items-center text-xs font-black uppercase italic tracking-wider text-zinc-400 hover:text-white"
                  : "inline-flex min-h-11 items-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              }
            >
              Race hub
            </Link>
          ) : null}
          {replayHref ? (
            <Link
              href={replayHref}
              className={
                motorsport
                  ? "inline-flex min-h-11 items-center text-xs font-black uppercase italic tracking-wider text-zinc-400 hover:text-white"
                  : "inline-flex min-h-11 items-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              }
            >
              Race replay
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
