"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

type TournamentFormat =
  | "single-elimination"
  | "double-elimination"
  | "round-robin"
  | "swiss";
type ActivityType = "racing" | "golf" | "padel" | "esports" | "darts" | "pool";

const activityConfig: Record<
  ActivityType,
  { icon: string; gradient: string; label: string }
> = {
  racing: {
    icon: "🏎️",
    gradient: "from-red-500 to-rose-600",
    label: "Sim Racing",
  },
  golf: {
    icon: "⛳",
    gradient: "from-emerald-500 to-green-600",
    label: "Sim Golf",
  },
  padel: {
    icon: "🎾",
    gradient: "from-amber-500 to-orange-600",
    label: "Padel",
  },
  esports: {
    icon: "🎮",
    gradient: "from-violet-500 to-purple-600",
    label: "Esports",
  },
  darts: {
    icon: "🎯",
    gradient: "from-sky-500 to-blue-600",
    label: "Darts",
  },
  pool: {
    icon: "🎱",
    gradient: "from-slate-500 to-gray-600",
    label: "Pool",
  },
};

const formatConfig: Record<
  TournamentFormat,
  { label: string; description: string; icon: string; bracketPreview: string }
> = {
  "single-elimination": {
    label: "Single Elimination",
    description: "Lose once and you're out. Fast-paced knockout format.",
    icon: "🏆",
    bracketPreview: "bracket-single",
  },
  "double-elimination": {
    label: "Double Elimination",
    description:
      "Two chances to compete. Losers bracket gives you another shot.",
    icon: "🔄",
    bracketPreview: "bracket-double",
  },
  "round-robin": {
    label: "Round Robin",
    description: "Everyone plays everyone. Most points wins.",
    icon: "🔁",
    bracketPreview: "bracket-robin",
  },
  swiss: {
    label: "Swiss System",
    description:
      "Play opponents with similar records. Efficient for large groups.",
    icon: "🎲",
    bracketPreview: "bracket-swiss",
  },
};

