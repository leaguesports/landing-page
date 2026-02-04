

function PlusIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}

function GolfIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    );
}

function PadelIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#0f0f0f] py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-white/10">
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Dashboard</h1>
                        <p className="text-sm text-gray-400">Welcome back, John Doe</p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Jump back in</h2>
                    <div className="flex items-center gap-4">
                        <button className="bg-white/5 rounded-lg p-2">
                            <PlusIcon />
                        </button>
                    </div>
                </div>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-lg p-6">
                    </div>
                    <div className="bg-white/5 rounded-lg p-6">
                    </div>
                    <div className="bg-white/5 rounded-lg p-6">
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What sports are you interested in?</h2>
                </div>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    <div className="bg-white/5 rounded-lg p-6">
                        <input type="checkbox" className="rounded-full" />
                        <GolfIcon />
                        <label>Golf</label>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6">
                        <input type="checkbox" />
                        <PadelIcon />
                        <label>Padel</label>
                    </div>
                </div>
            </div>
        </div>
    );
}