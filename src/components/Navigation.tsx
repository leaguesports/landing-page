"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { sportsList } from "@/config/sports";

type DropdownId = "product" | "solutions" | "sports" | null;

// Featured sports to show in the dropdown (first 6)
const featuredSports = sportsList.slice(0, 6);

const productItems = [
  {
    title: "Sport Dashboards",
    description: "Custom tools for every sport",
    href: "/product/dashboards",
    icon: "🎮",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Tournaments",
    description: "Run professional brackets & leagues",
    href: "/product/tournaments",
    icon: "🏆",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    title: "Stats & Progression",
    description: "Track performance & earn badges",
    href: "/product/stats",
    icon: "📊",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Communities",
    description: "Build groups & connect players",
    href: "/product/communities",
    icon: "👥",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Live Mode",
    description: "Spectator views & jumbotron",
    href: "/product/live",
    icon: "📺",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Integrations",
    description: "Connect your favorite tools",
    href: "/product/integrations",
    icon: "⚡",
    gradient: "from-pink-500 to-rose-600",
  },
];

const solutionItems = [
  {
    title: "For Players",
    description: "Track stats, find matches & improve",
    href: "/solutions/players",
    icon: "🎮",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "For Coaches",
    description: "Manage teams & track development",
    href: "/solutions/coaches",
    icon: "📋",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "For Referees",
    description: "Score matches & manage events",
    href: "/solutions/referees",
    icon: "🏁",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    title: "For Venues",
    description: "Run leagues & engage customers",
    href: "/solutions/venues",
    icon: "🏟️",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "For Marketers",
    description: "Grow communities & drive engagement",
    href: "/solutions/marketers",
    icon: "📈",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    title: "For Fans",
    description: "Follow live matches & track favorites",
    href: "/solutions/fans",
    icon: "👀",
    gradient: "from-amber-500 to-yellow-600",
  },
];

export default function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<DropdownId>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<DropdownId>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setMobileExpanded(null);
  }, []);

  return (
    <div ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navbar */}
      <nav className="glass-card border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.svg"
                alt="LeagueSports"
                className="w-9 h-9 sm:w-10 sm:h-10"
              />
              <span className="text-lg sm:text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Sports Dropdown Trigger */}
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "sports" ? null : "sports"
                  )
                }
                onMouseEnter={() => setActiveDropdown("sports")}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDropdown === "sports"
                    ? "text-white bg-slate-800/50"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Sports
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "sports" ? "rotate-180" : ""
                  }`}
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

              {/* Product Dropdown Trigger */}
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "product" ? null : "product"
                  )
                }
                onMouseEnter={() => setActiveDropdown("product")}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDropdown === "product"
                    ? "text-white bg-slate-800/50"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Product
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "product" ? "rotate-180" : ""
                  }`}
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

              {/* Solutions Dropdown Trigger */}
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "solutions" ? null : "solutions"
                  )
                }
                onMouseEnter={() => setActiveDropdown("solutions")}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDropdown === "solutions"
                    ? "text-white bg-slate-800/50"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Solutions
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "solutions" ? "rotate-180" : ""
                  }`}
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

              {/* Static Links */}
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/waitlist"
                className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm whitespace-nowrap"
              >
                Get Started
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
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
      </nav>

      {/* Full-Width Dropdown Panels */}
      {activeDropdown && (
        <div
          className="hidden lg:block w-full bg-slate-900/98 backdrop-blur-xl border-b border-slate-800/50 animate-fade-in-up"
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Product Dropdown Content */}
            {activeDropdown === "product" && (
              <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Features
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {productItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Made for SA 🇿🇦
                  </p>
                  <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-primary/5 to-transparent">
                    <h4 className="font-bold text-white mb-2">
                      Built for South Africa
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Everything you need to track, practice, and compete —
                      designed for SA sports communities.
                    </p>
                    <Link
                      href="/product"
                      onClick={() => setActiveDropdown(null)}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light transition-colors"
                    >
                      View all features
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Solutions Dropdown Content */}
            {activeDropdown === "solutions" && (
              <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Use Cases
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {solutionItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Get Started
                  </p>
                  <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <h4 className="font-bold text-white mb-2">Find your fit</h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Whether you run a pub league in Joburg or a sports club
                      in Cape Town, we&apos;ve got you covered.
                    </p>
                    <Link
                      href="/solutions"
                      onClick={() => setActiveDropdown(null)}
                      className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      View all solutions
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Sports Dropdown Content */}
            {activeDropdown === "sports" && (
              <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Popular Sports
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {featuredSports.map((sport) => (
                      <Link
                        key={sport.slug}
                        href={`/sports/${sport.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sport.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={sport.icon}
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {sport.name}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {sport.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {/* More sports link */}
                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      More Sports
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sportsList.slice(6).map((sport) => (
                        <Link
                          key={sport.slug}
                          href={`/sports/${sport.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-sm text-slate-300 hover:text-white"
                        >
                          <div
                            className={`w-5 h-5 rounded bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={sport.icon}
                              />
                            </svg>
                          </div>
                          {sport.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    South Africa 🇿🇦
                  </p>
                  <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <h4 className="font-bold text-white mb-2">
                      12+ Sports Across SA
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      From padel in Sandton to darts in Stellenbosch — track
                      stats and compete in tournaments across all 9 provinces.
                    </p>
                    <Link
                      href="/waitlist"
                      onClick={() => setActiveDropdown(null)}
                      className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Join the waitlist
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-800/50 bg-slate-900/98 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            {/* Sports Accordion */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "sports" ? null : "sports"
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-medium">Sports</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    mobileExpanded === "sports" ? "rotate-180" : ""
                  }`}
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
              {mobileExpanded === "sports" && (
                <div className="mt-2 ml-4 space-y-1">
                  {sportsList.map((sport) => (
                    <Link
                      key={sport.slug}
                      href={`/sports/${sport.slug}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={sport.icon}
                          />
                        </svg>
                      </div>
                      <span className="text-sm">{sport.name}</span>
                    </Link>
                  ))}
                  <Link
                    href="/waitlist"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-slate-800/50 transition-colors text-sm"
                  >
                    Join the waitlist →
                  </Link>
                </div>
              )}
            </div>

            {/* Product Accordion */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "product" ? null : "product"
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-medium">Product</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    mobileExpanded === "product" ? "rotate-180" : ""
                  }`}
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
              {mobileExpanded === "product" && (
                <div className="mt-2 ml-4 space-y-1">
                  {productItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  ))}
                  <Link
                    href="/product"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-slate-800/50 transition-colors text-sm"
                  >
                    View all features →
                  </Link>
                </div>
              )}
            </div>

            {/* Solutions Accordion */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "solutions" ? null : "solutions"
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-medium">Solutions</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    mobileExpanded === "solutions" ? "rotate-180" : ""
                  }`}
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
              {mobileExpanded === "solutions" && (
                <div className="mt-2 ml-4 space-y-1">
                  {solutionItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  ))}
                  <Link
                    href="/solutions"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-slate-800/50 transition-colors text-sm"
                  >
                    View all solutions →
                  </Link>
                </div>
              )}
            </div>

            {/* Static Links */}
            <Link
              href="/pricing"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 rounded-xl text-white hover:bg-slate-800/50 transition-colors font-medium"
            >
              Pricing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
