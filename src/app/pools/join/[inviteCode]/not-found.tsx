import Link from "next/link";

export default function PoolNotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Pool not found</h1>
        <p className="mt-2 text-zinc-400">
          This invite link is invalid or has expired.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-500"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
