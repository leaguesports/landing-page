import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  /** Rendered pixel size used by next/image for srcset. */
  size?: number;
  priority?: boolean;
};

/** Transparent LeagueSports shield. Pair with a visible wordmark and empty alt. */
export function BrandMark({
  className = "h-10 w-10",
  size = 80,
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src="/logo-transparent.png"
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      className={className}
      priority={priority}
    />
  );
}
