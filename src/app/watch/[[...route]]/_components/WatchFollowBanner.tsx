import { Bell, Flag } from "lucide-react";

export function WatchFollowBanner() {
    return (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950 border-t border-white/5">
            <div className="absolute inset-0 bg-linear-to-r from-blue-950/40 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-blue-600 via-blue-400 to-transparent" />

            <div className="mx-auto max-w-7xl relative w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Flag className="w-6 h-6 text-blue-500" />
                            <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Never Miss a Venue</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                            Follow <span className="text-blue-500">Venues</span>
                        </h2>
                        <p className="text-zinc-500 font-bold text-sm max-w-md">
                            Be notified when new venues are available.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-blue-600 hover:text-blue-400 transition-all transform -skew-x-6"
                        >
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Bell className="w-4 h-4" />
                                Enable Venue Alerts
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
