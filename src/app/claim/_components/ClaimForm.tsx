"use client";

import { useState, type FormEvent } from "react";

export type ClaimVenuePreview = {
  slug: string;
  name: string;
  suburb: string;
  city: string;
  thumbnail: string | null;
};

type ClaimFormProps = {
  venue: ClaimVenuePreview;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

const ROLE_OPTIONS = [
  "Owner",
  "General Manager",
  "Marketing",
  "Operations",
  "Other",
] as const;

export function ClaimForm({ venue }: ClaimFormProps) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      venueSlug: venue.slug,
      fullName: String(data.get("fullName") ?? "").trim(),
      businessEmail: String(data.get("businessEmail") ?? "").trim(),
      contactNumber: String(data.get("contactNumber") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim(),
    };

    setState({ status: "submitting" });

    try {
      const res = await fetch("/api/venues/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setState({
          status: "error",
          message: body.error ?? "Could not submit claim. Please try again.",
        });
        return;
      }

      setState({ status: "success" });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          Request received
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-wide text-white">
          We&apos;ll verify shortly
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Thanks — your claim for{" "}
          <span className="font-medium text-white">{venue.name}</span> is in the
          queue. We&apos;ll contact you on the details you provided once
          ownership is confirmed.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/8 bg-[#141814] p-6 sm:p-8"
      noValidate
    >
      <div className="space-y-5">
        <Field
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          placeholder="Your name"
        />
        <Field
          label="Business email"
          name="businessEmail"
          type="email"
          autoComplete="email"
          required
          placeholder="you@venue.co.za"
        />
        <Field
          label="Contact / WhatsApp number"
          name="contactNumber"
          type="tel"
          autoComplete="tel"
          required
          placeholder="082 000 0000"
        />
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue=""
            className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0c0f0c] px-3.5 text-sm text-white outline-none transition-colors focus:border-[var(--color-brand)]/50"
          >
            <option value="" disabled>
              Select your role
            </option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
          >
            Verification proof / notes{" "}
            <span className="normal-case tracking-normal text-zinc-600">
              (optional)
            </span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Website URL, company reg, social profile, or anything that helps verify ownership"
            className="w-full resize-y rounded-xl border border-white/10 bg-[#0c0f0c] px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[var(--color-brand)]/50"
          />
        </div>
      </div>

      {state.status === "error" ? (
        <p
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.status === "submitting"
          ? "Submitting…"
          : "Submit Claim Request"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
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
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0c0f0c] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[var(--color-brand)]/50"
      />
    </div>
  );
}
