import { KidFriendlyBadge, MatchHeader, WifeApprovedBadge } from "@/app/components/page";
import {
    getVenueType,
    type Venue,
    VENUE_LIST,
} from "@/data/venues";
import { Car, ChevronRight, Dog, MapIcon, MapPin, Wifi } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ venue: string }> };

function getVenueBySlug(slug: string): Venue | undefined {
    return VENUE_LIST.find((v) => v.slug === slug);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ area: string; venue: string }>;
}): Promise<Metadata> {
    const { venue: slug } = await params;
    const venue = getVenueBySlug(slug);
    if (!venue) return { title: "Venue Not Found" };
    const type = getVenueType(venue);
    return {
        title: `${venue.name} | ${venue.area} | League Sports`,
        description: `${venue.name} is a ${type.toLowerCase()} in ${venue.area}. ${venue.description}`,
    };
}

function BreadCrumbs({ area, venue }: { area: string; venue: string }) {
    const formatSlug = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());

    return <div className="flex items-center gap-2 text-sm">
        <Link className="text-zinc-500 hover:text-zinc-700" href={`/${area}`}>{formatSlug(area)}</Link>
        <ChevronRight className="w-4 h-4 text-zinc-500" />
        <Link className="text-zinc-500 hover:text-zinc-700" href={`/${area}/venues`}>Venues</Link>
        <ChevronRight className="w-4 h-4 text-zinc-500" />
        <Link className="text-zinc-500 hover:text-zinc-700" href={`/${area}/venues/${venue}`}>{formatSlug(venue)}</Link>
    </div>
}

function ImageGallery({ venue }: { venue: Venue }) {
    return <div className="grid grid-cols-5 gap-2">
        <div className="col-span-4">
            <img src={venue.image} alt={venue.name} className="w-full h-full object-cover rounded-l-md" />
        </div>
        <div className="col-span-1">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover rounded-tr-md" />
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    <img src={venue.image} alt={venue.name} className="w-full h-full object-cover rounded-br-md" />
                </div>
            </div>
        </div>
    </div>
}

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">{icon}</div>
        <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-snug">{desc}</p>
    </div>
);

function Map() {
    return <div className="relative group overflow-hidden border border-slate-200">
        {/* The Map Image */}
        <img
            src="https://maps.googleapis.com/maps/api/staticmap?center=Kimiad+Golf+Course,Moreleta+Park&zoom=15&size=600x400&key=AIzaSyCWuKzVDFUbPFy53OlCGkmXiw1B-ghYlEo"
            alt="Map of Kimiad Golf Course in Moreleta Park"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Link */}
        <a
            href="https://goo.gl/maps/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-emerald-900/10 group-hover:bg-emerald-900/0 transition-colors flex items-center justify-center"
        >
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md font-bold text-emerald-800 text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <MapIcon className="w-4 h-4" />
                Open in Google Maps
            </div>
        </a>
    </div>
}

