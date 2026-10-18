import type { ButtonHTMLAttributes, ReactNode } from "react";

export function GameDayColumn({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide
          ? "mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 xl:px-8"
          : "mx-auto w-full max-w-[420px] px-5 pb-16 pt-8"
      }
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </p>
  );
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-2 font-display text-5xl tracking-wide text-zinc-950">
      {children}
    </h1>
  );
}

export const primaryLinkClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white";

export function PrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white disabled:opacity-40 ${className}`}
    />
  );
}

export function OutlineButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-950 disabled:opacity-40 ${className}`}
    />
  );
}

export function teeDotClass(label: string): string {
  const value = label.toLowerCase();
  if (value.includes("yellow")) return "bg-yellow-400";
  if (value.includes("red")) return "bg-red-600";
  if (value.includes("blue")) return "bg-blue-600";
  if (value.includes("black")) return "bg-zinc-950";
  if (value.includes("white")) return "border border-zinc-400 bg-white";
  return "bg-zinc-400";
}

export function ChoiceChip({
  selected,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={
        selected
          ? "inline-flex min-h-11 items-center rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white"
          : "inline-flex min-h-11 items-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950"
      }
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
      {children}
    </span>
  );
}

export function textFieldClass(): string {
  return "mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-950";
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 16.8L1 22.2l5.5-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.3.7.7-3.2-.2-.3A9.1 9.1 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.4 4 14.6 14.6 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}

export function SyncText({ label }: { label: string }) {
  const saved = label === "Saved";
  return (
    <p
      role="status"
      className={`text-sm font-semibold ${saved ? "text-green-800" : "text-zinc-600"}`}
    >
      {saved ? "✓ " : ""}
      {label}
    </p>
  );
}
