"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  type: "tournament" | "league" | "casual" | "practice";
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "live" | "completed";
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  wins: number;
  losses: number;
  trend: "up" | "down" | "same";
}

interface CalendarEvent {
  id: string;
  name: string;
  date: string;
  type: "tournament" | "league" | "casual" | "practice";
}

interface Community {
  id: string;
  name: string;
  description: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  objective: string;
  type: "speed" | "score" | "streak" | "milestone" | "weekly";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  reward: string;
  totalMembers: number;
  completions: number;
  attempts: number;
  deadline: string;
  status: "active" | "completed" | "expired";
  topCompleters?: { name: string; avatar: string; value: string }[];
  userProgress?: number;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "admin" | "moderator" | "member";
  joinedDate: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  status: "online" | "offline" | "away";
  badges: string[];
}

interface FeedItem {
  id: string;
  type:
    | "event"
    | "leaderboard"
    | "post"
    | "achievement"
    | "welcome"
    | "challenge";
  timestamp: string;
  user?: { name: string; avatar: string };
  content: string;
  details?: string;
  likes?: number;
  comments?: number;
  metadata?: {
    eventName?: string;
    oldRank?: number;
    newRank?: number;
    badgeName?: string;
    challengeName?: string;
  };
}

const mockMembers: Member[] = [
  {
    id: "1",
    name: "Alex Thompson",
    avatar: "AT",
    role: "owner",
    joinedDate: "2024-01-15",
    matchesPlayed: 156,
    wins: 128,
    losses: 28,
    points: 2450,
    status: "online",
    badges: ["🏆", "⚡", "🔥"],
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar: "SC",
    role: "admin",
    joinedDate: "2024-02-20",
    matchesPlayed: 142,
    wins: 118,
    losses: 24,
    points: 2380,
    status: "online",
    badges: ["🏆", "🎯"],
  },
  {
    id: "3",
    name: "Marcus Williams",
    avatar: "MW",
    role: "moderator",
    joinedDate: "2024-03-10",
    matchesPlayed: 128,
    wins: 102,
    losses: 26,
    points: 2210,
    status: "away",
    badges: ["⚡"],
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    avatar: "ER",
    role: "member",
    joinedDate: "2024-04-05",
    matchesPlayed: 98,
    wins: 76,
    losses: 22,
    points: 2150,
    status: "offline",
    badges: ["🎯", "🔥"],
  },
  {
    id: "5",
    name: "James Park",
    avatar: "JP",
    role: "member",
    joinedDate: "2024-05-12",
    matchesPlayed: 87,
    wins: 65,
    losses: 22,
    points: 2080,
    status: "online",
    badges: ["⚡"],
  },
  {
    id: "6",
    name: "Lisa Anderson",
    avatar: "LA",
    role: "member",
    joinedDate: "2024-06-01",
    matchesPlayed: 76,
    wins: 54,
    losses: 22,
    points: 1990,
    status: "offline",
    badges: [],
  },
  {
    id: "7",
    name: "David Kim",
    avatar: "DK",
    role: "member",
    joinedDate: "2024-07-18",
    matchesPlayed: 65,
    wins: 45,
    losses: 20,
    points: 1920,
    status: "online",
    badges: ["🔥"],
  },
  {
    id: "8",
    name: "Rachel Green",
    avatar: "RG",
    role: "member",
    joinedDate: "2024-08-22",
    matchesPlayed: 54,
    wins: 38,
    losses: 16,
    points: 1850,
    status: "away",
    badges: [],
  },
  {
    id: "9",
    name: "Michael Brown",
    avatar: "MB",
    role: "member",
    joinedDate: "2024-09-10",
    matchesPlayed: 42,
    wins: 28,
    losses: 14,
    points: 1720,
    status: "offline",
    badges: [],
  },
  {
    id: "10",
    name: "Jessica Taylor",
    avatar: "JT",
    role: "member",
    joinedDate: "2024-10-05",
    matchesPlayed: 31,
    wins: 18,
    losses: 13,
    points: 1580,
    status: "online",
    badges: [],
  },
  {
    id: "11",
    name: "Chris Martinez",
    avatar: "CM",
    role: "member",
    joinedDate: "2024-11-12",
    matchesPlayed: 22,
    wins: 12,
    losses: 10,
    points: 1420,
    status: "offline",
    badges: [],
  },
  {
    id: "12",
    name: "Amanda White",
    avatar: "AW",
    role: "member",
    joinedDate: "2024-12-01",
    matchesPlayed: 15,
    wins: 8,
    losses: 7,
    points: 1280,
    status: "online",
    badges: [],
  },
];