export default function CreateTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basics
    name: "",
    description: "",
    activity: null as ActivityType | null,
    // Step 2: Format
    format: null as TournamentFormat | null,
    bestOf: 1,
    thirdPlaceMatch: false,
    // Step 3: Schedule
    registrationDeadline: "",
    startDate: "",
    startTime: "",
    matchDuration: 30,
    breakBetweenMatches: 15,
    // Step 4: Participants
    minParticipants: 4,
    maxParticipants: 16,
    seedingMethod: "random" as "random" | "manual" | "rating",
    allowLateRegistration: false,
    // Step 5: Settings
    requireCheckIn: true,
    checkInWindow: 30,
    prizes: ["", "", ""],
  });

  const totalSteps = 5;
  const activity = formData.activity ? activityConfig[formData.activity] : null;
  const format = formData.format ? formatConfig[formData.format] : null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/communities/${params.id}`);
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== "" && formData.activity !== null;
      case 2:
        return formData.format !== null;
      case 3:
        return (
          formData.startDate !== "" &&
          formData.startTime !== "" &&
          formData.registrationDeadline !== ""
        );
      case 4:
        return (
          formData.minParticipants >= 2 &&
          formData.maxParticipants >= formData.minParticipants
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(step);

  // Calculate bracket size based on max participants
  const getBracketSize = () => {
    const sizes = [4, 8, 16, 32, 64];
    for (const size of sizes) {
      if (formData.maxParticipants <= size) return size;
    }
    return 64;
  };

  const bracketSize = getBracketSize();
  const totalRounds = Math.log2(bracketSize);

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
            <div className="flex items-center gap-4">
              <Link
                href="/communities"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Communities
              </Link>
              <Link
                href={`/communities/${params.id}`}
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Back to Community
              </Link>
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
                href="/communities"
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Communities
              </Link>
              <Link
                href={`/communities/${params.id}`}
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Back to Community
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href={`/communities/${params.id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to community</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7l-3-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                  Create <span className="text-emerald-400">Tournament</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Set up a competitive bracket tournament
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[
                { num: 1, label: "Basics" },
                { num: 2, label: "Format" },
                { num: 3, label: "Schedule" },
                { num: 4, label: "Players" },
                { num: 5, label: "Settings" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <button
                    onClick={() => {
                      // Only allow going back or to completed steps
                      if (s.num < step || isStepValid(s.num - 1)) {
                        setStep(s.num);
                      }
                    }}
                    className={`flex flex-col items-center ${
                      s.num <= step ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        s.num === step
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : s.num < step
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {s.num < step ? (
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        s.num === step
                          ? "text-emerald-400 font-medium"
                          : s.num < step
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < 4 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-2 ${
                        s.num < step ? "bg-emerald-500/50" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/5 to-transparent blur-3xl" />

            <div className="relative z-10">
              {/* Step 1: Basics */}
              {step === 1 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      1
                    </span>
                    Tournament Basics
                  </h2>

                  <div className="space-y-6">
                    {/* Tournament Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Tournament Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Summer Championship 2024"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Tell participants what this tournament is about..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Activity Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Activity Type <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(Object.keys(activityConfig) as ActivityType[]).map(
                          (type) => {
                            const cfg = activityConfig[type];
                            const isSelected = formData.activity === type;
                            return (
                              <button
                                key={type}
                                onClick={() =>
                                  setFormData({ ...formData, activity: type })
                                }
                                className={`p-4 rounded-xl text-left transition-all ${
                                  isSelected
                                    ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                                    : "glass-card hover:border-slate-600"
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-lg mb-2`}
                                >
                                  {cfg.icon}
                                </div>
                                <span className="font-medium text-white text-sm">
                                  {cfg.label}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Format */}
              {step === 2 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      2
                    </span>
                    Tournament Format
                  </h2>

                  <div className="space-y-6">
                    {/* Format Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Bracket Format <span className="text-red-400">*</span>
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(Object.keys(formatConfig) as TournamentFormat[]).map(
                          (fmt) => {
                            const cfg = formatConfig[fmt];
                            const isSelected = formData.format === fmt;
                            return (
                              <button
                                key={fmt}
                                onClick={() =>
                                  setFormData({ ...formData, format: fmt })
                                }
                                className={`p-4 rounded-xl text-left transition-all ${
                                  isSelected
                                    ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                                    : "glass-card hover:border-slate-600"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                                    {cfg.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white text-sm mb-1">
                                      {cfg.label}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                      {cfg.description}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <svg
                                      className="w-5 h-5 text-emerald-400 shrink-0"
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
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Best Of Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Match Type
                      </label>
                      <div className="flex gap-2">
                        {[1, 3, 5, 7].map((num) => (
                          <button
                            key={num}
                            onClick={() =>
                              setFormData({ ...formData, bestOf: num })
                            }
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                              formData.bestOf === num
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {num === 1 ? "Single" : `Best of ${num}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Third Place Match Toggle */}
                    {(formData.format === "single-elimination" ||
                      formData.format === "double-elimination") && (
                      <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.thirdPlaceMatch}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              thirdPlaceMatch: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-medium text-white">
                            Third Place Match
                          </span>
                          <p className="text-sm text-slate-400">
                            Include a match to determine 3rd place
                          </p>
                        </div>
                      </label>
                    )}

                    {/* Bracket Preview */}
                    {formData.format && (
                      <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                        <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Bracket Preview
                        </h4>
                        <div className="flex items-center justify-between gap-4">
                          {/* Mini bracket visualization */}
                          <div className="flex-1 flex items-center gap-2">
                            {formData.format === "single-elimination" && (
                              <>
                                <div className="flex flex-col gap-1">
                                  <div className="w-16 h-6 rounded bg-slate-800 border border-slate-700 text-[10px] flex items-center justify-center text-slate-500">
                                    Match 1
                                  </div>
                                  <div className="w-16 h-6 rounded bg-slate-800 border border-slate-700 text-[10px] flex items-center justify-center text-slate-500">
                                    Match 2
                                  </div>
                                </div>
                                <div className="w-4 h-[1px] bg-slate-600" />
                                <div className="w-16 h-8 rounded bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-[10px] flex items-center justify-center text-amber-400 font-medium">
                                  Final
                                </div>
                              </>
                            )}
                            {formData.format === "double-elimination" && (
                              <div className="flex flex-col gap-2 text-[10px] text-slate-400">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400">
                                    Winners:
                                  </span>
                                  <div className="flex gap-1">
                                    <div className="w-8 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
                                    <div className="w-8 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-red-400">Losers:</span>
                                  <div className="flex gap-1">
                                    <div className="w-8 h-4 rounded bg-red-500/20 border border-red-500/30" />
                                    <div className="w-8 h-4 rounded bg-red-500/20 border border-red-500/30" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {formData.format === "round-robin" && (
                              <div className="grid grid-cols-4 gap-1">
                                {[...Array(16)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded ${
                                      i % 5 === 0
                                        ? "bg-slate-700"
                                        : i < 4 || i % 4 === 0
                                        ? "bg-slate-800"
                                        : "bg-emerald-500/20 border border-emerald-500/30"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            {formData.format === "swiss" && (
                              <div className="flex flex-col gap-1">
                                {[1, 2, 3].map((round) => (
                                  <div
                                    key={round}
                                    className="flex items-center gap-1"
                                  >
                                    <span className="text-[10px] text-slate-500 w-12">
                                      Round {round}
                                    </span>
                                    <div className="flex gap-1">
                                      {[...Array(4)].map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-6 h-4 rounded bg-slate-800 border border-slate-700"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {bracketSize}
                            </div>
                            <div className="text-xs text-slate-500">
                              players max
                            </div>
                            <div className="text-xs text-emerald-400 mt-1">
                              {totalRounds} rounds
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {step === 3 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      3
                    </span>
                    Schedule
                  </h2>

                  <div className="space-y-6">
                    {/* Registration Deadline */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Registration Deadline{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.registrationDeadline}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registrationDeadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Players must register before this time
                      </p>
                    </div>

                    {/* Start Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Start Date <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Start Time <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Match Duration & Break */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Match Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={formData.matchDuration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              matchDuration: parseInt(e.target.value) || 15,
                            })
                          }
                          min={5}
                          max={180}
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Break Between Matches (min)
                        </label>
                        <input
                          type="number"
                          value={formData.breakBetweenMatches}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              breakBetweenMatches:
                                parseInt(e.target.value) || 5,
                            })
                          }
                          min={0}
                          max={60}
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Estimated Duration */}
                    {formData.startDate && formData.startTime && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-emerald-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              Estimated Duration
                            </div>
                            <div className="text-xs text-slate-400">
                              ~
                              {Math.ceil(
                                totalRounds *
                                  (formData.matchDuration +
                                    formData.breakBetweenMatches)
                              )}{" "}
                              minutes ({totalRounds} rounds ×{" "}
                              {formData.matchDuration +
                                formData.breakBetweenMatches}{" "}
                              min)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Participants */}
              {step === 4 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      4
                    </span>
                    Participants
                  </h2>

                  <div className="space-y-6">
                    {/* Min/Max Participants */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Minimum Players
                        </label>
                        <input
                          type="number"
                          value={formData.minParticipants}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minParticipants: parseInt(e.target.value) || 2,
                            })
                          }
                          min={2}
                          max={formData.maxParticipants}
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Maximum Players
                        </label>
                        <input
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxParticipants: parseInt(e.target.value) || 4,
                            })
                          }
                          min={formData.minParticipants}
                          max={64}
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Quick Size Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Quick Size Selection
                      </label>
                      <div className="flex gap-2">
                        {[4, 8, 16, 32].map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                maxParticipants: size,
                                minParticipants: Math.min(
                                  formData.minParticipants,
                                  size
                                ),
                              })
                            }
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                              formData.maxParticipants === size
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {size} Players
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Seeding Method */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Seeding Method
                      </label>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          {
                            id: "random",
                            label: "Random",
                            desc: "Draw players randomly",
                            icon: "🎲",
                          },
                          {
                            id: "rating",
                            label: "By Rating",
                            desc: "Use player ratings",
                            icon: "📊",
                          },
                          {
                            id: "manual",
                            label: "Manual",
                            desc: "Set seeds yourself",
                            icon: "✏️",
                          },
                        ].map((method) => {
                          const isSelected =
                            formData.seedingMethod === method.id;
                          return (
                            <button
                              key={method.id}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  seedingMethod: method.id as
                                    | "random"
                                    | "manual"
                                    | "rating",
                                })
                              }
                              className={`p-4 rounded-xl text-left transition-all ${
                                isSelected
                                  ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                                  : "glass-card hover:border-slate-600"
                              }`}
                            >
                              <div className="text-xl mb-2">{method.icon}</div>
                              <h4 className="font-medium text-white text-sm">
                                {method.label}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {method.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Late Registration Toggle */}
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowLateRegistration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowLateRegistration: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-medium text-white">
                          Allow Late Registration
                        </span>
                        <p className="text-sm text-slate-400">
                          Players can join after the deadline if spots available
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 5: Settings */}
              {step === 5 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      5
                    </span>
                    Final Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Check-in Settings */}
                    <div className="p-4 rounded-xl bg-slate-800/30">
                      <label className="flex items-center gap-3 cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          checked={formData.requireCheckIn}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requireCheckIn: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-medium text-white">
                            Require Check-in
                          </span>
                          <p className="text-sm text-slate-400">
                            Players must confirm attendance before the
                            tournament
                          </p>
                        </div>
                      </label>

                      {formData.requireCheckIn && (
                        <div className="ml-8 mt-3">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Check-in Window (minutes before start)
                          </label>
                          <input
                            type="number"
                            value={formData.checkInWindow}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                checkInWindow: parseInt(e.target.value) || 15,
                              })
                            }
                            min={5}
                            max={120}
                            className="w-32 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      )}
                    </div>

                    {/* Prizes */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Prizes (Optional)
                      </label>
                      <div className="space-y-3">
                        {[
                          {
                            place: "1st",
                            icon: "🥇",
                            gradient: "from-amber-500",
                          },
                          {
                            place: "2nd",
                            icon: "🥈",
                            gradient: "from-slate-400",
                          },
                          {
                            place: "3rd",
                            icon: "🥉",
                            gradient: "from-amber-700",
                          },
                        ].map((prize, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${prize.gradient} to-transparent flex items-center justify-center text-lg`}
                            >
                              {prize.icon}
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={formData.prizes[i]}
                                onChange={(e) => {
                                  const newPrizes = [...formData.prizes];
                                  newPrizes[i] = e.target.value;
                                  setFormData({
                                    ...formData,
                                    prizes: newPrizes,
                                  });
                                }}
                                placeholder={`${prize.place} place prize...`}
                                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Preview */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Tournament Summary
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Name:</span>
                            <span className="text-white font-medium">
                              {formData.name || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Activity:</span>
                            <span className="text-white">
                              {activity?.label || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Format:</span>
                            <span className="text-white">
                              {format?.label || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Match Type:</span>
                            <span className="text-white">
                              {formData.bestOf === 1
                                ? "Single"
                                : `Best of ${formData.bestOf}`}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Players:</span>
                            <span className="text-white">
                              {formData.minParticipants} -{" "}
                              {formData.maxParticipants}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Seeding:</span>
                            <span className="text-white capitalize">
                              {formData.seedingMethod}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Start:</span>
                            <span className="text-white">
                              {formData.startDate && formData.startTime
                                ? `${formData.startDate} ${formData.startTime}`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Check-in:</span>
                            <span className="text-white">
                              {formData.requireCheckIn
                                ? `${formData.checkInWindow} min before`
                                : "Not required"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700/50">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-3 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center gap-2"
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
                )}
                <div className="flex-1" />
                {step < totalSteps ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      canProceed
                        ? "bg-emerald-500 text-white hover:bg-emerald-400"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7l-3-7z" />
                        </svg>
                        Create Tournament
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
