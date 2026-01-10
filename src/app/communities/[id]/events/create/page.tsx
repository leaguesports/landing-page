"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ActivityType = "racing" | "golf" | "padel" | "esports" | "darts" | "pool";

const activityConfig: Record<
  ActivityType,
  { icon: string; gradient: string; label: string; description: string }
> = {
  racing: {
    icon: "🏎️",
    gradient: "from-red-500 to-rose-600",
    label: "Sim Racing",
    description: "Virtual motorsport races",
  },
  golf: {
    icon: "⛳",
    gradient: "from-emerald-500 to-green-600",
    label: "Sim Golf",
    description: "Virtual golf sessions",
  },
  padel: {
    icon: "🎾",
    gradient: "from-amber-500 to-orange-600",
    label: "Padel",
    description: "Court reservations & matches",
  },
  esports: {
    icon: "🎮",
    gradient: "from-violet-500 to-purple-600",
    label: "Esports",
    description: "Competitive gaming",
  },
  darts: {
    icon: "🎯",
    gradient: "from-sky-500 to-blue-600",
    label: "Darts",
    description: "Darts matches & leagues",
  },
  pool: {
    icon: "🎱",
    gradient: "from-slate-500 to-gray-600",
    label: "Pool",
    description: "Billiards & pool",
  },
};

const racingTracks = [
  { id: "silverstone", name: "Silverstone", country: "🇬🇧" },
  { id: "spa", name: "Spa-Francorchamps", country: "🇧🇪" },
  { id: "monza", name: "Monza", country: "🇮🇹" },
  { id: "monaco", name: "Monaco", country: "🇲🇨" },
  { id: "suzuka", name: "Suzuka", country: "🇯🇵" },
  { id: "nurburgring", name: "Nürburgring", country: "🇩🇪" },
  { id: "cota", name: "Circuit of the Americas", country: "🇺🇸" },
  { id: "interlagos", name: "Interlagos", country: "🇧🇷" },
];

const golfCourses = [
  { id: "pebble", name: "Pebble Beach", location: "California" },
  { id: "standrews", name: "St Andrews", location: "Scotland" },
  { id: "augusta", name: "Augusta National", location: "Georgia" },
  { id: "torrey", name: "Torrey Pines", location: "California" },
  { id: "bethpage", name: "Bethpage Black", location: "New York" },
];

