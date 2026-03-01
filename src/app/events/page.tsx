/* eslint-disable @next/next/no-img-element */

import { Event, getEvents } from "@/services/getEvents";
import { urlFor } from "@/sanity/client";

function EventCard({ event }: { event: Event }) {
    const image = event.image ? urlFor(event.image)?.url() : "";

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className=""></div>
            <img
                src={image}
                alt={event.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h2 className="text-slate-700 text-xl tracking-tight">{event.title}</h2>
            </div>
        </div>
    )
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold tracking-tight my-4">Events</h1>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-4 gap-8">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </section >
        </div >
    )
}