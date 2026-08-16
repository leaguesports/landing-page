import { Volleyball } from "lucide-react";

export const LeagueSportsLogo = ({ className = "h-8" }: { className?: string }) => {
    return (
        <div className={`font-display flex items-center text-2xl tracking-wide text-white ${className}`}>
            LEAGUE
            <span className="text-[var(--color-brand)]">SPORTS</span>
        </div>
    );
};

export const WifeApprovedBadge = ({ className = "w-32" }: { className?: string }) => {
    return (
        <div className={`relative group ${className}`}>
            {/* The Outer Gold/Bronze Slant - Anti-aliased with a subtle border */}
            <div className="bg-amber-500 p-[2px] border border-transparent backface-hidden shadow-lg shadow-amber-900/20">

                {/* Inner Container */}
                <div className="bg-zinc-950 px-4 py-2 transform flex flex-col items-center justify-center border border-amber-500/30">

                    {/* Top Label */}
                    <span className="transform skew-x-12 text-[10px] font-black italic text-amber-500 uppercase tracking-widest leading-none mb-1">
                        Certified
                    </span>

                    {/* Main Text */}
                    <div className="transform skew-x-12 flex flex-col items-center">
                        <h4 className="text-white font-black italic uppercase leading-none text-xl tracking-tighter">
                            WIFE<span className="text-amber-500 uppercase">.</span>
                        </h4>
                        <h4 className="text-white font-black italic uppercase leading-none text-xl tracking-tighter -mt-1">
                            APPROVED
                        </h4>
                    </div>

                    {/* Bottom Stars/Status */}
                    <div className="transform skew-x-12 flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-amber-500 rotate-45" />
                        ))}
                    </div>

                    <div className="transform skew-x-12 mt-2 border-t border-zinc-800 pt-1 w-full text-center">
                        <span className="text-zinc-500 font-bold text-[8px] uppercase tracking-tighter italic">
                            Verified Hub Venue
                        </span>
                    </div>
                </div>
            </div>

            {/* Decorative Corner Glint */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-transparent -skew-x-12 pointer-events-none" />
        </div>
    );
};

