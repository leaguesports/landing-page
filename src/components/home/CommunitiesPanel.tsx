"use client";

import {
  formatCommunitySport,
  formatMemberCount,
  type MyCommunity,
} from "@/lib/communities/communities";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

type CommunitiesPanelProps = {
  initial: MyCommunity[];
  className?: string;
  /** Hub People block — short list + See all. */
  compact?: boolean;
  previewLimit?: number;
};

export function CommunitiesPanel({
  initial,
  className = "mb-8",
  compact = false,
  previewLimit = 4,
}: CommunitiesPanelProps) {
  const visible = compact ? initial.slice(0, previewLimit) : initial;
  const hiddenCount = initial.length - visible.length;

  return (
    <section className={className} aria-labelledby="hub-your-communities">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
          <h3
            id="hub-your-communities"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
          >
            Your communities
          </h3>
        </div>
        <Link
          href="/communities"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          {compact && initial.length > 0 ? (
            "See all"
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Create
            </>
          )}
        </Link>
      </div>

      {initial.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No communities yet. Discover open groups in your city, or start one
            for the people you already play with.
          </p>
          <Link
            href="/communities"
            className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Discover communities
          </Link>
        </div>
      ) : compact ? (
        <ul className="space-y-2">
          {visible.map((community) => (
            <li key={community.id}>
              <Link
                href={`/communities/${community.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">
                    {community.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {community.city} · {formatCommunitySport(community.sport)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-emerald-300/90">
                  {formatMemberCount(community.memberCount)}
                </span>
              </Link>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li>
              <Link
                href="/communities"
                className="inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                See all {initial.length} communities
              </Link>
            </li>
          ) : null}
        </ul>
      ) : (
        <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {initial.map((community) => (
            <li key={community.id} className="min-w-[16rem] max-w-[18rem] shrink-0">
              <Link
                href={`/communities/${community.id}`}
                className="block h-full rounded-3xl border border-white/8 bg-[#141814] px-4 py-4 transition-colors hover:border-white/16"
              >
                <p className="truncate text-sm font-medium text-white">
                  {community.name}
                </p>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {community.city} · {formatCommunitySport(community.sport)}
                </p>
                <p className="mt-3 text-xs font-medium text-emerald-300/90">
                  {formatMemberCount(community.memberCount)}
                  {community.role ? ` · ${community.role}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
