// Sport configuration shared across the app
export type SportType = "racing" | "golf" | "padel" | "darts" | "pool";

export interface SportConfig {
  id: SportType;
  name: string;
  slug: string;
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  bgPattern: string;
  description: string;
  icon: string; // SVG path
}

export const sports: Record<SportType, SportConfig> = {
  racing: {
    id: "racing",
    name: "Sim Racing",
    slug: "racing",
    gradient: "from-red-500 to-rose-600",
    gradientFrom: "red-500",
    gradientTo: "rose-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
    description: "Virtual motorsport racing",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  golf: {
    id: "golf",
    name: "Golf",
    slug: "golf",
    gradient: "from-emerald-500 to-green-600",
    gradientFrom: "emerald-500",
    gradientTo: "green-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
    description: "Course play, sim rounds & driving range",
    icon: "M3 21h18M9 8h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
  },
  padel: {
    id: "padel",
    name: "Padel",
    slug: "padel",
    gradient: "from-amber-500 to-orange-600",
    gradientFrom: "amber-500",
    gradientTo: "orange-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
    description: "Court racket sport",
    icon: "M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5",
  },
  darts: {
    id: "darts",
    name: "Darts",
    slug: "darts",
    gradient: "from-sky-500 to-blue-600",
    gradientFrom: "sky-500",
    gradientTo: "blue-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
    description: "Precision throwing",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  pool: {
    id: "pool",
    name: "Pool",
    slug: "pool",
    gradient: "from-slate-500 to-gray-600",
    gradientFrom: "slate-500",
    gradientTo: "gray-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(100, 116, 139, 0.15) 0%, transparent 50%)",
    description: "Billiards & pool",
    icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export const sportsList = Object.values(sports);

export function getSportBySlug(slug: string): SportConfig | undefined {
  return sportsList.find((sport) => sport.slug === slug);
}

export function isValidSport(slug: string): slug is SportType {
  return slug in sports;
}

// Sport-specific drills/practice configurations
export interface Drill {
  id: string;
  name: string;
  description: string;
  duration?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  metrics?: string[];
}

export const sportDrills: Record<SportType, Drill[]> = {
  racing: [
    {
      id: "lap-consistency",
      name: "Lap Consistency",
      description: "Complete 10 laps within 0.5s of each other",
      duration: "15-20 min",
      difficulty: "intermediate",
      metrics: ["Lap time variance", "Best lap"],
    },
    {
      id: "qualifying-pace",
      name: "Qualifying Pace",
      description: "Set your fastest possible lap time",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Best lap", "Sector times"],
    },
    {
      id: "race-start",
      name: "Race Start Practice",
      description: "Practice race starts and first lap racing",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Reaction time", "Positions gained"],
    },
    {
      id: "tire-management",
      name: "Tire Management",
      description: "Complete a stint while maintaining tire life",
      duration: "20-30 min",
      difficulty: "advanced",
      metrics: ["Tire wear", "Lap time degradation"],
    },
    {
      id: "wet-driving",
      name: "Wet Weather Driving",
      description: "Practice in wet conditions",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Lap time", "Spins/offs"],
    },
    {
      id: "overtaking",
      name: "Overtaking Drills",
      description: "Practice clean overtakes against AI",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Successful passes", "Contact incidents"],
    },
  ],
  golf: [
    {
      id: "driving-range",
      name: "Driving Range",
      description: "Practice your long game with driver and woods",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Distance", "Accuracy"],
    },
    {
      id: "iron-play",
      name: "Iron Play Practice",
      description: "Work on approach shots with various irons",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Greens in regulation", "Distance control"],
    },
    {
      id: "putting-green",
      name: "Putting Green",
      description: "Practice short and long putts",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Putts made", "Distance from hole"],
    },
    {
      id: "chipping",
      name: "Chipping Practice",
      description: "Work on your short game around the green",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Up and downs", "Proximity to hole"],
    },
    {
      id: "bunker-shots",
      name: "Bunker Shots",
      description: "Practice greenside and fairway bunker shots",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Sand saves", "Distance control"],
    },
    {
      id: "course-management",
      name: "Course Management",
      description: "Play strategic holes focusing on shot selection",
      duration: "20 min",
      difficulty: "advanced",
      metrics: ["Score", "Risk/reward decisions"],
    },
  ],
  padel: [
    {
      id: "wall-returns",
      name: "Wall Returns",
      description: "Practice returning balls off the back wall",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Successful returns", "Placement accuracy"],
    },
    {
      id: "bandeja-practice",
      name: "Bandeja Practice",
      description: "Master the overhead defensive shot",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Shot accuracy", "Depth control"],
    },
    {
      id: "serve-practice",
      name: "Serve Practice",
      description: "Work on first and second serves",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["First serve %", "Ace count"],
    },
    {
      id: "net-game",
      name: "Net Game Drills",
      description: "Practice volleys and net positioning",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Winners", "Net points won"],
    },
    {
      id: "lob-defense",
      name: "Lob Defense",
      description: "Practice defending against lobs",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Successful defenses", "Counter-attack winners"],
    },
    {
      id: "match-simulation",
      name: "Match Simulation",
      description: "Practice points in match-like scenarios",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Points won", "Unforced errors"],
    },
  ],
  darts: [
    {
      id: "treble-20",
      name: "Treble 20 Practice",
      description: "Focus on hitting treble 20 consistently",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Hit rate", "Grouping"],
    },
    {
      id: "doubles-practice",
      name: "Doubles Practice",
      description: "Work on finishing with doubles",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Double hit rate", "Checkout %"],
    },
    {
      id: "around-the-board",
      name: "Around the Board",
      description: "Hit each number in sequence",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Completion time", "Darts used"],
    },
    {
      id: "checkout-routes",
      name: "Checkout Routes",
      description: "Practice various checkout combinations",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["3-dart avg", "Checkout success"],
    },
    {
      id: "pressure-finishes",
      name: "Pressure Finishes",
      description: "Practice finishing with limited darts",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Checkout %", "Avg darts to finish"],
    },
    {
      id: "170-practice",
      name: "170 Checkout Practice",
      description: "Master the maximum checkout",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Success rate", "First 9 average"],
    },
  ],
  pool: [
    {
      id: "break-shot",
      name: "Break Shot Practice",
      description: "Work on your opening break",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Balls pocketed", "Cue ball control"],
    },
    {
      id: "position-play",
      name: "Position Play",
      description: "Practice cue ball positioning",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Shape accuracy", "Run outs"],
    },
    {
      id: "safety-play",
      name: "Safety Play",
      description: "Work on defensive shots and snookers",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Successful safeties", "Opponent difficulty"],
    },
    {
      id: "run-outs",
      name: "Run Out Practice",
      description: "Clear the table from various layouts",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Tables cleared", "Avg balls remaining"],
    },
    {
      id: "bank-shots",
      name: "Bank Shots",
      description: "Practice banking balls into pockets",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Success rate", "Accuracy"],
    },
    {
      id: "pressure-shots",
      name: "Pressure Shots",
      description: "Practice difficult shots under time pressure",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Success rate", "Shot selection"],
    },
  ],
};