export const KidFriendlyBadge = ({ className = "w-32" }: { className?: string }) => {
    return (
        <div className={`relative group ${className}`}>
            {/* Outer Slant with anti-aliasing fix */}
            <div className="bg-cyan-500 p-[2px] border border-transparent backface-hidden shadow-lg shadow-cyan-900/20">

                {/* Inner Container */}
                <div className="bg-zinc-950 px-4 py-2 transform flex flex-col items-center justify-center border border-cyan-500/30">

                    {/* Tagline */}
                    <span className="transform skew-x-12 text-[9px] font-black italic text-cyan-400 uppercase tracking-widest leading-none mb-1">
                        Next Gen
                    </span>

                    {/* Main Title */}
                    <div className="transform skew-x-12 flex flex-col items-center">
                        <h4 className="text-white font-black italic uppercase leading-none text-xl tracking-tighter">
                            KID<span className="text-cyan-500">.</span>
                        </h4>
                        <h4 className="text-white font-black italic uppercase leading-none text-xl tracking-tighter -mt-1">
                            FRIENDLY
                        </h4>
                    </div>

                    {/* Junior Iconography (Simplified geometric shapes) */}
                    <div className="transform skew-x-12 flex items-center gap-1.5 mt-2">
                        {/* A minimalist 'Junior' Player icon made of squares/angles */}
                        <div className="w-2 h-2 bg-cyan-500 -skew-x-12" />
                        <div className="w-3 h-3 bg-white -skew-x-12" />
                        <div className="w-2 h-2 bg-cyan-500 -skew-x-12" />
                    </div>

                    <div className="transform skew-x-12 mt-2 border-t border-zinc-800 pt-1 w-full text-center">
                        <span className="text-zinc-500 font-bold text-[8px] uppercase tracking-tighter italic">
                            All Ages Welcome
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SportHeadingProps {
    title: string;
    subtitle?: string;
}

export const SportHeading = ({ title, subtitle }: SportHeadingProps) => {
    return (
        <div className="relative mb-8">
            <div className="bg-lime-400 inline-block px-6 py-1 transform -skew-x-6">
                <h2 className="text-black font-black italic uppercase text-2xl transform skew-x-6">
                    {title}
                </h2>
            </div>
            {subtitle && (
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2 ml-4">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

interface EventCardProps {
    type: 'fan' | 'player';
    title: string;
    location: string;
    time: string;
    status?: string; // e.g., "Live", "3 Courts Left", "Happy Hour"
}


export const EventCard: React.FC<EventCardProps> = ({ type, title, location, time, status }) => {
    const isLive = status?.toLowerCase() === 'live';

    return (
        <div className="group relative max-w-xl w-full cursor-pointer">
            {/* Dynamic Glow Shadow */}
            <div className={`absolute inset-0 transform transform-gpu -skew-x-6 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 ${type === 'fan' ? 'bg-orange-600' : 'bg-lime-500'}`} />

            <div className="relative bg-zinc-950 border border-zinc-800 p-5 transform transform-gpu -skew-x-6 overflow-hidden">
                <div className="transform skew-x-6 flex items-center justify-between">

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {status && (
                                <span className={`${isLive ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'} text-[10px] font-black px-2 py-0.5 uppercase tracking-tighter text-white`}>
                                    {status}
                                </span>
                            )}
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{location}</span>
                        </div>

                        <h3 className="text-white text-xl md:text-2xl font-black italic uppercase leading-none">
                            {title}
                        </h3>
                        <p className="text-zinc-400 text-sm font-bold italic">{time}</p>
                    </div>

                    <button className={`ml-4 px-4 py-2 font-black uppercase italic text-xs transition-colors ${type === 'fan' ? 'bg-white text-black hover:bg-orange-500' : 'bg-lime-500 text-black hover:bg-white'}`}>
                        {type === 'fan' ? 'Join Zone' : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Leaderboard = () => {
    const players = [
        { rank: 1, name: "J. Steyn", pts: 1250 },
        { rank: 2, name: "M. Ndlovu", pts: 1180 },
        { rank: 3, name: "A. Smith", pts: 1145 },
    ];

    return (
        <div className="bg-zinc-900 p-6 border border-zinc-800">
            <h3 className="text-lime-500 font-black italic uppercase mb-4 tracking-tighter">Padel Rankings // Season 4</h3>
            <div className="space-y-2">
                {players.map((p) => (
                    <div key={p.rank} className="flex items-center justify-between bg-black p-3 transform -skew-x-6 hover:bg-zinc-800 transition-colors group">
                        <div className="flex items-center gap-4 transform skew-x-6">
                            <span className="text-zinc-600 font-black italic">#0{p.rank}</span>
                            <span className="text-white font-bold uppercase italic group-hover:text-lime-400">{p.name}</span>
                        </div>
                        <span className="text-lime-500 font-black skew-x-6">{p.pts} <small className="text-[10px] text-zinc-500">PTS</small></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface VibeMeterProps {
    label: string;
    value: number; // 0 to 100
    accentColor?: string;
}

export const VibeMeter: React.FC<VibeMeterProps> = ({ label, value, accentColor = 'bg-lime-400' }) => {
    return (
        <div className="bg-zinc-900 border-l-4 border-lime-400 p-4 w-full md:w-48 transform -skew-x-6">
            <div className="transform skew-x-6">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-end gap-1">
                    <span className="text-white text-3xl font-black italic leading-none">{value}%</span>
                    <span className="text-zinc-600 text-[10px] font-bold uppercase mb-1">Full</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 mt-2 overflow-hidden">
                    <div
                        className={`${accentColor} h-full transition-all duration-1000`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export const FeatureIcon = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="group flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-800 hover:border-lime-500 transition-all duration-300 transform -skew-y-2">
        <div className="transform skew-y-2 flex flex-col items-center gap-2">
            <div className="text-lime-500 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-zinc-400 font-black italic uppercase text-[10px] tracking-widest group-hover:text-white">
                {text}
            </span>
        </div>
    </div>
);

export const GameCard = () => {
    return <div className="group relative overflow-hidden bg-neutral-800 transition-all duration-300 hover:bg-neutral-700 cursor-pointer border-l-8 border-lime-400 transform -skew-x-12">

        <div className="transform skew-x-12 flex items-center justify-between p-6">

            <div className="flex-1">
                <span className="text-lime-400 font-black italic tracking-tighter uppercase text-sm">
                    Live Screening
                </span>
                <h3 className="text-white text-2xl font-black uppercase italic leading-tight">
                    Rugby: Lions vs Sharks
                </h3>
                <p className="text-gray-400 font-bold mt-1">NOV 16 • Kickoff 15:00</p>
            </div>

            <div className="ml-4">
                <button className="bg-lime-400 text-black font-black px-6 py-2 uppercase italic text-sm transition-transform hover:scale-105 active:scale-95">
                    Book Fan Zone
                </button>
            </div>

        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
}

export const MatchHeader = ({ home, away, time }: { home: string; away: string; time: string }) => (
    <div className="flex items-center justify-center gap-4 py-8 bg-zinc-950 border-b-2 border-zinc-900">
        <div className="text-right">
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter font-marker">{home}</h2>
        </div>

        <div className="bg-lime-500 text-black font-black italic px-4 py-1 transform -skew-x-12 outline outline-1 outline-transparent">
            <span className="block transform skew-x-12 text-xl">VS</span>
        </div>

        <div className="text-left">
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter font-marker">{away}</h2>
        </div>

        <div className="absolute mt-16 text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">
            {time}
        </div>
    </div>
);

export default function ComponentPreviewPage() {
    return (<div className="min-h-screen bg-gray-900">

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <LeagueSportsLogo className="h-10 w-auto" />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <GameCard />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <MatchHeader home="Lions" away="Sharks" time="NOV 16 • Kickoff 15:00" />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

                <SportHeading title="Sport" subtitle="Sport" />
            </div>
        </section>
        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

                <EventCard type="fan" title="Sport" location="Sport" time="Sport" />
            </div>
        </section>
        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <VibeMeter label="Vibe" value={50} />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <Leaderboard />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <WifeApprovedBadge />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <KidFriendlyBadge />
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-zinc-950 p-6 border-2 border-zinc-800 relative">
                    <div className="absolute top-0 right-0 bg-orange-600 px-3 py-1 text-[10px] font-black uppercase italic">
                        Filling Fast
                    </div>
                    <h4 className="text-white font-black italic uppercase text-lg leading-tight mb-2">
                        Rugby Championship: <br /><span className="text-orange-500">Boks vs All Blacks</span>
                    </h4>
                    <div className="flex gap-2 mb-4">
                        <div className="bg-zinc-800 px-2 py-1 text-[10px] font-bold">BIG SCREEN</div>
                        <div className="bg-zinc-800 px-2 py-1 text-[10px] font-bold">DRINK SPECIALS</div>
                    </div>
                    <button className="w-full bg-white text-black font-black py-3 uppercase italic tracking-tighter hover:bg-lime-400 transition-all transform -skew-x-12">
                        <span className="transform skew-x-12 block transform-gpu">Reserve Table</span>
                    </button>
                </div>
            </div>
        </section>

        <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col gap-2">

                    <FeatureIcon icon={<Volleyball />} text="Padel" />
                    <FeatureIcon icon={<Volleyball />} text="Golf" />
                </div>
            </div>
        </section>

        <div className="min-h-screen bg-slate-900 p-8 font-sans text-white">
            {/* Header Section */}
            <SportHeading title="The Weekend Lineup" subtitle="Live Across All Venues" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Events Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <EventCard
                        type="fan"
                        status="Live"
                        location="The Clubhouse Pub"
                        title="Proteas vs Australia: 2nd ODI"
                        time="Drinks specials active"
                    />
                    <EventCard
                        type="player"
                        status="2 Courts Left"
                        location="Kimiad Padel Center"
                        title="Open Padel Tournament"
                        time="Starts Sat @ 08:00"
                    />
                    <EventCard
                        type="fan"
                        status="Starts in 2h"
                        location="Legends Sports Bar"
                        title="Lions vs Sharks: United Rugby"
                        time="Table bookings recommended"
                    />
                </div>

                {/* Right Column: Quick Stats / Vibes */}
                <div className="space-y-4">
                    <h4 className="text-white font-black italic uppercase tracking-tighter text-lg border-b border-zinc-800 pb-2">
                        Venue Vitals
                    </h4>
                    <VibeMeter label="Pub Crowd Level" value={88} accentColor="bg-orange-500" />
                    <VibeMeter label="Court Occupancy" value={42} />
                </div>

            </div>
        </div>
    </div>)
};