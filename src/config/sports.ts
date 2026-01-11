// Sport configuration shared across the app
export type SportType =
  | "racing"
  | "golf"
  | "padel"
  | "darts"
  | "pool"
  | "cricket"
  | "bowling"
  | "tennis"
  | "squash"
  | "soccer"
  | "rugby"
  | "netball";

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
    // Golf flag on hole
    icon: "M4 21v-7m0-4V3m0 0l8 4-8 4",
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
    // Tennis/padel racket
    icon: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3 21l6-6m3-3l9-9M12 3v3m0 12v3M3 12h3m12 0h3",
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
    // Target/dartboard
    icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
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
    // Triangle rack of 3 balls
    icon: "M12 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM7 14a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM17 14a3 3 0 1 0 0 6a3 3 0 0 0 0-6z",
  },
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
    // Steering wheel
    icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9 12H3m12 0h6M12 9V3m0 12v6",
  },
  cricket: {
    id: "cricket",
    name: "Cricket",
    slug: "cricket",
    gradient: "from-lime-500 to-green-600",
    gradientFrom: "lime-500",
    gradientTo: "green-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(132, 204, 22, 0.15) 0%, transparent 50%)",
    description: "Batting, bowling & fielding",
    // Cricket wickets - 3 stumps with bails
    icon: "M8 21V6m4 15V6m4 15V6M7 6h2m2 0h2m2 0h2",
  },
  bowling: {
    id: "bowling",
    name: "Bowling",
    slug: "bowling",
    gradient: "from-purple-500 to-violet-600",
    gradientFrom: "purple-500",
    gradientTo: "violet-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
    description: "Ten-pin bowling",
    // Bowling ball with 3 finger holes
    icon: "M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zM9 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm-2 3a1 1 0 1 1 0 2a1 1 0 0 1 0-2z",
  },
  tennis: {
    id: "tennis",
    name: "Tennis",
    slug: "tennis",
    gradient: "from-yellow-400 to-lime-500",
    gradientFrom: "yellow-400",
    gradientTo: "lime-500",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(250, 204, 21, 0.15) 0%, transparent 50%)",
    description: "Singles & doubles matches",
    // Tennis racket
    icon: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 20l5-5m3-3l9-9",
  },
  squash: {
    id: "squash",
    name: "Squash",
    slug: "squash",
    gradient: "from-orange-500 to-red-500",
    gradientFrom: "orange-500",
    gradientTo: "red-500",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
    description: "Indoor racket sport",
    // Squash racket and ball
    icon: "M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM3 3l6 6m6 6l6 6M3 21l6-6",
  },
  soccer: {
    id: "soccer",
    name: "Soccer",
    slug: "soccer",
    gradient: "from-green-500 to-emerald-600",
    gradientFrom: "green-500",
    gradientTo: "emerald-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)",
    description: "Football matches & training",
    // Soccer ball (pentagon pattern)
    icon: "M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm0 4l3 2v4l-3 2l-3-2V8l3-2zm-5 5l2 1v3l-3 1l-2-3l3-2zm10 0l3 2l-2 3l-3-1v-3l2-1z",
  },
  rugby: {
    id: "rugby",
    name: "Rugby",
    slug: "rugby",
    gradient: "from-green-600 to-teal-600",
    gradientFrom: "green-600",
    gradientTo: "teal-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)",
    description: "Union & league matches",
    // Rugby goal posts - H shape
    icon: "M6 3v18M18 3v18M6 10h12",
  },
  netball: {
    id: "netball",
    name: "Netball",
    slug: "netball",
    gradient: "from-pink-500 to-rose-600",
    gradientFrom: "pink-500",
    gradientTo: "rose-600",
    bgPattern:
      "radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
    description: "Team court sport",
    // Netball hoop and ball
    icon: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7v10M7 12h10",
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
  cricket: [
    {
      id: "batting-nets",
      name: "Batting Nets",
      description: "Practice your batting technique against various deliveries",
      duration: "20 min",
      difficulty: "beginner",
      metrics: ["Runs scored", "Shot selection"],
    },
    {
      id: "bowling-practice",
      name: "Bowling Practice",
      description: "Work on line, length, and variations",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Accuracy", "Wickets taken"],
    },
    {
      id: "fielding-drills",
      name: "Fielding Drills",
      description: "Practice catches, run-outs, and ground fielding",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Catches taken", "Direct hits"],
    },
    {
      id: "power-hitting",
      name: "Power Hitting",
      description: "Practice sixes and boundary shots",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Distance", "Timing"],
    },
    {
      id: "death-bowling",
      name: "Death Bowling",
      description: "Practice yorkers and slower balls under pressure",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Dot balls", "Runs conceded"],
    },
    {
      id: "spin-bowling",
      name: "Spin Bowling",
      description: "Work on spin variations and flight",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Turn achieved", "Wickets"],
    },
  ],
  bowling: [
    {
      id: "strike-practice",
      name: "Strike Practice",
      description: "Focus on hitting strikes consistently",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Strike rate", "Pin action"],
    },
    {
      id: "spare-conversion",
      name: "Spare Conversion",
      description: "Practice converting various spare combinations",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Spare %", "Single pin spares"],
    },
    {
      id: "split-practice",
      name: "Split Practice",
      description: "Work on difficult split conversions",
      duration: "10 min",
      difficulty: "advanced",
      metrics: ["Split conversion %", "Technique"],
    },
    {
      id: "approach-timing",
      name: "Approach & Timing",
      description: "Focus on footwork and release consistency",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Consistency", "Ball speed"],
    },
    {
      id: "lane-adjustment",
      name: "Lane Adjustment",
      description: "Practice adapting to different oil patterns",
      duration: "20 min",
      difficulty: "advanced",
      metrics: ["Pocket hits", "Adjustment speed"],
    },
    {
      id: "hook-control",
      name: "Hook Control",
      description: "Work on controlling ball curve and entry angle",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Entry angle", "Carry %"],
    },
  ],
  tennis: [
    {
      id: "serve-practice",
      name: "Serve Practice",
      description: "Work on first and second serve consistency",
      duration: "20 min",
      difficulty: "intermediate",
      metrics: ["Serve %", "Aces", "Double faults"],
    },
    {
      id: "groundstroke-rally",
      name: "Groundstroke Rally",
      description: "Practice forehand and backhand consistency",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Rally length", "Unforced errors"],
    },
    {
      id: "volley-drill",
      name: "Net Volley Drill",
      description: "Practice volleys and net play",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Volley winners", "Net points won"],
    },
    {
      id: "return-practice",
      name: "Return of Serve",
      description: "Practice returning different serve types",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Return %", "Deep returns"],
    },
    {
      id: "footwork-drill",
      name: "Footwork & Movement",
      description: "Improve court coverage and positioning",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Recovery time", "Court coverage"],
    },
    {
      id: "match-simulation",
      name: "Point Simulation",
      description: "Play out points with specific patterns",
      duration: "20 min",
      difficulty: "advanced",
      metrics: ["Points won", "Pattern execution"],
    },
  ],
  squash: [
    {
      id: "solo-hitting",
      name: "Solo Wall Hitting",
      description: "Practice consistency against the wall",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Rally length", "Accuracy"],
    },
    {
      id: "boast-drill",
      name: "Boast & Drive",
      description: "Practice boasts and straight drives",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Shot quality", "Recovery"],
    },
    {
      id: "drop-shot",
      name: "Drop Shot Practice",
      description: "Work on soft touch and drop shots",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Drop accuracy", "Tin errors"],
    },
    {
      id: "movement-ghosting",
      name: "Ghosting",
      description: "Shadow movement without the ball",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Court coverage", "Recovery speed"],
    },
    {
      id: "serve-practice",
      name: "Serve Practice",
      description: "Practice lob and power serves",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Serve accuracy", "Variation"],
    },
    {
      id: "conditioned-games",
      name: "Conditioned Games",
      description: "Play with specific shot restrictions",
      duration: "20 min",
      difficulty: "advanced",
      metrics: ["Points won", "Shot selection"],
    },
  ],
  soccer: [
    {
      id: "passing-drill",
      name: "Passing Accuracy",
      description: "Practice short and long range passing",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Pass completion", "First touch"],
    },
    {
      id: "shooting-drill",
      name: "Shooting Practice",
      description: "Work on finishing from different positions",
      duration: "20 min",
      difficulty: "intermediate",
      metrics: ["Goals scored", "Shot accuracy"],
    },
    {
      id: "dribbling-course",
      name: "Dribbling Course",
      description: "Navigate through cones with close control",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Time", "Ball control"],
    },
    {
      id: "first-touch",
      name: "First Touch Control",
      description: "Receive and control balls from various angles",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Control quality", "Speed of play"],
    },
    {
      id: "crossing-finishing",
      name: "Crossing & Finishing",
      description: "Practice crosses and headers",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Goals", "Cross accuracy"],
    },
    {
      id: "set-pieces",
      name: "Set Pieces",
      description: "Free kicks and corner practice",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Goals from set pieces", "Delivery quality"],
    },
  ],
  rugby: [
    {
      id: "passing-drill",
      name: "Passing Accuracy",
      description: "Practice spin passes and pop passes",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Accuracy", "Distance"],
    },
    {
      id: "kicking-practice",
      name: "Kicking Practice",
      description: "Work on goal kicks, punts, and grubbers",
      duration: "20 min",
      difficulty: "intermediate",
      metrics: ["Kick accuracy", "Distance"],
    },
    {
      id: "tackling-technique",
      name: "Tackling Technique",
      description: "Practice safe and effective tackling",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Tackles made", "Technique score"],
    },
    {
      id: "lineout-practice",
      name: "Lineout Practice",
      description: "Work on lineout throws and jumping",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Lineout win %", "Throw accuracy"],
    },
    {
      id: "ruck-technique",
      name: "Ruck & Breakdown",
      description: "Practice securing and cleaning rucks",
      duration: "10 min",
      difficulty: "intermediate",
      metrics: ["Turnovers won", "Penalties conceded"],
    },
    {
      id: "try-scoring",
      name: "Try Scoring Runs",
      description: "Practice finishing tries in contact",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Tries scored", "Ground gained"],
    },
  ],
  netball: [
    {
      id: "shooting-drill",
      name: "Shooting Practice",
      description: "Practice from different positions in the circle",
      duration: "20 min",
      difficulty: "intermediate",
      metrics: ["Shooting %", "Rebounds"],
    },
    {
      id: "passing-movement",
      name: "Passing & Movement",
      description: "Practice quick passing and court movement",
      duration: "15 min",
      difficulty: "beginner",
      metrics: ["Pass accuracy", "Movement quality"],
    },
    {
      id: "defensive-footwork",
      name: "Defensive Footwork",
      description: "Work on marking and interceptions",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Interceptions", "Deflections"],
    },
    {
      id: "centre-pass",
      name: "Centre Pass Plays",
      description: "Practice set plays from centre pass",
      duration: "15 min",
      difficulty: "intermediate",
      metrics: ["Possession retained", "Goals from CP"],
    },
    {
      id: "court-spacing",
      name: "Court Spacing",
      description: "Work on maintaining optimal positions",
      duration: "10 min",
      difficulty: "beginner",
      metrics: ["Space creation", "Options available"],
    },
    {
      id: "fast-break",
      name: "Fast Break Attack",
      description: "Practice quick transitions up the court",
      duration: "15 min",
      difficulty: "advanced",
      metrics: ["Speed", "Goals scored"],
    },
  ],
};
