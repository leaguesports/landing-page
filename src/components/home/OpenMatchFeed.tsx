"use client";

import { MessageCircle, Plus, Users } from "lucide-react";
import { useState } from "react";

type OpenMatch = {
  id: string;
  sport: string;
  venueLine: string;
  status: string;
  hostName: string;
  hostInitials: string;
};

const MOCK_MATCHES: OpenMatch[] = [
  {
    id: "m1",
    sport: "Padel",
    venueLine: "Virgin Active Claremont • Tomorrow 07:00",
    status: "Need 1 player · Intermediate",
    hostName: "Thandi M.",
    hostInitials: "TM",
  },
  {
    id: "m2",
    sport: "Golf",
    venueLine: "Randpark Golf Club • Sat 08:30",
    status: "Need 2 players · Social",
    hostName: "James K.",
    hostInitials: "JK",
  },
  {
    id: "m3",
    sport: "Rugby watch",
    venueLine: "The Fan Park Sea Point • Kickoff 17:00",
    status: "6 fans watching here",
    hostName: "Sipho N.",
    hostInitials: "SN",
  },
  {
    id: "m4",
    sport: "Soccer",
    venueLine: "Marks Park Emmarentia • Sun 09:00",
    status: "Need 3 players · Casual",
    hostName: "Ayesha R.",
    hostInitials: "AR",
  },
];

export function OpenMatchFeed() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <section className="border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Live activity
            </p>
            <h2 className="font-display text-4xl sm:text-5xl tracking-wide text-white">
              Open matches
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Find a partner or jump into a game near you.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Post match
          </button>
        </div>

        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
          {MOCK_MATCHES.map((match) => {
            const isJoined = joined[match.id];
            return (
              <li
                key={match.id}
                className="rounded-3xl border border-white/8 bg-[#141814] p-5 transition-colors hover:border-white/16 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand)]/15 text-sm font-semibold text-[var(--color-brand)]"
                    aria-hidden
                  >
                    {match.hostInitials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-zinc-200">
                        {match.sport}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {match.hostName}
                      </span>
                    </div>

                    <p className="text-[15px] font-medium text-zinc-100">
                      {match.venueLine}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {match.status}
                    </p>

                    <button
                      type="button"
                      disabled={isJoined}
                      onClick={() =>
                        setJoined((prev) => ({ ...prev, [match.id]: true }))
                      }
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:bg-zinc-700 disabled:text-zinc-400 sm:w-auto"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                      {isJoined ? "Request sent" : "Request to join"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
