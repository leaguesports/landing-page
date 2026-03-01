export default function PrivacyPage() {
    const lastUpdated = "October 2023"; // Update as needed

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8 md:p-12">

                {/* Header */}
                <header className="border-b border-gray-100 pb-8 mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-gray-500">
                        Last Updated: <span className="font-semibold text-gray-700">{lastUpdated}</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-400 italic">
                        At League Sports, we value your privacy and are committed to protecting your personal data in accordance with POPIA (Protection of Personal Information Act).
                    </p>
                </header>

                {/* Content Sections */}
                <div className="space-y-10">

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                        <p className="leading-relaxed text-gray-600">
                            To provide a seamless league experience, we collect information that you provide directly to us when you register a team, join as a free agent, or contact us. This includes:
                        </p>
                        <ul className="list-disc ml-6 mt-4 space-y-2 text-gray-600">
                            <li><strong>Contact Data:</strong> Name, email address, and phone number.</li>
                            <li><strong>League Data:</strong> Team names, player statistics, and match history.</li>
                            <li><strong>Transaction Data:</strong> Details about payments for league fees (processed via secure third-party gateways).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Data</h2>
                        <p className="leading-relaxed text-gray-600">
                            We use your information to facilitate the core functions of our sports leagues:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                                <strong>League Administration:</strong> Creating fixtures, tracking logs, and managing venue bookings.
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg text-sm text-green-800">
                                <strong>Communication:</strong> Sending game reminders, weather cancellations, and league updates.
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Sharing & Disclosure</h2>
                        <p className="leading-relaxed text-gray-600 italic border-l-4 border-gray-200 pl-4">
                            We do not sell your personal information to third parties.
                        </p>
                        <p className="mt-4 text-gray-600">
                            We may share limited data with <strong>Venue Partners</strong> (like Molly Malone’s) specifically for facility access or safety protocols, and with <strong>Payment Processors</strong> to handle your registrations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Your Rights (POPIA)</h2>
                        <p className="leading-relaxed text-gray-600">
                            As a user in South Africa, you have the right to:
                        </p>
                        <ul className="list-decimal ml-6 mt-4 space-y-2 text-gray-600">
                            <li>Request access to the personal information we hold about you.</li>
                            <li>Request the correction or deletion of your data.</li>
                            <li>Object to the processing of your data for marketing purposes.</li>
                        </ul>
                    </section>

                    <section className="bg-gray-900 text-white p-8 rounded-2xl">
                        <h2 className="text-xl font-bold mb-4">5. Contact Us</h2>
                        <p className="text-gray-300 mb-6">
                            If you have any questions about this Privacy Policy or our data practices, please reach out to our Information Officer:
                        </p>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-gray-500 uppercase font-semibold">Email:</span> privacy@leaguesports.co.za</p>
                            <p><span className="text-gray-500 uppercase font-semibold">Address:</span> [Your Physical Address], Johannesburg</p>
                        </div>
                    </section>

                </div>

                <footer className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} League Sports South Africa. All rights reserved.
                </footer>
            </div>
        </div>
    );
}