export default function CreateEventPage() {
  const params = useParams();
  const router = useRouter();
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    maxParticipants: 24,
    isRecurring: false,
    // Racing
    track: "",
    laps: 15,
    carClass: "GT3",
    qualifyingEnabled: true,
    // Golf
    course: "",
    holes: 18 as 9 | 18,
    format: "stroke",
    handicapEnabled: true,
  });

  const config = activityType ? activityConfig[activityType] : null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(`/communities/${params.id}`);
  };

  const isValid = () => {
    if (!formData.name || !formData.date || !formData.time) return false;
    if (activityType === "racing" && !formData.track) return false;
    if (activityType === "golf" && !formData.course) return false;
    return true;
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
        <div className="max-w-3xl mx-auto">
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

          {/* Activity Type Selection */}
          {!activityType ? (
            <div className="animate-fade-in-up">
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
                Create <span className="gradient-text">Event</span>
              </h1>
              <p className="text-slate-400 mb-8">
                What type of event are you organizing?
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(activityConfig) as ActivityType[]).map((type) => {
                  const cfg = activityConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setActivityType(type)}
                      className="glass-card rounded-2xl p-6 text-left hover:border-primary/50 transition-all group"
                    >
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                      >
                        {cfg.icon}
                      </div>
                      <h3 className="font-bold text-white mb-1">{cfg.label}</h3>
                      <p className="text-sm text-slate-400">
                        {cfg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Event Form */
            <div className="animate-fade-in-up">
              {/* Header with activity type */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setActivityType(null)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config?.gradient} flex items-center justify-center text-2xl`}
                >
                  {config?.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-heading">
                    New {config?.label} Event
                  </h1>
                  <p className="text-sm text-slate-400">
                    Fill in the details below
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div
                  className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${config?.gradient} opacity-5 blur-3xl`}
                />

                <div className="relative z-10 space-y-6">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Event Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={
                        activityType === "racing"
                          ? "e.g., Sunday Sprint Championship"
                          : activityType === "golf"
                          ? "e.g., Weekend Stroke Play"
                          : "Enter event name..."
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
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
                      placeholder="What can participants expect?"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: parseInt(e.target.value) || 2,
                        })
                      }
                      min={2}
                      max={100}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Recurring Toggle */}
                  <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isRecurring: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-white">
                        Recurring Event
                      </span>
                      <p className="text-sm text-slate-400">
                        Repeat this event weekly
                      </p>
                    </div>
                  </label>

                  {/* Activity-Specific Settings */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${config?.gradient}`}
                      />
                      {config?.label} Settings
                    </h3>

                    {/* Racing Settings */}
                    {activityType === "racing" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Track <span className="text-red-400">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {racingTracks.map((track) => (
                              <button
                                key={track.id}
                                onClick={() =>
                                  setFormData({ ...formData, track: track.id })
                                }
                                className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
                                  formData.track === track.id
                                    ? "border-primary bg-primary/10"
                                    : "border-slate-700 hover:border-slate-600"
                                }`}
                              >
                                <span className="mr-2">{track.country}</span>
                                {track.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Laps
                            </label>
                            <input
                              type="number"
                              value={formData.laps}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  laps: parseInt(e.target.value) || 1,
                                })
                              }
                              min={1}
                              max={100}
                              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Car Class
                            </label>
                            <select
                              value={formData.carClass}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  carClass: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-primary"
                            >
                              <option value="GT3">GT3</option>
                              <option value="GT4">GT4</option>
                              <option value="F1">Formula 1</option>
                              <option value="LMP2">LMP2</option>
                              <option value="Open">Open (Any)</option>
                            </select>
                          </div>
                        </div>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.qualifyingEnabled}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualifyingEnabled: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-300">
                            Include qualifying session
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Golf Settings */}
                    {activityType === "golf" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Course <span className="text-red-400">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {golfCourses.map((course) => (
                              <button
                                key={course.id}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    course: course.id,
                                  })
                                }
                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                  formData.course === course.id
                                    ? "border-primary bg-primary/10"
                                    : "border-slate-700 hover:border-slate-600"
                                }`}
                              >
                                <span className="font-medium text-sm block">
                                  {course.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {course.location}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Holes
                            </label>
                            <div className="flex gap-2">
                              {[9, 18].map((h) => (
                                <button
                                  key={h}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      holes: h as 9 | 18,
                                    })
                                  }
                                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                                    formData.holes === h
                                      ? "bg-primary text-slate-950"
                                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                  }`}
                                >
                                  {h} Holes
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Format
                            </label>
                            <select
                              value={formData.format}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  format: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-primary"
                            >
                              <option value="stroke">Stroke Play</option>
                              <option value="match">Match Play</option>
                              <option value="scramble">Scramble</option>
                              <option value="best-ball">Best Ball</option>
                            </select>
                          </div>
                        </div>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.handicapEnabled}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                handicapEnabled: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-300">
                            Enable handicaps
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Generic placeholder for other activities */}
                    {!["racing", "golf"].includes(activityType) && (
                      <p className="text-slate-400 text-sm">
                        Additional {config?.label} settings coming soon.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Link
                      href={`/communities/${params.id}`}
                      className="flex-1 px-5 py-3 rounded-xl bg-slate-700 text-white text-center hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      onClick={handleSubmit}
                      disabled={!isValid() || isSubmitting}
                      className={`flex-1 px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r ${config?.gradient} text-white hover:opacity-90`}
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
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create Event</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
