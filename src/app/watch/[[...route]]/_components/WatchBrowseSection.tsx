type WatchBrowseSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
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
      className="scroll-mt-28 border-t border-white/5 sm:scroll-mt-32"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