export default async function VenuePage({ params }: Props) {
    const { venue: venueSlug } = await params;
    const venue = getVenueBySlug(venueSlug);
    if (!venue) return notFound();

    return (
        <div className="relative min-h-screen bg-white overflow-hidden text-zinc-900 py-12">
            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <div className="mb-4 flex justify-between">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight">{venue.name}</h1>
                                <BreadCrumbs area={'Moreleta Park'} venue={venue.slug} />
                            </div>
                            <div className="flex gap-4">
                                <WifeApprovedBadge />
                                <KidFriendlyBadge />
                            </div>
                        </div>
                        <ImageGallery venue={venue} />
                        {/* <div className="col-span-3">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-bold tracking-tight">About</h2>
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-6 h-6 text-slate-600" strokeWidth={2} />
                                            <a href="https://www.google.com/maps/place/Kimiad+Golf+Course+and+Driving+Range./@-25.8188202,28.2947962,694m/data=!3m2!1e3!4b1!4m6!3m5!1s0x1e95675e4b1258db:0x5b7fb0283ca3c6a8!8m2!3d-25.8188202!4d28.2947962!16s%2Fg%2F1hhkccbf5?entry=ttu&g_ep=EgoyMDI2MDIxNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-800 hover:underline">Wekker Rd, Moreleta Park, Pretoria, 0044</a>
                                        </div>
                                        <Map />
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex gap-4">
                        <Link className="underline" href="#">Overview</Link>
                        <Link href="#">About</Link>
                        <Link href="#">Events</Link>
                        <Link href="#">Activities</Link>
                        <Link href="#">Location</Link>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <div className="flex gap-2 p-2 rounded-md border border-slate-200 items-center">
                            <Wifi className="w-4 h-4 text-slate-600" />
                            <p className="text-sm text-slate-600">Free Wi-Fi</p>
                        </div>
                        <div className="flex gap-2 p-2 rounded-md border border-slate-200 items-center">
                            <Dog className="w-4 h-4 text-slate-600" />
                            <p className="text-sm text-slate-600">Pet Friendly</p>
                        </div>
                        <div className="flex gap-2 p-2 rounded-md border border-slate-200 items-center">
                            <Car className="w-4 h-4 text-slate-600" />
                            <p className="text-sm text-slate-600">Parking</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-slate-600" strokeWidth={2} />
                        <a href="https://www.google.com/maps/place/Kimiad+Golf+Course+and+Driving+Range./@-25.8188202,28.2947962,694m/data=!3m2!1e3!4b1!4m6!3m5!1s0x1e95675e4b1258db:0x5b7fb0283ca3c6a8!8m2!3d-25.8188202!4d28.2947962!16s%2Fg%2F1hhkccbf5?entry=ttu&g_ep=EgoyMDI2MDIxNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-800 hover:underline">Wekker Rd, Moreleta Park, Pretoria, 0044</a>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <div className="col-span-7">
                            <h2 className="text-2xl font-bold tracking-tight">About</h2>
                            {/* <KimiadGolfLanding /> */}
                            <p className="text-lg leading-relaxed text-slate-600 mb-4">
                                Discover the perfect blend of challenging play and natural beauty.
                                <strong> Kimiad Golf Course</strong> offers a unique 12-hole executive layout and a
                                premier 18-hole Par 3 course, making it a favorite for both competitive players
                                and those looking for a quick, social round.
                            </p>
                            <p className="text-lg leading-relaxed text-slate-600">
                                Nestled within lush wetlands, you&apos;ll share the fairways with local wildlife
                                including Blesbok and exotic birdlife, offering a true &quot;bushveld&quot; escape
                                just minutes from the city center.
                            </p>
                        </div>
                        <div className="col-span-3">
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Events</h2>
                        <MatchHeader home="Lions" away="Sharks" time="NOV 16 • Kickoff 15:00" />
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta enim tempore praesentium tempora rem laudantium nam, voluptas sapiente laborum corrupti autem asperiores voluptatem ipsam architecto neque fuga illo quo recusandae!</p>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
                    <p className="text-lg leading-relaxed text-slate-600 mb-4">Kimiad is much more than just a golf course. We offer a variety of activities for all ages and skill levels.</p>
                    <div className="grid grid-cols-4 gap-8">
                        <div className="rounded-lg overflow-hidden border border-slate-200">
                            <img src="https://golf-pass.brightspotcdn.com/dims4/default/4517432/2147483647/strip/true/crop/1280x720+0+120/resize/590x332!/quality/90/?url=https%3A%2F%2Fgolf-pass-brightspot.s3.amazonaws.com%2Fd0%2Fc6%2Fc59b1682b565676dbac3a39c1dbf%2F18936.jpg" alt="Golf" className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-bold tracking-tight">Golf</h3>
                                <p className="text-sm text-slate-600">Golf is a great way to get exercise and enjoy the outdoors.</p>
                            </div>
                        </div>
                        <div>
                            <img src="https://scontent-ber1-1.cdninstagram.com/v/t51.82787-15/622019170_18092823587090027_5186269843810629116_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ig_cache_key=Mjc4NDg4Njk2ODQ4NTAyNjY4Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTA4MC5zZHIuQzMifQ%3D%3D&_nc_ohc=bPXsfHuS7U8Q7kNvwHJKT_w&_nc_oc=AdndMKs_WtI7jWkTR_Q8kYNhxsp3b0tIX6tjqhwBSDpBr23t5lweD7hjwZ1QxKJqP34&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ber1-1.cdninstagram.com&_nc_gid=OE5uyPQRmYZYu38Tqp06Qg&oh=00_AfsRTG6AluIPG0b_5dQgqwqOmLMMN6vboTgr_YLHoTRn2w&oe=699E0992" alt="Golf" className="w-full h-48 object-cover" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold tracking-tight">Driving Range</h3>
                                <p className="text-sm text-slate-600">Get your swing on with our driving range.</p>
                            </div>
                        </div>
                        <div>
                            <img src="https://golf-pass.brightspotcdn.com/dims4/default/d02220f/2147483647/strip/true/crop/960x619+0+50/resize/930x600!/format/webp/quality/90/?url=https%3A%2F%2Fgolf-pass-brightspot.s3.amazonaws.com%2F07%2Ff6%2Fff8a9db20f6b13c2d76a57744458%2F77786.jpg" alt="Golf" className="w-full h-48 object-cover" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold tracking-tight">Pitch And Putt</h3>
                                <p className="text-sm text-slate-600">Focus on your short game with our pitch and putt course.</p>
                            </div>
                        </div>
                        <div>
                            <img src="https://scontent-ber1-1.cdninstagram.com/v/t51.75761-15/466922570_18022918502563622_2327504917365089441_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=MzUwMDI0NzU4ODY5NzIxMTAwNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=Gn3NxzMfCRkQ7kNvwGGJLAA&_nc_oc=AdkitsmujhUVHTFXek8zyjdz1ergHUKxB3cpghClAoqT2kesQ7MyqHa_3hEfkVLSPps&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ber1-1.cdninstagram.com&_nc_gid=N_wH1E79wZoG9q3EQJRXIg&oh=00_AfvWWmmzsET0JHHZBJGNEVaEZ7UCSuTnVA9PV5i8bQIBKQ&oe=699E2B52" alt="Mountain Biking" className="w-full h-48 object-cover" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold tracking-tight">Mountain Biking</h3>
                                <p className="text-sm text-slate-600">Get your adrenaline pumping with our mountain biking trails.</p>
                            </div>
                        </div>
                        <div>
                            <img src="https://scontent-ber1-1.cdninstagram.com/v/t39.30808-6/466763081_18023029307563622_7277727151416950870_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ig_cache_key=MzQwMjQzNDY1MTI4MzEyOTAyMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEzNTB4MTM1MC5zZHIuQzMifQ%3D%3D&_nc_ohc=gvrAj2870MoQ7kNvwGh5odI&_nc_oc=AdkPwK2yBi5zPE50Sf95t75XiNSZ1GoUTNjdncnayxU4V-RjNaUo12xWuXXgfwj6oks&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ber1-1.cdninstagram.com&_nc_gid=yxZg3UnMf6SG6sEeowD0hQ&oh=00_AfsPbLILk4yuw-bljeGRnT2Rwn_Hg8BXC_NLh1zjLDSNow&oe=699E365A" alt="Padel" className="w-full h-48 object-cover" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold tracking-tight">Padel</h3>
                                <p className="text-sm text-slate-600">Get your padel on with our padel court.</p>
                            </div>
                        </div>
                        <div>
                            <img src="https://scontent-ber1-1.cdninstagram.com/v/t51.82787-15/619227541_18033164804574382_1853962973960426253_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&ig_cache_key=MjU0Nzg3MzEzNDM5ODQzMzMzMg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjczNHg3MzQuc2RyLkMzIn0%3D&_nc_ohc=SGvXq985qhwQ7kNvwFo-yho&_nc_oc=AdkVgPV_pRF2rzZSvkP43WmLabJBDs2O8S_OI7VyFmqA-gMCJWa0v8K_rh963VP9eGo&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-ber1-1.cdninstagram.com&_nc_gid=eWML658AqaZ0k4Vxk2iTFA&oh=00_AfutDwRhvJjv6J_JKtaLpm7PY57eEaWO749f0wazVb_bhQ&oe=699E2B85" alt="Outdoor Training" className="w-full h-48 object-cover" />
                            <div className="mt-4">
                                <h3 className="text-lg font-bold tracking-tight">Outdoor Training</h3>
                                <p className="text-sm text-slate-600">Get your training on with our outdoor training facilities.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Ammenities</h2>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Location</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-slate-600" strokeWidth={2} />
                        <a href="https://www.google.com/maps/place/Kimiad+Golf+Course+and+Driving+Range./@-25.8188202,28.2947962,694m/data=!3m2!1e3!4b1!4m6!3m5!1s0x1e95675e4b1258db:0x5b7fb0283ca3c6a8!8m2!3d-25.8188202!4d28.2947962!16s%2Fg%2F1hhkccbf5?entry=ttu&g_ep=EgoyMDI2MDIxNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-800 hover:underline">Wekker Rd, Moreleta Park, Pretoria, 0044</a>
                    </div>
                    <div>
                        <Map />
                    </div>
                </div>
            </section>


            {/* <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex gap-4">
                        <div className="group relative overflow-hidden bg-neutral-800 transition-all duration-300 hover:bg-neutral-700 cursor-pointer border-l-8 border-lime-400 transform -skew-x-12 shadow-xl shadow-gray-600/50">

                            <div className="transform skew-x-12 flex items-center justify-between p-6 hover:shadow-green-500">

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
                                    <button className="bg-lime-400 text-black font-black px-6 py-2 uppercase italic text-sm transition-transform">
                                        Book Fan Zone
                                    </button>
                                </div>

                            </div>

                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        </div>
                        <div>
                            <div className="group relative overflow-hidden bg-neutral-800 transition-all duration-300 hover:bg-neutral-700 cursor-pointer border-l-8 border-lime-400 transform -skew-x-12">

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
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="max-w-xl group relative cursor-pointer">
                        <div className="absolute inset-0 bg-lime-500 transform -skew-x-12 translate-x-2 translate-y-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"></div>

                        <div className="relative bg-zinc-950 text-white p-6 border border-zinc-800 transform -skew-x-12 overflow-hidden">
                            <div className="transform skew-x-12 flex items-center justify-between">

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-red-600 text-[10px] font-black px-2 py-0.5 uppercase tracking-widest animate-pulse">Live</span>
                                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">The Local Pub • 1.2km away</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase leading-none mb-1">Proteas vs Australia</h3>
                                    <p className="text-zinc-400 font-medium">2nd ODI • Fans gathering now</p>
                                </div>

                                <div className="text-right">
                                    <div className="text-lime-500 font-black text-xl italic leading-none">88&apos;</div>
                                    <button className="mt-2 text-[11px] font-black uppercase border-b-2 border-lime-500 pb-0.5 hover:text-lime-400">Join Hub</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
        </div >

    );
}
