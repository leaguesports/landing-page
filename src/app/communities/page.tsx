import { CreateCommunityForm } from "@/components/communities/CreateCommunityForm";
import {
  formatCommunitySport,
  formatMemberCount,
  listCommunities,
} from "@/lib/communities/communities";
import { Users } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Communities",
  description:
    "Discover and create communities of athletes in your city — join a Sunday group or start your own.",
};

export default async function CommunitiesPage() {
  const cookie = (await cookies()).toString();
  const communities = await listCommunities({ cookie });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Communities
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Find your people.{" "}
            <span className="text-emerald-400">Play more often.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Open groups athletes create and join — city leagues, regular
            hit-arounds, and the crew you already play with.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Discover
              </p>
              <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
                Communities
              </h2>
            </div>

            {communities.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
                <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                  No communities yet — or they haven’t landed on this
                  environment. Start one and it’ll show here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {communities.map((community) => (
                  <li key={community.id}>
                    <Link
                      href={`/communities/${community.id}`}
                      className="flex items-start justify-between gap-4 rounded-3xl border border-white/8 bg-[#141814] px-5 py-4 transition-colors hover:border-white/16"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {community.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {community.city} ·{" "}
                          {formatCommunitySport(community.sport)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium text-emerald-300 tabular-nums">
                          {formatMemberCount(community.memberCount)}
                        </p>
                        {community.joined ? (
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                            {community.role ?? "joined"}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-600">
                            Open
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-5">
            <CreateCommunityForm />
          </div>
        </div>
      </section>
    </div>
  );
}
