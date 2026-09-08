"use client";

import { FeatureCard } from "@/app/roadmap/_components/FeatureCard";
import { RequestsPanel } from "@/app/roadmap/_components/RequestsPanel";
import {
  ROADMAP_FEATURE_FILTER_OPTIONS,
  ROADMAP_FEATURES_EMPTY_COPY,
  ROADMAP_SORT_OPTIONS,
  listRoadmapFeatures,
  partitionFeaturesForBoard,
  type PublicRoadmapFeature,
  type PublicRoadmapRequest,
  type RoadmapFeatureFilter,
  type RoadmapFeatureSort,
} from "@/lib/roadmap/roadmap";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RoadmapTab = "features" | "requests";

type RoadmapBoardProps = {
  initialFeatures: PublicRoadmapFeature[];
  initialRequests: PublicRoadmapRequest[];
  loadError?: string | null;
};

export function RoadmapBoard({
  initialFeatures,
  initialRequests,
  loadError = null,
}: RoadmapBoardProps) {
  const [tab, setTab] = useState<RoadmapTab>("features");
  const [filter, setFilter] = useState<RoadmapFeatureFilter>("ALL");
  const [sort, setSort] = useState<RoadmapFeatureSort>("votes");
  const [features, setFeatures] = useState(initialFeatures);
  const [requests, setRequests] = useState(initialRequests);
  const [watchingIds, setWatchingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(loadError);
  const [loading, setLoading] = useState(false);
  const [shippedOpen, setShippedOpen] = useState(false);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    void listRoadmapFeatures({ status: filter, sort }).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setFeatures(result.value);
    });
    return () => {
      cancelled = true;
    };
  }, [filter, sort]);

  const partitioned = partitionFeaturesForBoard(features, filter);
  const empty = partitioned.primary.length === 0 && partitioned.shipped.length === 0;

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="Roadmap sections"
        className="grid grid-cols-2 gap-1 rounded-2xl bg-white/5 p-1"
      >
        {(
          [
            { id: "features", label: "Features" },
            { id: "requests", label: "Requests" },
          ] as const
        ).map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={`min-h-11 rounded-xl text-sm font-semibold ${
                selected
                  ? "bg-[#141814] text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "features" ? (
        <div className="mt-6 min-w-0 space-y-5">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div
              role="group"
              aria-label="Feature status"
              className="flex min-w-0 flex-wrap gap-2"
            >
              {ROADMAP_FEATURE_FILTER_OPTIONS.map((option) => {
                const selected = filter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFilter(option.id)}
                    className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-medium ${
                      selected
                        ? "bg-emerald-400 text-zinc-950"
                        : "border border-white/12 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div role="group" aria-label="Sort features" className="flex flex-wrap gap-2">
              {ROADMAP_SORT_OPTIONS.map((option) => {
                const selected = sort === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSort(option.id)}
                    className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-medium ${
                      selected
                        ? "border border-white/20 bg-white/10 text-white"
                        : "border border-white/12 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}

          {loading && features.length === 0 ? (
            <p className="text-sm text-zinc-500">Loading features…</p>
          ) : empty ? (
            <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-8">
              <p className="text-sm leading-relaxed text-zinc-400">
                {ROADMAP_FEATURES_EMPTY_COPY}
              </p>
              <button
                type="button"
                onClick={() => setTab("requests")}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
              >
                Open Requests
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {partitioned.primary.map((feature) => (
                  <li key={feature.id} className="min-w-0">
                    <FeatureCard
                      feature={feature}
                      watching={watchingIds.has(feature.id)}
                      onChange={(next) =>
                        setFeatures((current) =>
                          current.map((row) =>
                            row.id === next.id ? next : row,
                          ),
                        )
                      }
                      onWatching={(featureId) =>
                        setWatchingIds((current) => {
                          const next = new Set(current);
                          next.add(featureId);
                          return next;
                        })
                      }
                    />
                  </li>
                ))}
              </ul>

              {partitioned.shipped.length > 0 ? (
                <div className="rounded-3xl border border-white/8 bg-[#101410]">
                  <button
                    type="button"
                    aria-expanded={shippedOpen}
                    onClick={() => setShippedOpen((open) => !open)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 px-5 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-zinc-300">
                      Shipped ({partitioned.shipped.length})
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-500 transition-transform ${
                        shippedOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {shippedOpen ? (
                    <ul className="space-y-3 border-t border-white/6 p-3 sm:p-4">
                      {partitioned.shipped.map((feature) => (
                        <li key={feature.id} className="min-w-0">
                          <FeatureCard
                            feature={feature}
                            watching={watchingIds.has(feature.id)}
                            onChange={(next) =>
                              setFeatures((current) =>
                                current.map((row) =>
                                  row.id === next.id ? next : row,
                                ),
                              )
                            }
                            onWatching={(featureId) =>
                              setWatchingIds((current) => {
                                const next = new Set(current);
                                next.add(featureId);
                                return next;
                              })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 min-w-0">
          <RequestsPanel
            requests={requests}
            onCreated={(request) =>
              setRequests((current) => [request, ...current])
            }
          />
        </div>
      )}
    </div>
  );
}
