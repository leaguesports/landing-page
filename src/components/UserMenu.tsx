"use client";

import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

function UserAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={avatarUrl}
        alt=""
        className={`${dim} rounded-full border border-white/10 object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <span
      className={`flex ${dim} items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-emerald-300`}
      aria-hidden
    >
      {initial || <User className="h-4 w-4 text-zinc-400" />}
    </span>
  );
}

export default function UserMenu() {
  const pathname = usePathname();
  const { isAuthenticated, user, displayName, handle, isLoading, signIn, signOut } =
    useAuth();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (isLoading) {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-full border border-white/8 bg-white/5"
        aria-hidden
      />
    );
  }

  if (!isAuthenticated) {
    if (pathname === "/login") return null;

    return (
      <button
        type="button"
        onClick={() => {
          // Capture path + search at click time so query-driven screens
          // (e.g. /padel/new?venue=…) resume after OAuth. Avoid
          // useSearchParams() here — UserMenu lives in the root layout.
          const returnTo = `${window.location.pathname}${window.location.search}` || "/";
          signIn(returnTo);
        }}
        className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/12 bg-white/5 px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      >
        Sign in
      </button>
    );
  }

  const name = displayName || "Account";
  const subtitle = handle
    ? `@${handle}`
    : user?.email?.trim() || "Signed in";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 p-0.5 pr-2 text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      >
        <UserAvatar name={name} avatarUrl={user?.avatarUrl} />
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
        <span className="sr-only">Account menu</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#141814] py-1 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="border-b border-white/8 px-3.5 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar name={name} avatarUrl={user?.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{name}</p>
                <p className="truncate text-xs text-zinc-500">{subtitle}</p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            role="menuitem"
            className="block px-3.5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Your hub
          </Link>

          <div className="border-t border-white/8 py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => {
                setOpen(false);
                void signOut().then(() => {
                  window.location.assign("/");
                });
              }}
            >
              <LogOut className="h-4 w-4 text-zinc-500" aria-hidden />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
