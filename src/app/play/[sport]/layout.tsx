"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getSportBySlug } from "@/config/sports";

export default function SportAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const sportSlug = params.sport as string;
  const sport = getSportBySlug(sportSlug);

  if (!sport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Sport not found
          </h1>
          <Link href="/" className="text-primary hover:text-primary-light">
            Return to library
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: `/play/${sportSlug}`,
      label: "Home",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      href: `/play/${sportSlug}/practice`,
      label: "Practice",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
    {
      href: `/play/${sportSlug}/casual`,
      label: "Casual",
      icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      href: `/play/${sportSlug}/compete`,
      label: "Compete",
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
    {
      href: `/play/${sportSlug}/stats`,
      label: "Stats",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      href: `/play/${sportSlug}/history`,
      label: "History",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const isActive = (href: string) => {
    if (href === `/play/${sportSlug}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: sport.bgPattern }}
    >
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            {/* Back to Library */}
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
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
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              <span className="text-sm hidden sm:inline group-hover:underline">
                Library
              </span>
            </Link>

            <div className="h-6 w-px bg-slate-700" />

            {/* Sport Identity */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sport.gradient} flex items-center justify-center`}
              >
                <svg
                  className="w-4 h-4 text-white"
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
              <span className="font-bold text-white">{sport.name}</span>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? `bg-gradient-to-r ${sport.gradient} text-white`
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
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
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Quick Play Button */}
            <div className="ml-auto">
              <Link
                href={`/play/${sportSlug}/casual`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${sport.gradient} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                </svg>
                <span className="hidden sm:inline">Quick Play</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive(item.href) ? "text-white" : "text-slate-500"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive(item.href)
                    ? `bg-gradient-to-r ${sport.gradient}`
                    : ""
                }`}
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
                    d={item.icon}
                  />
                </svg>
              </div>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
