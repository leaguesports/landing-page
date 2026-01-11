"use client";

import { useAuthCheck } from "@/hooks/useAuth";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";
import Link from "next/link";
import { useState } from "react";

export default function HomePageClient() {
  const { isAuthenticated, isLoading, user, logout } = useAuthCheck();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="relative min-h-screen noise flex items-center justify-center">
        <div className="mesh-gradient" />
        <div className="fixed inset-0 grid-pattern pointer-events-none" />
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <span className="text-slate-950 font-bold text-2xl">L</span>
          </div>
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen noise">
        {/* Background effects */}
        <div className="mesh-gradient" />
        <div className="fixed inset-0 grid-pattern pointer-events-none" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-slate-950 font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold font-heading">
                  League<span className="gradient-text">Sports</span>
                </span>
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/quickplay"
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Quickplay</span>
                </Link>
                <Link
                  href="/activities"
                  className="text-slate-300 hover:text-white transition-colors hidden sm:block"
                >
                  Activities
                </Link>
                <Link
                  href="/communities"
                  className="text-slate-300 hover:text-white transition-colors hidden sm:block"
                >
                  Communities
                </Link>

                {/* User Menu - Desktop */}
                <div className="relative group hidden sm:block">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-slate-950">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 glass-card rounded-xl border border-slate-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-slate-700/50">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.name || user?.email || "Player"}
                      </p>
                      {user?.email && user?.name && (
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      Settings
                    </Link>
                    <div className="border-t border-slate-700/50 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {isLoggingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile user avatar */}
                <div className="sm:hidden">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-slate-950">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="sm:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                >
                  {showMobileMenu ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {showMobileMenu && (
            <div className="sm:hidden border-t border-slate-800/50 bg-slate-900/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-3">
                <Link
                  href="/quickplay"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Quickplay
                </Link>
                <Link
                  href="/activities"
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Activities
                </Link>
                <Link
                  href="/communities"
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Communities
                </Link>
                <Link
                  href="/stats"
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  My Stats
                </Link>
                <Link
                  href="/history"
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Match History
                </Link>
                <div className="pt-3 border-t border-slate-700/50">
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
          <Dashboard userName={user?.name || "Player"} />
        </main>
      </div>
    );
  }

  // Not authenticated - show landing page
  return <LandingPage />;
}