const mockFeed: FeedItem[] = [
  {
    id: "1",
    type: "event",
    timestamp: "2026-01-08T10:30:00",
    content: "New event announced",
    details:
      "Winter Championship Finals is now open for registration! 32 spots available.",
    metadata: { eventName: "Winter Championship Finals" },
    likes: 24,
    comments: 8,
  },
  {
    id: "2",
    type: "achievement",
    timestamp: "2026-01-08T09:15:00",
    user: { name: "Sarah Chen", avatar: "SC" },
    content: "earned a new badge",
    details: "Completed the Fastest Lap Challenge with a time of 1:27.891!",
    metadata: { badgeName: "Speed Demon" },
    likes: 45,
    comments: 12,
  },
  {
    id: "3",
    type: "leaderboard",
    timestamp: "2026-01-08T08:00:00",
    user: { name: "Marcus Williams", avatar: "MW" },
    content: "moved up in the rankings",
    details:
      "After an impressive winning streak, Marcus has climbed the leaderboard!",
    metadata: { oldRank: 5, newRank: 3 },
    likes: 32,
    comments: 6,
  },
  {
    id: "4",
    type: "post",
    timestamp: "2026-01-07T18:45:00",
    user: { name: "Alex Thompson", avatar: "AT" },
    content: "shared an update",
    details:
      "Great matches tonight everyone! The competition is really heating up. Looking forward to seeing you all at the Winter Championship. Remember to practice those tricky corners! 🏎️",
    likes: 56,
    comments: 14,
  },
  {
    id: "5",
    type: "welcome",
    timestamp: "2026-01-07T14:20:00",
    user: { name: "Amanda White", avatar: "AW" },
    content: "joined the community",
    details:
      "Welcome to Sunday Sim Golf League! Say hello and help them get started.",
    likes: 28,
    comments: 9,
  },
  {
    id: "6",
    type: "challenge",
    timestamp: "2026-01-07T12:00:00",
    content: "New challenge available",
    details:
      "Can you beat the Sub-Par Round challenge? Score below 72 in a full 18-hole round to earn 350 XP and the Pro Badge!",
    metadata: { challengeName: "Sub-Par Round" },
    likes: 38,
    comments: 5,
  },
  {
    id: "7",
    type: "achievement",
    timestamp: "2026-01-07T10:30:00",
    user: { name: "James Park", avatar: "JP" },
    content: "completed a challenge",
    details:
      "Successfully completed the Hot Streak challenge with 5 consecutive wins!",
    metadata: { challengeName: "Hot Streak", badgeName: "Fire Badge" },
    likes: 41,
    comments: 11,
  },
  {
    id: "8",
    type: "leaderboard",
    timestamp: "2026-01-06T20:00:00",
    user: { name: "Emily Rodriguez", avatar: "ER" },
    content: "dropped in the rankings",
    details:
      "Emily slipped a few spots but is still in the top 5. Keep pushing!",
    metadata: { oldRank: 3, newRank: 4 },
    likes: 15,
    comments: 4,
  },
  {
    id: "9",
    type: "post",
    timestamp: "2026-01-06T16:30:00",
    user: { name: "Lisa Anderson", avatar: "LA" },
    content: "asked a question",
    details:
      "Does anyone have tips for improving lap times on the Monaco circuit? I keep losing time in the hairpin section. Any advice would be appreciated! 🙏",
    likes: 22,
    comments: 18,
  },
  {
    id: "10",
    type: "event",
    timestamp: "2026-01-06T10:00:00",
    content: "Event reminder",
    details:
      "Weekly League Round 8 starts tomorrow at 6:00 PM. Make sure you've confirmed your participation!",
    metadata: { eventName: "Weekly League Round 8" },
    likes: 19,
    comments: 3,
  },
];

const mockEvents: Event[] = [
  {
    id: "1",
    name: "Winter Championship Finals",
    date: "2026-01-15",
    time: "14:00",
    type: "tournament",
    participants: 32,
    maxParticipants: 32,
    status: "upcoming",
  },
  {
    id: "2",
    name: "Weekly League Round 8",
    date: "2026-01-12",
    time: "18:00",
    type: "league",
    participants: 24,
    maxParticipants: 30,
    status: "live",
  },
  {
    id: "3",
    name: "Casual Friday Night",
    date: "2026-01-10",
    time: "20:00",
    type: "casual",
    participants: 12,
    maxParticipants: 20,
    status: "upcoming",
  },
  {
    id: "4",
    name: "Pro Skills Workshop",
    date: "2026-01-18",
    time: "10:00",
    type: "practice",
    participants: 8,
    maxParticipants: 15,
    status: "upcoming",
  },
  {
    id: "5",
    name: "January Open Tournament",
    date: "2026-01-25",
    time: "13:00",
    type: "tournament",
    participants: 18,
    maxParticipants: 64,
    status: "upcoming",
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Alex Thompson",
    avatar: "AT",
    points: 2450,
    wins: 28,
    losses: 4,
    trend: "same",
  },
  {
    rank: 2,
    name: "Sarah Chen",
    avatar: "SC",
    points: 2380,
    wins: 26,
    losses: 6,
    trend: "up",
  },
  {
    rank: 3,
    name: "Marcus Williams",
    avatar: "MW",
    points: 2210,
    wins: 24,
    losses: 8,
    trend: "up",
  },
  {
    rank: 4,
    name: "Emily Rodriguez",
    avatar: "ER",
    points: 2150,
    wins: 22,
    losses: 10,
    trend: "down",
  },
  {
    rank: 5,
    name: "James Park",
    avatar: "JP",
    points: 2080,
    wins: 21,
    losses: 11,
    trend: "up",
  },
  {
    rank: 6,
    name: "Lisa Anderson",
    avatar: "LA",
    points: 1990,
    wins: 19,
    losses: 13,
    trend: "down",
  },
  {
    rank: 7,
    name: "David Kim",
    avatar: "DK",
    points: 1920,
    wins: 18,
    losses: 14,
    trend: "same",
  },
  {
    rank: 8,
    name: "Rachel Green",
    avatar: "RG",
    points: 1850,
    wins: 17,
    losses: 15,
    trend: "up",
  },
];

