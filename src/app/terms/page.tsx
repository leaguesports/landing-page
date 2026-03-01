import Link from "next/link";

export default function TermsPage() {
    const lastUpdated = "February 2026";

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8 md:p-12 border border-gray-100">

                {/* Header */}
                <header className="border-b-2 border-orange-500 pb-8 mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
                        League Terms & Conditions
                    </h1>
                    <p className="mt-4 text-gray-500">
                        Last Updated: <span className="font-semibold text-gray-700">{lastUpdated}</span>
                    </p>
                </header>

                {/* Content Sections */}
                <div className="space-y-12">

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">01</span>
                            League Registration & Payments
                        </h2>
                        <div className="prose prose-slate text-gray-600 space-y-4">
                            <p>By registering a team or as an individual, you agree to pay the full league fee as specified on the registration page.</p>
                            <ul className="list-disc ml-6 space-y-2">
                                <li><strong>Deposit:</strong> A non-refundable deposit may be required to secure your spot.</li>
                                <li><strong>Full Payment:</strong> Must be settled before the second week of the league fixtures unless a payment plan is agreed upon in writing.</li>
                                <li><strong>Late Payments:</strong> May result in point deductions or temporary suspension from the league.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
                        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                            <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm text-white">02</span>
                            Indemnity & Waiver of Liability
                        </h2>
                        <p className="text-red-800 font-medium mb-4"> Participation in sports involves inherent risks of injury.</p>
                        <p className="text-sm text-red-700 leading-relaxed">
                            By participating in League Sports events at venues like Molly Malone’s or any other partner facility, you, your team members, and your guests hereby indemnify and hold harmless League Sports, its staff, and the venue owners against any claims arising from injury, loss of life, or damage to personal property, regardless of how it occurred.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">03</span>
                            Game Cancellations & Forfeits
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 p-4 rounded-lg">
                                <h3 className="font-bold text-gray-900 mb-2">Weather Policy</h3>
                                <p className="text-sm text-gray-600 italic">Safety first. We play through light rain, but lighting or extreme weather results in immediate postponement. Decisions are made 60 minutes before kick-off.</p>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-lg">
                                <h3 className="font-bold text-gray-900 mb-2">Forfeits</h3>
                                <p className="text-sm text-gray-600">Teams failing to show without 24-hour notice will be charged a forfeit fee and the opposing team will be awarded a walk-over win.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">04</span>
                            Code of Conduct
                        </h2>
                        <p className="text-gray-600 mb-4">We promote a competitive but social atmosphere. The following will result in immediate bans:</p>
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <span className="px-3 py-1 bg-white border rounded">Physical Violence</span>
                            <span className="px-3 py-1 bg-white border rounded">Umpire Abuse</span>
                            <span className="px-3 py-1 bg-white border rounded">Discriminatory Language</span>
                            <span className="px-3 py-1 bg-white border rounded">Alcohol on Court</span>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">05</span>
                            Photography & Media
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            League Sports reserves the right to take photos and videos during match nights for social media and marketing purposes. If you or a teammate wish to opt-out, please notify the league manager in writing.
                        </p>
                    </section>

                </div>

                <footer className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} League Sports SA</p>
                    <div className="mt-4 md:mt-0 space-x-4">
                        <Link href="/privacy" className="hover:text-orange-500 underline">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-orange-500 underline">Support</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}