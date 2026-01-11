"use client";

import Link from "next/link";
import { useState } from "react";
import { sportsList } from "@/config/sports";

const existingApps = [
  { id: "strava", name: "Strava", icon: "🏃" },
  { id: "garmin", name: "Garmin Connect", icon: "⌚" },
  { id: "apple-fitness", name: "Apple Fitness", icon: "🍎" },
  { id: "google-fit", name: "Google Fit", icon: "📊" },
  { id: "whoop", name: "WHOOP", icon: "💪" },
  { id: "zwift", name: "Zwift", icon: "🚴" },
  { id: "iracing", name: "iRacing", icon: "🏎️" },
  { id: "acc", name: "ACC / Sim Racing Apps", icon: "🎮" },
  { id: "grint", name: "The Grint / Golf Apps", icon: "⛳" },
  { id: "playtomic", name: "Playtomic", icon: "🎾" },
  { id: "spreadsheets", name: "Spreadsheets / Manual", icon: "📋" },
  { id: "none", name: "Nothing yet", icon: "🆕" },
];

const appFeatures = [
  {
    id: "tracking",
    label: "Activity/session tracking",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "stats",
    label: "Detailed statistics & analytics",
    icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    id: "progress",
    label: "Progress over time charts",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    id: "social",
    label: "Social features / leaderboards",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "goals",
    label: "Goal setting & achievements",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    id: "training",
    label: "Training plans / drills",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    id: "sync",
    label: "Device/hardware sync",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    id: "history",
    label: "Match/game history",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const painPoints = [
  { id: "fragmented", label: "Data scattered across multiple apps" },
  { id: "no-sport", label: "My sport isn't well supported" },
  { id: "manual", label: "Too much manual entry required" },
  { id: "no-practice", label: "No practice/drill tracking" },
  { id: "no-competitive", label: "No ranked/competitive features" },
  { id: "no-friends", label: "Hard to track games with friends" },
  { id: "complex", label: "Too complex / overwhelming UI" },
  { id: "expensive", label: "Too expensive / paywall everything" },
  { id: "no-history", label: "Can't see long-term progress" },
  { id: "no-community", label: "No community features" },
];

export default function WaitlistPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [otherSports, setOtherSports] = useState("");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [otherApp, setOtherApp] = useState("");
  const [likedFeatures, setLikedFeatures] = useState<string[]>([]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 4;

  const toggleItem = (
    id: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = () => {
    setError("");
    switch (step) {
      case 1:
        if (!email) {
          setError("Please enter your email address");
          return false;
        }
        if (!isValidEmail(email)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (selectedSports.length === 0) {
          setError("Please select at least one sport");
          return false;
        }
        break;
      case 2:
        if (selectedApps.length === 0) {
          setError("Please select at least one option");
          return false;
        }
        break;
      case 3:
        // Features are optional
        break;
      case 4:
        // Pain points are optional
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  // Prevent Enter key from submitting form - only allow explicit button click
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Allow Enter in textareas for new lines
      if (e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Prevent default form submission for all other elements
      e.preventDefault();

      // If on a step other than the last and it's an input field, advance to next step
      if (step < totalSteps && e.target instanceof HTMLInputElement) {
        handleNext();
      }
      // On the last step, do nothing - user must click the submit button
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    setError("");
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Waitlist submission:", {
        email,
        sports: selectedSports,
        otherSports: otherSports || undefined,
        currentApps: selectedApps,
        otherApp: otherApp || undefined,
        likedFeatures,
        painPoints: selectedPainPoints,
        additionalFeedback: additionalFeedback || undefined,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-slate-950 font-bold text-base sm:text-lg">
                  L
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
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
              <span className="hidden sm:inline">Back to </span>Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {isSubmitted ? (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400"
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white mb-3 sm:mb-4">
                You&apos;re on the list!
              </h1>
              <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
                Thanks for sharing your feedback! We&apos;ll notify you at{" "}
                <span className="text-white font-medium break-all">
                  {email}
                </span>{" "}
                when we&apos;re ready to launch.
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8">
                Your input helps us build exactly what you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/"
                  className="btn-secondary px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base"
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
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    Coming Soon
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-3 sm:mb-4">
                  Get Early Access
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto px-2">
                  Tell us about your sports and how you track them today. Your
                  feedback shapes what we build.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 mb-2">
                  <span>
                    Step {step} of {totalSteps}
                  </span>
                  <span>{Math.round((step / totalSteps) * 100)}% complete</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Form */}
              <div
                onKeyDown={handleKeyDown}
                className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10"
              >
                {/* Step 1: Email & Sports */}
                {step === 1 && (
                  <div className="space-y-6 sm:space-y-8 animate-fade-in">
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
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base sm:text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Which sports do you play or follow?{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">
                        Select all that apply
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {sportsList.map((sport) => {
                          const isSelected = selectedSports.includes(sport.id);
                          return (
                            <button
                              key={sport.id}
                              type="button"
                              onClick={() =>
                                toggleItem(
                                  sport.id,
                                  selectedSports,
                                  setSelectedSports
                                )
                              }
                              className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                isSelected
                                  ? `bg-gradient-to-br ${sport.gradient} text-white shadow-lg`
                                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700"
                              }`}
                            >
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
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

                    <div>
                      <label
                        htmlFor="otherSports"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Other sports you&apos;re interested in (optional)
                      </label>
                      <input
                        type="text"
                        id="otherSports"
                        value={otherSports}
                        onChange={(e) => setOtherSports(e.target.value)}
                        placeholder="e.g., Tennis, Squash, Karting, Snooker..."
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Let us know what sports we should add next
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Current Apps */}
                {step === 2 && (
                  <div className="space-y-5 sm:space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-base sm:text-lg font-medium text-white mb-1">
                        What do you currently use to track your sports?{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
                        Select all apps or methods you use
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {existingApps.map((app) => {
                          const isSelected = selectedApps.includes(app.id);
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() =>
                                toggleItem(
                                  app.id,
                                  selectedApps,
                                  setSelectedApps
                                )
                              }
                              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                                isSelected
                                  ? "bg-primary/20 border-2 border-primary text-white"
                                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border-2 border-transparent"
                              }`}
                            >
                              <span className="text-lg sm:text-xl shrink-0">
                                {app.icon}
                              </span>
                              <span className="line-clamp-1">{app.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="otherApp"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Other apps you use (optional)
                      </label>
                      <input
                        type="text"
                        id="otherApp"
                        value={otherApp}
                        onChange={(e) => setOtherApp(e.target.value)}
                        placeholder="e.g., MyFitnessPal, Racket Tracker..."
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Liked Features */}
                {step === 3 && (
                  <div className="space-y-5 sm:space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-base sm:text-lg font-medium text-white mb-1">
                        What features do you like in your current apps?
                      </label>
                      <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
                        Select the features that work well for you (optional)
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        {appFeatures.map((feature) => {
                          const isSelected = likedFeatures.includes(feature.id);
                          return (
                            <button
                              key={feature.id}
                              type="button"
                              onClick={() =>
                                toggleItem(
                                  feature.id,
                                  likedFeatures,
                                  setLikedFeatures
                                )
                              }
                              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl text-xs sm:text-sm transition-all text-left ${
                                isSelected
                                  ? "bg-emerald-500/20 border-2 border-emerald-500 text-white"
                                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border-2 border-transparent"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-700 text-slate-400"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={feature.icon}
                                  />
                                </svg>
                              </div>
                              <span className="font-medium flex-1">
                                {feature.label}
                              </span>
                              {isSelected && (
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0"
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
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Pain Points */}
                {step === 4 && (
                  <div className="space-y-5 sm:space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-base sm:text-lg font-medium text-white mb-1">
                        What&apos;s lacking or frustrating about current
                        solutions?
                      </label>
                      <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
                        Select your biggest pain points (optional)
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        {painPoints.map((pain) => {
                          const isSelected = selectedPainPoints.includes(
                            pain.id
                          );
                          return (
                            <button
                              key={pain.id}
                              type="button"
                              onClick={() =>
                                toggleItem(
                                  pain.id,
                                  selectedPainPoints,
                                  setSelectedPainPoints
                                )
                              }
                              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl text-xs sm:text-sm transition-all text-left ${
                                isSelected
                                  ? "bg-amber-500/20 border-2 border-amber-500 text-white"
                                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border-2 border-transparent"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                  isSelected
                                    ? "bg-amber-500 border-amber-500"
                                    : "border-slate-600"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{pain.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="feedback"
                        className="block text-xs sm:text-sm font-medium text-slate-300 mb-2"
                      >
                        Anything else you&apos;d like us to know? (optional)
                      </label>
                      <textarea
                        id="feedback"
                        value={additionalFeedback}
                        onChange={(e) => setAdditionalFeedback(e.target.value)}
                        placeholder="Tell us about specific features you'd love to see..."
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mt-4 sm:mt-6">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-white transition-colors text-sm sm:text-base"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base"
                    >
                      Continue
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
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-primary px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
                          Submitting...
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
                          Join Waitlist
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                  We&apos;ll only email you about launch updates. No spam, ever.
                </p>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
                {[
                  { num: 1, label: "About You" },
                  { num: 2, label: "Apps" },
                  { num: 3, label: "Features" },
                  { num: 4, label: "Feedback" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`flex flex-col items-center gap-1 ${
                      step >= s.num ? "text-primary" : "text-slate-600"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                        step > s.num
                          ? "bg-primary text-white"
                          : step === s.num
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {step > s.num ? (
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
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
                      ) : (
                        s.num
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
