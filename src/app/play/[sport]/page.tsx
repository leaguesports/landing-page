export default function PlaySportPage({ params }: { params: { sport: string } }) {
    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] py-24">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
                    <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                </div>
            </section>
        </div>
    )
}