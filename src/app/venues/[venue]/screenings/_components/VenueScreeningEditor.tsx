"use client";

import { useMemo, useState, type FormEvent } from "react";

export type ScreeningEditorRow = {
  title: string;
  startsAt: string;
  fixtureSlug?: string;
  setupTags?: string[];
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

type DraftRow = {
  id: string;
  title: string;
  startsAtLocal: string;
  fixtureSlug: string;
  setupTagsText: string;
};

function newDraftId(): string {
  return crypto.randomUUID();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.trim();
  return parsed.toISOString();
}

function parseSetupTags(text: string): string[] {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toDraft(row: ScreeningEditorRow): DraftRow {
  return {
    id: newDraftId(),
    title: row.title,
    startsAtLocal: toDatetimeLocalValue(row.startsAt),
    fixtureSlug: row.fixtureSlug ?? "",
    setupTagsText: (row.setupTags ?? []).join(", "),
  };
}

function emptyDraft(): DraftRow {
  return {
    id: newDraftId(),
    title: "",
    startsAtLocal: "",
    fixtureSlug: "",
    setupTagsText: "",
  };
}

export function VenueScreeningEditor({
  venueSlug,
  venueName,
  initialScreenings,
}: {
  venueSlug: string;
  venueName: string;
  initialScreenings: ScreeningEditorRow[];
}) {
  const [rows, setRows] = useState<DraftRow[]>(() =>
    initialScreenings.length > 0 ? initialScreenings.map(toDraft) : [],
  );
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const isEmpty = rows.length === 0;
  const venueHref = useMemo(() => `/venues/${venueSlug}`, [venueSlug]);

  function updateRow(id: string, patch: Partial<DraftRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
    if (state.status === "success") setState({ status: "idle" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const screenings = rows.map((row) => ({
      title: row.title.trim(),
      startsAt: fromDatetimeLocalValue(row.startsAtLocal),
      fixtureSlug: row.fixtureSlug.trim().toLowerCase(),
      setupTags: parseSetupTags(row.setupTagsText),
    }));

    try {
      const res = await fetch(`/api/venues/${encodeURIComponent(venueSlug)}/screenings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenings }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({
          status: "error",
          message: body.error ?? "Could not save screenings. Please try again.",
        });
        return;
      }
      setState({ status: "success" });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {isEmpty ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-8 text-sm leading-relaxed text-zinc-400">
          No screenings yet — add kickoff and a fixture title.
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Screening {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setRows((current) => current.filter((item) => item.id !== row.id))
                  }
                  className="text-sm font-medium text-zinc-400 transition-colors hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Fixture title"
                  name={`title-${row.id}`}
                  value={row.title}
                  onChange={(value) => updateRow(row.id, { title: value })}
                  required
                  placeholder="Springboks vs All Blacks"
                  className="sm:col-span-2"
                />
                <Field
                  label="Kickoff"
                  name={`startsAt-${row.id}`}
                  type="datetime-local"
                  value={row.startsAtLocal}
                  onChange={(value) => updateRow(row.id, { startsAtLocal: value })}
                  required
                />
                <Field
                  label="Fixture slug"
                  name={`fixtureSlug-${row.id}`}
                  value={row.fixtureSlug}
                  onChange={(value) => updateRow(row.id, { fixtureSlug: value })}
                  placeholder="springboks-vs-all-blacks-2026-09-06"
                  hint="Optional. Public /events slug so this bar appears on the fixture page."
                />
                <Field
                  label="Setup tags"
                  name={`setupTags-${row.id}`}
                  value={row.setupTagsText}
                  onChange={(value) => updateRow(row.id, { setupTagsText: value })}
                  placeholder="Big screen, specials"
                  hint="Optional. Comma-separated, e.g. Big screen, specials."
                  className="sm:col-span-2"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setRows((current) => [...current, emptyDraft()])}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Add screening
        </button>
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "submitting" ? "Saving…" : "Save screenings"}
        </button>
      </div>

      {state.status === "error" ? (
        <p
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-5 sm:p-6">
          <p className="text-sm leading-relaxed text-zinc-300">
            Saved. Screenings appear on this venue and{" "}
            <a href="/events" className="font-medium text-emerald-300 hover:text-emerald-200">
              /events
            </a>{" "}
            after refresh.
          </p>
          <a
            href={venueHref}
            className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Back to {venueName}
          </a>
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  hint,
  className,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
      >
        {label}
        {required ? <span className="text-[var(--color-brand)]"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0c0f0c] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[var(--color-brand)]/50"
      />
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">{hint}</p> : null}
    </div>
  );
}
