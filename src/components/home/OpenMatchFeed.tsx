"use client";

import { MessageCircle, Plus, Users } from "lucide-react";
import { useState } from "react";

type OpenMatch = {
  id: string;
  sportBadge: string;
  venueLine: string;
  status: string;
  hostName: string;
  hostInitials: string;
};

const MOCK_MATCHES: OpenMatch[] = [
  {
    id: "m1",
    sportBadge: "🎾 Padel",
    venueLine: "Virgin Active Claremont • Tomorrow 07:00 AM",
    status: "Need 1 player (Intermediate)",
    hostName: "Thandi M.",
    hostInitials: "TM",
  },
  {
    id: "m2",
    sportBadge: "⛳ Golf",
    venueLine: "Randpark Golf Club • Sat 08:30 AM",
    status: "Need 2 players (Social)",
    hostName: "James K.",
    hostInitials: "JK",
  },
  {
    id: "m3",
    sportBadge: "🏉 Rugby Watch Party",
    venueLine: "The Fan Park Sea Point • Kickoff 17:00",
    status: "6 fans watching here",
    hostName: "Sipho N.",
    hostInitials: "SN",
  },
  {
    id: "m4",
    sportBadge: "⚽ Soccer",
    venueLine: "Marks Park Emmarentia • Sun 09:00 AM",
    status: "Need 3 players (Casual)",
    hostName: "Ayesha R.",
    hostInitials: "AR",
  },
];

export function OpenMatchFeed() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
          <div>
            <div className="bg-green-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
              <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                Open Matches
              </h2>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1 sm:ml-4">
              Find a partner or join a match near you
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-green-300 transition-colors hover:bg-green-500 hover:text-black"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Post Match / Request Partner
          </button>
        </div>

        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {MOCK_MATCHES.map((match) => {
            const isJoined = joined[match.id];
            return (
              <li
                key={match.id}
                className="rounded-xl border border-zinc-800/90 bg-zinc-950/90 p-4 sm:p-5 transition-colors hover:border-green-500/30"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-white"
                    aria-hidden
                  >
                    {match.hostInitials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-200">
                        {match.sportBadge}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Hosted by {match.hostName}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-zinc-300 mb-1">
                      {match.venueLine}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-4">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {match.status}
                    </p>

                    <button
                      type="button"
                      disabled={isJoined}
                      onClick={() =>
                        setJoined((prev) => ({ ...prev, [match.id]: true }))
                      }
                      className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-xs font-black uppercase italic tracking-wider text-black transition-colors hover:bg-green-400 disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                      {isJoined ? "Request sent" : "Request to Join"}
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
