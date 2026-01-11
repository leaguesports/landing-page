"use client";

import Link from "next/link";
import { useState } from "react";
import { sportsList } from "@/config/sports";

const useCases = [
  {
    id: "practice",
    label: "Practice & Drills",
    description: "Structured training to improve skills",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "casual",
    label: "Casual Play",
    description: "Fun games with friends, no pressure",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "competitive",
    label: "Competitive Matches",
    description: "Ranked games that affect your standing",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    id: "tracking",
    label: "Stats & Tracking",
    description: "Monitor progress and performance",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "communities",
    label: "Join Communities",
    description: "Connect with other players",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "organize",
    label: "Organize Events",
    description: "Run tournaments and leagues",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId]
    );
  };

  const toggleUseCase = (useCaseId: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(useCaseId)
        ? prev.filter((id) => id !== useCaseId)
        : [...prev, useCaseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (selectedSports.length === 0) {
      setError("Please select at least one sport");
      return;
    }

    if (selectedUseCases.length === 0) {
      setError("Please select at least one way you'd like to use the app");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Waitlist submission:", {
        email,
        sports: selectedSports,
        useCases: selectedUseCases,
      });

      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen noise">
      {/* Background effects */}
      <div className="mesh-gradient" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-slate-950 font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {isSubmitted ? (
            <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                You&apos;re on the list!
              </h1>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                Thanks for your interest in LeagueSports! We&apos;ll notify you
                at <span className="text-white font-medium">{email}</span> when
                we&apos;re ready to launch.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="btn-secondary px-6 py-3 rounded-xl flex items-center gap-2"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-slate-300">Coming Soon</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
                  Join the Waitlist
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  Be among the first to experience the ultimate sports
                  companion. Tell us how you want to use LeagueSports so we can
                  tailor your experience.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="glass-card rounded-3xl p-6 md:p-10 space-y-8"
              >
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                  />
                </div>

                {/* Sports Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Which sports interest you?{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <p className="text-sm text-slate-400 mb-4">
                    Select all that apply
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sportsList.map((sport) => {
                      const isSelected = selectedSports.includes(sport.id);
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => toggleSport(sport.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all ${
                            isSelected
                              ? `bg-gradient-to-br ${sport.gradient} text-white shadow-lg`
                              : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700"
                          }`}
                        >
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
                              d={sport.icon}
                            />
                          </svg>
                          <span>{sport.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Use Cases Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    How do you want to use LeagueSports?{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <p className="text-sm text-slate-400 mb-4">
                    Select all that apply
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {useCases.map((useCase) => {
                      const isSelected = selectedUseCases.includes(useCase.id);
                      return (
                        <button
                          key={useCase.id}
                          type="button"
                          onClick={() => toggleUseCase(useCase.id)}
                          className={`flex items-start gap-4 px-4 py-4 rounded-xl text-left transition-all ${
                            isSelected
                              ? "bg-primary/20 border-2 border-primary"
                              : "bg-slate-800/50 border-2 border-transparent hover:bg-slate-800"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-slate-700 text-slate-400"
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
                                d={useCase.icon}
                              />
                            </svg>
                          </div>
                          <div>
                            <div
                              className={`font-medium ${
                                isSelected ? "text-white" : "text-slate-300"
                              }`}
                            >
                              {useCase.label}
                            </div>
                            <div className="text-sm text-slate-500">
                              {useCase.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Joining Waitlist...
                    </>
                  ) : (
                    <>
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
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      Join the Waitlist
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  We&apos;ll only email you about launch updates. No spam, ever.
                </p>
              </form>

              {/* Features Preview */}
              <div className="mt-12 text-center">
                <p className="text-slate-400 mb-6">What you&apos;ll get:</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    "Sport-specific apps",
                    "Practice drills",
                    "Stats tracking",
                    "Communities",
                    "Achievements",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 text-sm text-slate-300"
                    >
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
