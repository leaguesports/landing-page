/* eslint-disable @next/next/no-img-element */
import { listVenues, Venue } from "@/services/venues";

function VenueCard({ venue }: { venue: Venue }) {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* <Image src={urlFor(venue.image)?.url() ?? ""} alt={venue.name} className="w-full h-48 object-cover" width={500} height={500} /> */}
            <div className="p-4">
                <h3 className="text-md text-slate-700">{venue.name}</h3>
            </div>
        </div>
    );
}

export default async function WatchPage() {
    const venues = await listVenues();

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <section className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {venues.map((venue) => (
                            <VenueCard key={venue._id} venue={venue} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
