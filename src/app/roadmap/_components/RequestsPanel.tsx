"use client";

import {
  buildCreateRequestPayload,
  createRoadmapRequest,
  requestStatusLabel,
  requestTypeLabel,
  type PublicRoadmapRequest,
  type RoadmapRequestType,
} from "@/lib/roadmap/roadmap";
import { useState, type FormEvent } from "react";

const TYPE_OPTIONS: { id: RoadmapRequestType; label: string }[] = [
  { id: "FEATURE_REQUEST", label: "Feature request" },
  { id: "BUG", label: "Bug" },
];

type RequestsPanelProps = {
  requests: PublicRoadmapRequest[];
  onCreated: (request: PublicRoadmapRequest) => void;
};

export function RequestsPanel({ requests, onCreated }: RequestsPanelProps) {
  const [type, setType] = useState<RoadmapRequestType>("FEATURE_REQUEST");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [thanks, setThanks] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const built = buildCreateRequestPayload({
      type,
      title,
      details,
      email,
    });
    if (!built.ok) {
      setError(built.error);
      return;
    }
    setPending(true);
    const result = await createRoadmapRequest(built.payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCreated(result.value);
    setTitle("");
    setDetails("");
    setEmail("");
    setThanks(true);
  }

  return (
    <div className="space-y-8">
      {thanks ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/8 p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Thanks — we got it
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            This stays in Requests. It won&apos;t appear as a vote card.
          </p>
          <button
            type="button"
            onClick={() => setThanks(false)}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white hover:border-white/20"
          >
            Send another
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
        >
          <h2 className="font-display text-2xl tracking-wide text-white">
            Tell us what you need
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Feature ideas and bugs land here — they don&apos;t become vote
            cards until we put them on the board.
          </p>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-medium text-zinc-400">
              Type
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((option) => {
                const selected = type === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 text-center text-sm font-medium ${
                      selected
                        ? "border-emerald-400/40 bg-emerald-400/12 text-emerald-100"
                        : "border-white/10 bg-[#101410] text-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="request-type"
                      value={option.id}
                      checked={selected}
                      onChange={() => setType(option.id)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4">
            <label
              htmlFor="request-title"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Title
            </label>
            <input
              id="request-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What should we add or fix?"
              className="min-h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="request-details"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Details
            </label>
            <textarea
              id="request-details"
              required
              maxLength={5000}
              rows={5}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="A bit more context helps us ship the right thing."
              className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#101410] px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="request-email"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Email <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              id="request-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="If you want a reply"
              className="min-h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
            />
          </div>

          {error ? (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Sending…" : "Send request"}
          </button>
        </form>
      )}

      {requests.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl tracking-wide text-white">
            Open requests
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Titles only — these are not vote cards.
          </p>
          <ul className="mt-4 space-y-2">
            {requests.map((request) => (
              <li
                key={request.id}
                className="min-w-0 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
              >
                <p className="truncate text-sm font-medium text-white">
                  {request.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {requestTypeLabel(request.type)} ·{" "}
                  {requestStatusLabel(request.status)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
