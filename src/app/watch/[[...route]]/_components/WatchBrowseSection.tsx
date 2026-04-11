type WatchBrowseSectionProps = {
    eyebrow: string;
    title: string;
    description?: string;
    /** For in-page anchors (e.g. hub CTAs). */
    sectionId?: string;
    children: React.ReactNode;
};

export function WatchBrowseSection({
    eyebrow,
    title,
    description,
    sectionId,
    children,
}: WatchBrowseSectionProps) {
    return (
        <section
            id={sectionId}
            className="scroll-mt-20 sm:scroll-mt-24 border-t border-white/5"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <header className="mb-8 sm:mb-10 lg:mb-12 max-w-3xl">
                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.28em] mb-3">
                        {eyebrow}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-3 text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed">
                            {description}
                        </p>
                    ) : null}
                </header>
                {children}
            </div>
        </section>
    );
}