const mockChallenges: Challenge[] = [
  {
    id: "1",
    name: "Fastest Lap Challenge",
    description:
      "Set the fastest lap time on the Silverstone circuit this month.",
    objective: "Complete a lap in under 1:28.500",
    type: "speed",
    difficulty: "expert",
    reward: "500 XP + Speed Demon Badge",
    totalMembers: 156,
    completions: 8,
    attempts: 234,
    deadline: "2026-01-31",
    status: "active",
    topCompleters: [
      { name: "Alex Thompson", avatar: "AT", value: "1:27.342" },
      { name: "Sarah Chen", avatar: "SC", value: "1:27.891" },
      { name: "Marcus Williams", avatar: "MW", value: "1:28.105" },
    ],
  },
  {
    id: "2",
    name: "Eagle Eye",
    description: "Score an eagle or better on any par 5 hole.",
    objective: "Get 3 under par on a single hole",
    type: "score",
    difficulty: "advanced",
    reward: "400 XP + Eagle Badge",
    totalMembers: 156,
    completions: 23,
    attempts: 412,
    deadline: "2026-02-28",
    status: "active",
    topCompleters: [
      { name: "James Park", avatar: "JP", value: "Albatross (-3)" },
      { name: "Emily Rodriguez", avatar: "ER", value: "Eagle (-2)" },
      { name: "Lisa Anderson", avatar: "LA", value: "Eagle (-2)" },
    ],
  },
  {
    id: "3",
    name: "Weekly Warrior",
    description:
      "Complete 5 matches this week with a positive score differential.",
    objective: "Play 5 matches with combined +10 score",
    type: "weekly",
    difficulty: "intermediate",
    reward: "200 XP + Weekly Warrior Title",
    totalMembers: 156,
    completions: 45,
    attempts: 89,
    deadline: "2026-01-12",
    status: "active",
    userProgress: 60,
  },
  {
    id: "4",
    name: "Hot Streak",
    description: "Win 5 consecutive matches without a loss.",
    objective: "5 wins in a row",
    type: "streak",
    difficulty: "intermediate",
    reward: "300 XP + Fire Badge",
    totalMembers: 156,
    completions: 12,
    attempts: 78,
    deadline: "2026-01-31",
    status: "active",
    userProgress: 40,
    topCompleters: [
      { name: "Alex Thompson", avatar: "AT", value: "12 streak" },
      { name: "David Kim", avatar: "DK", value: "8 streak" },
      { name: "Rachel Green", avatar: "RG", value: "6 streak" },
    ],
  },
  {
    id: "5",
    name: "Century Club",
    description: "Reach 100 total matches played in the community.",
    objective: "Play 100 matches",
    type: "milestone",
    difficulty: "beginner",
    reward: "1000 XP + Century Badge",
    totalMembers: 156,
    completions: 34,
    attempts: 156,
    deadline: "2026-12-31",
    status: "active",
    userProgress: 78,
  },
  {
    id: "6",
    name: "Sub-Par Round",
    description: "Complete a full 18-hole round under par.",
    objective: "Score below 72 in a round",
    type: "score",
    difficulty: "advanced",
    reward: "350 XP + Pro Badge",
    totalMembers: 156,
    completions: 41,
    attempts: 523,
    deadline: "2026-03-01",
    status: "active",
    topCompleters: [
      { name: "Alex Thompson", avatar: "AT", value: "64 (-8)" },
      { name: "Sarah Chen", avatar: "SC", value: "67 (-5)" },
      { name: "Marcus Williams", avatar: "MW", value: "68 (-4)" },
    ],
  },
];

// Generate calendar events for the current month
const generateCalendarEvents = (): CalendarEvent[] => {
  return mockEvents.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date,
    type: event.type,
  }));
};

