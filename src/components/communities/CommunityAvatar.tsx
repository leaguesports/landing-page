export function CommunityAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-lg";

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${box} rounded-full border border-white/10 object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`flex ${box} items-center justify-center rounded-full border border-white/10 bg-white/4 font-display text-emerald-300`}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}
