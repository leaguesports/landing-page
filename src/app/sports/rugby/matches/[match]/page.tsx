import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import { EVENT_LIST } from "@/data/events";
import { notFound } from "next/navigation";

export default async function RugbyMatchPage({ params }: { params: Promise<{ match: string }> }) {
    const { match } = await params;

    const event = EVENT_LIST.find((event) => event.slug === match);

    if (!event) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FeaturedEventCard
                        image={event.imageUrl ?? ""}
                        title={event?.name}
                        sport={event.activity.name}
                        date={event.date}
                        location={event.areas?.[0] ?? ""}
                        description={`Watch the ${event.name} at ${event.areas?.[0] ?? ""}`}
                    />
                </div>
            </section>
        </div>
    );
}