export default function CommunityLandingPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<
    "feed" | "events" | "leaderboard" | "calendar" | "challenges" | "members"
  >("feed");
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    activityType: string;
    players: string[];
    startTime: Date;
  } | null>(null);

  useEffect(() => {
    async function fetchCommunity() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          API_ENDPOINTS.COMMUNITY(params.id as string),
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch community");
        }

        const data = await response.json();
        setCommunity(data);

        // Load mock data for events/leaderboard/challenges/members/feed (to be replaced with API calls later)
        setEvents(mockEvents);
        setLeaderboard(mockLeaderboard);
        setChallenges(mockChallenges);
        setMembers(mockMembers);
        setFeed(mockFeed);
        setCalendarEvents(generateCalendarEvents());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchCommunity();
    }
  }, [params.id]);

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "tournament":
        return "from-amber-500 to-orange-600";
      case "league":
        return "from-primary to-emerald-600";
      case "casual":
        return "from-sky-500 to-blue-600";
      case "practice":
        return "from-violet-500 to-purple-600";
    }
  };

  const getEventTypeBadge = (type: Event["type"]) => {
    switch (type) {
      case "tournament":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "league":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "casual":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "practice":
        return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    }
  };

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Live
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
            Completed
          </span>
        );
    }
  };

  const getTrendIcon = (trend: LeaderboardEntry["trend"]) => {
    switch (trend) {
      case "up":
        return (
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        );
      case "down":
        return (
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        );
      case "same":
        return (
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950";
    if (rank === 2)
      return "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950";
    if (rank === 3)
      return "bg-gradient-to-br from-amber-600 to-amber-800 text-white";
    return "bg-slate-700 text-slate-300";
  };

  const getChallengeTypeColor = (type: Challenge["type"]) => {
    switch (type) {
      case "speed":
        return "from-rose-500 to-pink-600";
      case "score":
        return "from-amber-500 to-orange-600";
      case "streak":
        return "from-orange-500 to-red-600";
      case "milestone":
        return "from-cyan-500 to-blue-600";
      case "weekly":
        return "from-violet-500 to-purple-600";
    }
  };

  const getChallengeTypeIcon = (type: Challenge["type"]) => {
    switch (type) {
      case "speed":
        return (
          <svg
            className="w-6 h-6 text-white"
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
        );
      case "score":
        return (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case "streak":
        return (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
          </svg>
        );
      case "milestone":
        return (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      case "weekly":
        return (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const getDifficultyBadge = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "intermediate":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "advanced":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "expert":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  const getChallengeStatusBadge = (status: Challenge["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Active
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <svg
              className="w-3 h-3"
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
            Completed
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
            Expired
          </span>
        );
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendarEvents.filter((event) => event.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen noise">
        <div className="mesh-gradient" />
        <div className="fixed inset-0 grid-pattern pointer-events-none" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-6" />
            <p className="text-slate-400">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="relative min-h-screen noise">
        <div className="mesh-gradient" />
        <div className="fixed inset-0 grid-pattern pointer-events-none" />
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-heading mb-3">
              Community not found
            </h2>
            <p className="text-slate-400 mb-8">
              {error ||
                "The community you're looking for doesn't exist or you don't have access."}
            </p>
            <Link
              href="/communities"
              className="btn-primary px-6 py-3 rounded-xl inline-block"
            >
              <span>Back to communities</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                href="/communities"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Communities
              </Link>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <button className="btn-primary px-4 sm:px-5 py-2.5 rounded-full text-sm hidden sm:block">
                <span>Join Community</span>
              </button>
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
                href="/communities"
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Communities
              </Link>
              <Link
                href="/login"
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign In
              </Link>
              <button className="w-full btn-primary px-5 py-3 rounded-xl text-sm font-medium">
                <span>Join Community</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back link */}
          <Link
            href="/communities"
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
            <span>Back to communities</span>
          </Link>

          {/* Community Header */}
          <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden mb-8 animate-fade-in-up">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
                  {community.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold font-heading mb-2">
                    {community.name}
                  </h1>
                  <p className="text-slate-400 max-w-2xl mb-4">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-slate-300">
                        <span className="font-semibold text-white">
                          {events.length}
                        </span>{" "}
                        upcoming events
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto justify-start lg:justify-end">
                <button className="btn-secondary px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base">
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Share</span>
                </button>
                <Link
                  href={`/communities/${params.id}/tournaments/create`}
                  className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90 transition-opacity font-medium"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7l-3-7z" />
                  </svg>
                  <span className="hidden sm:inline">Tournament</span>
                  <span className="sm:hidden">🏆</span>
                </Link>
                <Link
                  href={`/communities/${params.id}/events/create`}
                  className="btn-primary px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="hidden sm:inline">New Event</span>
                  <span className="sm:hidden">New</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up animation-delay-100 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              {
                id: "feed",
                label: "Feed",
                icon: (
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
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                ),
              },
              {
                id: "events",
                label: "Events",
                icon: (
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                ),
              },
              {
                id: "challenges",
                label: "Challenges",
                icon: (
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
                ),
              },
              {
                id: "leaderboard",
                label: "Leaderboard",
                icon: (
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
              {
                id: "calendar",
                label: "Calendar",
                icon: (
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                id: "members",
                label: "Members",
                icon: (
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-slate-950"
                    : "glass-card text-slate-300 hover:text-white hover:border-primary/30"
                }`}
              >
                <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Feed Tab */}
          {activeTab === "feed" && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Feed */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-heading">
                      Community Feed
                    </h2>
                    <select className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary">
                      <option value="all">All Updates</option>
                      <option value="events">Events</option>
                      <option value="achievements">Achievements</option>
                      <option value="leaderboard">Leaderboard</option>
                      <option value="posts">Posts</option>
                    </select>
                  </div>

                  {/* Create Post */}
                  <div className="glass-card rounded-2xl p-5 mb-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        YO
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Share something with the community..."
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                          rows={2}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
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
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
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
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          </div>
                          <button className="btn-primary px-4 py-2 rounded-lg text-sm">
                            <span>Post</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feed Items */}
                  <div className="space-y-4">
                    {feed.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all"
                      >
                        <div className="flex gap-4">
                          {/* Icon or Avatar */}
                          {item.user ? (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {item.user.avatar}
                            </div>
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                item.type === "event"
                                  ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                  : item.type === "challenge"
                                  ? "bg-gradient-to-br from-violet-500 to-purple-600"
                                  : "bg-gradient-to-br from-primary to-emerald-600"
                              }`}
                            >
                              {item.type === "event" && (
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                              {item.type === "challenge" && (
                                <svg
                                  className="w-6 h-6 text-white"
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
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                {item.user ? (
                                  <p className="text-sm">
                                    <span className="font-bold text-white hover:text-primary cursor-pointer">
                                      {item.user.name}
                                    </span>{" "}
                                    <span className="text-slate-400">
                                      {item.content}
                                    </span>
                                    {item.type === "achievement" &&
                                      item.metadata?.badgeName && (
                                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                          🏆 {item.metadata.badgeName}
                                        </span>
                                      )}
                                    {item.type === "leaderboard" &&
                                      item.metadata?.newRank && (
                                        <span
                                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                            item.metadata.newRank <
                                            (item.metadata.oldRank || 0)
                                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                                          }`}
                                        >
                                          {item.metadata.newRank <
                                          (item.metadata.oldRank || 0)
                                            ? "↑"
                                            : "↓"}{" "}
                                          #{item.metadata.newRank}
                                        </span>
                                      )}
                                  </p>
                                ) : (
                                  <p className="font-bold text-white">
                                    {item.content}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {new Date(item.timestamp).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                              <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
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
                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Content */}
                            <p className="text-slate-300 text-sm mb-3">
                              {item.details}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-sm">
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
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                                <span>{item.likes || 0}</span>
                              </button>
                              <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-sm">
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
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                <span>{item.comments || 0}</span>
                              </button>
                              <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-sm">
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
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                  />
                                </svg>
                                <span>Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  <div className="mt-6 text-center">
                    <button className="btn-secondary px-6 py-3 rounded-xl">
                      Load More
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                  {/* Quick Stats */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-bold font-heading mb-4">
                      Activity Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">
                          Posts today
                        </span>
                        <span className="font-bold text-primary">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">
                          New achievements
                        </span>
                        <span className="font-bold text-amber-400">5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">
                          Leaderboard changes
                        </span>
                        <span className="font-bold text-violet-400">8</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">
                          New members
                        </span>
                        <span className="font-bold text-emerald-400">3</span>
                      </div>
                    </div>
                  </div>

                  {/* Trending Topics */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-bold font-heading mb-4">Trending</h3>
                    <div className="space-y-3">
                      {[
                        { tag: "#WinterChampionship", posts: 24 },
                        { tag: "#FastestLap", posts: 18 },
                        { tag: "#NewRecord", posts: 12 },
                        { tag: "#Tips", posts: 9 },
                      ].map((topic) => (
                        <div
                          key={topic.tag}
                          className="flex items-center justify-between hover:bg-slate-800/50 -mx-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          <span className="text-primary font-medium text-sm">
                            {topic.tag}
                          </span>
                          <span className="text-xs text-slate-500">
                            {topic.posts} posts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Now */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-bold font-heading mb-4">Active Now</h3>
                    <div className="flex flex-wrap gap-2">
                      {members
                        .filter((m) => m.status === "online")
                        .slice(0, 6)
                        .map((member) => (
                          <div
                            key={member.id}
                            className="relative group cursor-pointer"
                            title={member.name}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold group-hover:ring-2 ring-primary transition-all">
                              {member.avatar}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                          </div>
                        ))}
                      {members.filter((m) => m.status === "online").length >
                        6 && (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                          +
                          {members.filter((m) => m.status === "online").length -
                            6}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      {members.filter((m) => m.status === "online").length}{" "}
                      members online
                    </p>
                  </div>

                  {/* Upcoming Event */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-bold font-heading mb-4">Next Event</h3>
                    {events[0] && (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {events[0].name}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {new Date(events[0].date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}{" "}
                              at {events[0].time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-slate-400">Participants</span>
                          <span>
                            <span className="text-white font-medium">
                              {events[0].participants}
                            </span>
                            <span className="text-slate-500">
                              {" "}
                              / {events[0].maxParticipants}
                            </span>
                          </span>
                        </div>
                        <button className="w-full btn-secondary py-2.5 rounded-xl text-sm">
                          View Event
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-heading">
                  Upcoming Events
                </h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary">
                    <option value="all">All Types</option>
                    <option value="tournament">Tournaments</option>
                    <option value="league">Leagues</option>
                    <option value="casual">Casual</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>
              </div>

              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getEventTypeColor(
                          event.type
                        )} flex items-center justify-center flex-shrink-0`}
                      >
                        {event.type === "tournament" && (
                          <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                        )}
                        {event.type === "league" && (
                          <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        )}
                        {event.type === "casual" && (
                          <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {event.type === "practice" && (
                          <svg
                            className="w-7 h-7 text-white"
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
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold font-heading group-hover:text-primary transition-colors">
                            {event.name}
                          </h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1.5">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {event.time}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getEventTypeBadge(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-400">
                          Participants
                        </div>
                        <div className="font-semibold">
                          <span
                            className={
                              event.participants >= event.maxParticipants
                                ? "text-red-400"
                                : "text-white"
                            }
                          >
                            {event.participants}
                          </span>
                          <span className="text-slate-500">
                            {" "}
                            / {event.maxParticipants}
                          </span>
                        </div>
                      </div>
                      <button className="btn-secondary px-4 py-2.5 rounded-xl text-sm whitespace-nowrap">
                        {event.participants >= event.maxParticipants
                          ? "Join Waitlist"
                          : "Register"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === "challenges" && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-heading">
                    Active Challenges
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Complete challenges to earn XP, badges, and bragging rights
                  </p>
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary">
                    <option value="all">All Types</option>
                    <option value="speed">Speed Challenges</option>
                    <option value="score">Score Challenges</option>
                    <option value="streak">Streaks</option>
                    <option value="milestone">Milestones</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <select className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              {/* Challenge Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Active Challenges",
                    value: challenges.filter((c) => c.status === "active")
                      .length,
                    icon: "⚡",
                  },
                  {
                    label: "Total Completions",
                    value: challenges.reduce(
                      (sum, c) => sum + c.completions,
                      0
                    ),
                    icon: "🏆",
                  },
                  {
                    label: "Total Attempts",
                    value: challenges
                      .reduce((sum, c) => sum + c.attempts, 0)
                      .toLocaleString(),
                    icon: "🎯",
                  },
                  {
                    label: "Community Members",
                    value: challenges[0]?.totalMembers || 0,
                    icon: "👥",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Challenges Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {challenges.map((challenge, index) => (
                  <div
                    key={challenge.id}
                    className={`glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden ${
                      challenge.status === "completed" ? "opacity-75" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Background decoration */}
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${getChallengeTypeColor(
                        challenge.type
                      )} opacity-5 blur-2xl`}
                    />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getChallengeTypeColor(
                              challenge.type
                            )} flex items-center justify-center flex-shrink-0`}
                          >
                            {getChallengeTypeIcon(challenge.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold font-heading group-hover:text-primary transition-colors">
                                {challenge.name}
                              </h3>
                              {getChallengeStatusBadge(challenge.status)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getDifficultyBadge(
                                  challenge.difficulty
                                )}`}
                              >
                                {challenge.difficulty}
                              </span>
                              <span className="text-xs text-slate-500 capitalize">
                                {challenge.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm mb-3">
                        {challenge.description}
                      </p>

                      {/* Objective */}
                      <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-sm">
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-slate-300 font-medium">
                            {challenge.objective}
                          </span>
                        </div>
                      </div>

                      {/* Completion Stats */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-400">
                            Community Progress
                          </span>
                          <span className="text-primary font-medium">
                            {challenge.completions} / {challenge.totalMembers}{" "}
                            completed
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getChallengeTypeColor(
                              challenge.type
                            )} transition-all duration-500`}
                            style={{
                              width: `${
                                (challenge.completions /
                                  challenge.totalMembers) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1.5 text-slate-500">
                          <span>{challenge.attempts} attempts</span>
                          <span>
                            {Math.round(
                              (challenge.completions / challenge.totalMembers) *
                                100
                            )}
                            % completion rate
                          </span>
                        </div>
                      </div>

                      {/* User Progress (if applicable) */}
                      {challenge.userProgress !== undefined &&
                        challenge.status === "active" && (
                          <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-slate-300">
                                Your Progress
                              </span>
                              <span className="text-primary font-medium">
                                {challenge.userProgress}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                                style={{ width: `${challenge.userProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                      {/* Top Completers */}
                      {challenge.topCompleters &&
                        challenge.topCompleters.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-slate-400 mb-2">
                              Top Performers
                            </div>
                            <div className="space-y-2">
                              {challenge.topCompleters
                                .slice(0, 3)
                                .map((completer, idx) => (
                                  <div
                                    key={completer.name}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                          idx === 0
                                            ? "bg-amber-500 text-slate-950"
                                            : idx === 1
                                            ? "bg-slate-400 text-slate-950"
                                            : "bg-amber-700 text-white"
                                        }`}
                                      >
                                        {idx + 1}
                                      </span>
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-medium">
                                        {completer.avatar}
                                      </div>
                                      <span className="text-slate-300">
                                        {completer.name}
                                      </span>
                                    </div>
                                    <span className="text-primary font-mono text-xs">
                                      {completer.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Ends{" "}
                            {new Date(challenge.deadline).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </div>
                        </div>
                        {challenge.status === "active" && (
                          <button className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium">
                            Try Challenge
                          </button>
                        )}
                        {challenge.status === "completed" && (
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Challenge Ended
                          </span>
                        )}
                      </div>

                      {/* Reward */}
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-amber-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-slate-300">
                            {challenge.reward}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Challenge CTA */}
              <div className="mt-8 glass-card rounded-2xl p-6 md:p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary mx-auto mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-heading mb-2">
                  Create a Challenge
                </h3>
                <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
                  Challenge other players to 1v1 matches or create
                  community-wide challenges to boost engagement.
                </p>
                <button className="btn-primary px-6 py-3 rounded-xl">
                  <span>Create Challenge</span>
                </button>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-heading">
                  Season Standings
                </h2>
                <select className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary">
                  <option value="season">Current Season</option>
                  <option value="alltime">All Time</option>
                  <option value="monthly">This Month</option>
                </select>
              </div>

              {/* Top 3 Podium */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Second Place */}
                <div className="glass-card rounded-2xl p-6 text-center order-2 md:order-1 md:mt-8">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xl font-bold text-slate-950 mx-auto">
                      {leaderboard[1]?.avatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-sm font-bold text-slate-950">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold font-heading">
                    {leaderboard[1]?.name}
                  </h3>
                  <div className="text-2xl font-bold gradient-text mt-1">
                    {leaderboard[1]?.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {leaderboard[1]?.wins}W - {leaderboard[1]?.losses}L
                  </div>
                </div>

                {/* First Place */}
                <div className="glass-card rounded-2xl p-8 text-center order-1 md:order-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
                  <div className="relative z-10">
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-slate-950 mx-auto ring-4 ring-amber-400/30">
                        {leaderboard[0]?.avatar}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950">
                        👑
                      </div>
                    </div>
                    <h3 className="font-bold font-heading text-lg">
                      {leaderboard[0]?.name}
                    </h3>
                    <div className="text-3xl font-bold gradient-text mt-1">
                      {leaderboard[0]?.points.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {leaderboard[0]?.wins}W - {leaderboard[0]?.losses}L
                    </div>
                  </div>
                </div>

                {/* Third Place */}
                <div className="glass-card rounded-2xl p-6 text-center order-3 md:mt-12">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl font-bold text-white mx-auto">
                      {leaderboard[2]?.avatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-sm font-bold text-white">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold font-heading">
                    {leaderboard[2]?.name}
                  </h3>
                  <div className="text-2xl font-bold gradient-text mt-1">
                    {leaderboard[2]?.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {leaderboard[2]?.wins}W - {leaderboard[2]?.losses}L
                  </div>
                </div>
              </div>

              {/* Full Leaderboard Table */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">
                          Rank
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">
                          Player
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">
                          Points
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-400 hidden sm:table-cell">
                          Wins
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-400 hidden sm:table-cell">
                          Losses
                        </th>
                        <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadge(
                                entry.rank
                              )}`}
                            >
                              {entry.rank}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold">
                                {entry.avatar}
                              </div>
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-primary">
                            {entry.points.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right text-emerald-400 hidden sm:table-cell">
                            {entry.wins}
                          </td>
                          <td className="py-4 px-6 text-right text-red-400 hidden sm:table-cell">
                            {entry.losses}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {getTrendIcon(entry.trend)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <div className="animate-fade-in-up">
              <div className="glass-card rounded-2xl p-6 md:p-8">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-heading">
                    {formatDate(currentMonth)}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-xl glass-card hover:border-primary/30 transition-colors"
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
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-xl glass-card hover:border-primary/30 transition-colors"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center py-2 text-sm font-medium text-slate-400"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Empty cells for days before the first of the month */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map(
                    (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square p-1"
                      />
                    )
                  )}

                  {/* Calendar days */}
                  {Array.from({ length: getDaysInMonth(currentMonth) }).map(
                    (_, index) => {
                      const day = index + 1;
                      const dayEvents = getEventsForDay(day);
                      const isToday =
                        day === 8 &&
                        currentMonth.getMonth() === 0 &&
                        currentMonth.getFullYear() === 2026;

                      return (
                        <div
                          key={day}
                          className={`aspect-square p-1 md:p-2 rounded-xl transition-colors ${
                            dayEvents.length > 0
                              ? "bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer"
                              : "hover:bg-slate-800/30"
                          } ${isToday ? "ring-2 ring-primary" : ""}`}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isToday ? "text-primary" : "text-slate-300"
                            }`}
                          >
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`h-1.5 md:h-2 rounded-full bg-gradient-to-r ${getEventTypeColor(
                                  event.type
                                )}`}
                                title={event.name}
                              />
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-slate-400 text-center">
                                +{dayEvents.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-700/50">
                  {[
                    { type: "tournament", label: "Tournament" },
                    { type: "league", label: "League" },
                    { type: "casual", label: "Casual" },
                    { type: "practice", label: "Practice" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEventTypeColor(
                          item.type as Event["type"]
                        )}`}
                      />
                      <span className="text-sm text-slate-400">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events for this Month */}
              <div className="mt-6">
                <h3 className="text-lg font-bold font-heading mb-4">
                  Events This Month
                </h3>
                <div className="space-y-3">
                  {events
                    .filter((event) => {
                      const eventDate = new Date(event.date);
                      return (
                        eventDate.getMonth() === currentMonth.getMonth() &&
                        eventDate.getFullYear() === currentMonth.getFullYear()
                      );
                    })
                    .map((event) => (
                      <div
                        key={event.id}
                        className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEventTypeColor(
                              event.type
                            )}`}
                          />
                          <div>
                            <h4 className="font-medium">{event.name}</h4>
                            <div className="text-sm text-slate-400">
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}{" "}
                              at {event.time}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-heading">
                    Community Members
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {members.length} members in this community
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <svg
                      className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search members..."
                      className="pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary w-full md:w-64"
                    />
                  </div>
                  <select className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary">
                    <option value="all">All Roles</option>
                    <option value="owner">Owners</option>
                    <option value="admin">Admins</option>
                    <option value="moderator">Moderators</option>
                    <option value="member">Members</option>
                  </select>
                </div>
              </div>

              {/* Member Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Total Members",
                    value: members.length,
                    icon: "👥",
                  },
                  {
                    label: "Online Now",
                    value: members.filter((m) => m.status === "online").length,
                    icon: "🟢",
                  },
                  {
                    label: "Admins & Mods",
                    value: members.filter(
                      (m) =>
                        m.role === "owner" ||
                        m.role === "admin" ||
                        m.role === "moderator"
                    ).length,
                    icon: "🛡️",
                  },
                  {
                    label: "New This Month",
                    value: 3,
                    icon: "✨",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Staff Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold font-heading mb-4">
                  Community Staff
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {members
                    .filter(
                      (m) =>
                        m.role === "owner" ||
                        m.role === "admin" ||
                        m.role === "moderator"
                    )
                    .map((member) => (
                      <div
                        key={member.id}
                        className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div
                              className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${
                                member.role === "owner"
                                  ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950"
                                  : member.role === "admin"
                                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                                  : "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                              }`}
                            >
                              {member.avatar}
                            </div>
                            <span
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                                member.status === "online"
                                  ? "bg-emerald-500"
                                  : member.status === "away"
                                  ? "bg-amber-500"
                                  : "bg-slate-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold font-heading truncate group-hover:text-primary transition-colors">
                                {member.name}
                              </h4>
                              {member.badges.slice(0, 2).map((badge, idx) => (
                                <span key={idx} className="text-sm">
                                  {badge}
                                </span>
                              ))}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                member.role === "owner"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : member.role === "admin"
                                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                  : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              }`}
                            >
                              {member.role}
                            </span>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                              <span>{member.points.toLocaleString()} pts</span>
                              <span>
                                {member.wins}W - {member.losses}L
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* All Members */}
              <div>
                <h3 className="text-lg font-bold font-heading mb-4">
                  All Members
                </h3>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">
                            Member
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-medium text-slate-400 hidden md:table-cell">
                            Role
                          </th>
                          <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">
                            Points
                          </th>
                          <th className="text-right py-4 px-6 text-sm font-medium text-slate-400 hidden sm:table-cell">
                            W/L
                          </th>
                          <th className="text-right py-4 px-6 text-sm font-medium text-slate-400 hidden lg:table-cell">
                            Matches
                          </th>
                          <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member.id}
                            className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    member.role === "owner"
                                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950"
                                      : member.role === "admin"
                                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                                      : member.role === "moderator"
                                      ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                                      : "bg-gradient-to-br from-primary/30 to-accent/30 text-white"
                                  }`}
                                >
                                  {member.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {member.name}
                                    </span>
                                    {member.badges
                                      .slice(0, 3)
                                      .map((badge, idx) => (
                                        <span key={idx} className="text-xs">
                                          {badge}
                                        </span>
                                      ))}
                                  </div>
                                  <div className="text-xs text-slate-500 md:hidden capitalize">
                                    {member.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 hidden md:table-cell">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                  member.role === "owner"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : member.role === "admin"
                                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                    : member.role === "moderator"
                                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                }`}
                              >
                                {member.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-primary">
                              {member.points.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right hidden sm:table-cell">
                              <span className="text-emerald-400">
                                {member.wins}
                              </span>
                              <span className="text-slate-500"> / </span>
                              <span className="text-red-400">
                                {member.losses}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right text-slate-400 hidden lg:table-cell">
                              {member.matchesPlayed}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                    member.status === "online"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : member.status === "away"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-slate-500/20 text-slate-400"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      member.status === "online"
                                        ? "bg-emerald-400"
                                        : member.status === "away"
                                        ? "bg-amber-400"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  {member.status}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Invite Members CTA */}
              <div className="mt-8 glass-card rounded-2xl p-6 md:p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary mx-auto mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-heading mb-2">
                  Invite New Members
                </h3>
                <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
                  Grow your community by inviting friends or sharing your
                  community link.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button className="btn-primary px-6 py-3 rounded-xl w-full sm:w-auto">
                    <span>Copy Invite Link</span>
                  </button>
                  <button className="btn-secondary px-6 py-3 rounded-xl w-full sm:w-auto">
                    <span>Invite by Email</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Active Session */}
      {activeSession && (
        <LiveSessionPanel
          session={activeSession}
          members={members}
          onEnd={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}

// Live Session Panel - for ongoing matches
function LiveSessionPanel({
  session,
  members,
  onEnd,
}: {
  session: { activityType: string; players: string[]; startTime: Date };
  members: Member[];
  onEnd: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Score state based on activity
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [golfHoles, setGolfHoles] = useState<number[]>(Array(18).fill(0));
  const [currentHole, setCurrentHole] = useState(1);
  const [padelGames, setPadelGames] = useState({ my: 0, opp: 0 });
  const [padelSets, setPadelSets] = useState<{ my: number; opp: number }[]>([]);

  type ActivityType =
    | "racing"
    | "golf"
    | "padel"
    | "esports"
    | "darts"
    | "pool";

  const activityConfig: Record<
    ActivityType,
    { icon: string; gradient: string; label: string }
  > = {
    racing: {
      icon: "🏎️",
      gradient: "from-red-500 to-rose-600",
      label: "Racing",
    },
    golf: {
      icon: "⛳",
      gradient: "from-emerald-500 to-green-600",
      label: "Golf",
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
    darts: { icon: "🎯", gradient: "from-sky-500 to-blue-600", label: "Darts" },
    pool: { icon: "🎱", gradient: "from-slate-500 to-gray-600", label: "Pool" },
  };

  const config = activityConfig[session.activityType as ActivityType];
  const playerNames = session.players
    .map((id) => members.find((m) => m.id === id)?.name.split(" ")[0])
    .filter(Boolean);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(
        Math.floor((Date.now() - session.startTime.getTime()) / 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndSession = () => {
    // Would save the session data
    onEnd();
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 animate-fade-in-up">
      {/* Minimized state */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center sm:justify-start`}
        >
          <span className="text-xl">{config.icon}</span>
          <div className="text-left">
            <div className="text-sm font-bold">Live Session</div>
            <div className="text-xs opacity-80">{formatTime(elapsedTime)}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse ml-2" />
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div className="w-full sm:w-80 glass-card rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.gradient} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <div className="font-bold text-white">Live Session</div>
                  <div className="text-sm text-white/80">
                    {playerNames.length > 0
                      ? `vs ${playerNames.join(", ")}`
                      : "Solo"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-mono text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          {/* Scoring Area */}
          <div className="p-4">
            {/* Golf - Hole by Hole */}
            {session.activityType === "golf" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Hole {currentHole}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(9)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentHole(i + 1)}
                        className={`w-6 h-6 rounded text-xs font-medium ${
                          currentHole === i + 1
                            ? "bg-primary text-slate-900"
                            : golfHoles[i] > 0
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      const newHoles = [...golfHoles];
                      newHoles[currentHole - 1] = Math.max(
                        0,
                        newHoles[currentHole - 1] - 1
                      );
                      setGolfHoles(newHoles);
                    }}
                    className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl font-bold text-white"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">
                      {golfHoles[currentHole - 1] || "−"}
                    </div>
                    <div className="text-xs text-slate-500">strokes</div>
                  </div>
                  <button
                    onClick={() => {
                      const newHoles = [...golfHoles];
                      newHoles[currentHole - 1] =
                        (newHoles[currentHole - 1] || 0) + 1;
                      setGolfHoles(newHoles);
                      if (currentHole < 18 && newHoles[currentHole - 1] >= 1) {
                        // Auto-advance after first stroke entry
                      }
                    }}
                    className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl font-bold text-white"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
                    disabled={currentHole === 1}
                    className="text-slate-400 hover:text-white disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-slate-500">
                    Total: {golfHoles.reduce((a, b) => a + b, 0)} strokes
                  </span>
                  <button
                    onClick={() =>
                      setCurrentHole(Math.min(18, currentHole + 1))
                    }
                    disabled={currentHole === 18}
                    className="text-slate-400 hover:text-white disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Padel - Game by Game */}
            {session.activityType === "padel" && (
              <div className="space-y-4">
                <div className="text-center text-sm text-slate-400 mb-2">
                  Current Game
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">You</div>
                    <button
                      onClick={() => {
                        const newGames = padelGames.my + 1;
                        if (newGames >= 6 && newGames - padelGames.opp >= 2) {
                          setPadelSets([
                            ...padelSets,
                            { my: newGames, opp: padelGames.opp },
                          ]);
                          setPadelGames({ my: 0, opp: 0 });
                        } else {
                          setPadelGames({ ...padelGames, my: newGames });
                        }
                      }}
                      className="w-16 h-16 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-500/50 text-3xl font-bold text-emerald-400"
                    >
                      {padelGames.my}
                    </button>
                  </div>
                  <div className="text-2xl font-bold text-slate-600">-</div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">Opp</div>
                    <button
                      onClick={() => {
                        const newGames = padelGames.opp + 1;
                        if (newGames >= 6 && newGames - padelGames.my >= 2) {
                          setPadelSets([
                            ...padelSets,
                            { my: padelGames.my, opp: newGames },
                          ]);
                          setPadelGames({ my: 0, opp: 0 });
                        } else {
                          setPadelGames({ ...padelGames, opp: newGames });
                        }
                      }}
                      className="w-16 h-16 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 text-3xl font-bold text-red-400"
                    >
                      {padelGames.opp}
                    </button>
                  </div>
                </div>
                {padelSets.length > 0 && (
                  <div className="flex justify-center gap-2 mt-2">
                    {padelSets.map((set, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 rounded-lg bg-slate-700 text-sm"
                      >
                        <span className="text-emerald-400">{set.my}</span>
                        <span className="text-slate-500">-</span>
                        <span className="text-red-400">{set.opp}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center">
                  Tap score to add a game
                </p>
              </div>
            )}

            {/* Racing - Lap Timer placeholder */}
            {session.activityType === "racing" && (
              <div className="space-y-4 text-center">
                <div className="text-4xl font-mono font-bold text-white">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-slate-400">Race in progress</div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((pos) => (
                    <button
                      key={pos}
                      className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold text-slate-400 hover:text-white"
                    >
                      P{pos}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Select finish position</p>
              </div>
            )}

            {/* Generic Score - Darts, Pool, Esports */}
            {["darts", "pool", "esports"].includes(session.activityType) && (
              <div className="space-y-4">
                <div className="flex items-stretch justify-center gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-500 mb-2">You</div>
                    <div className="bg-slate-700/50 rounded-2xl p-4">
                      <div className="text-4xl font-bold text-white mb-3">
                        {myScore}
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setMyScore(myScore + 1)}
                          className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white text-lg"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => setMyScore(myScore + 5)}
                          className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white text-lg"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => setMyScore(myScore + 10)}
                          className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white text-lg"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                  {session.players.length > 0 && (
                    <div className="flex-1 text-center">
                      <div className="text-xs text-slate-500 mb-2">
                        Opponent
                      </div>
                      <div className="bg-slate-700/50 rounded-2xl p-4">
                        <div className="text-4xl font-bold text-white mb-3">
                          {opponentScore}
                        </div>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setOpponentScore(opponentScore + 1)}
                            className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white text-lg"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => setOpponentScore(opponentScore + 5)}
                            className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white text-lg"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => setOpponentScore(opponentScore + 10)}
                            className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-white text-lg"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setMyScore(Math.max(0, myScore - 1))}
                    className="px-3 py-1 rounded-lg bg-slate-700 text-slate-400 text-sm hover:bg-slate-600"
                  >
                    Undo −1
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={handleEndSession}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium flex items-center justify-center gap-2"
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
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
