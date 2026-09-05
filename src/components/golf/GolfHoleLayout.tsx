"use client";

import { useId } from "react";
import { buildHoleLayout } from "@/lib/golf/hole-layout";

type GolfHoleLayoutProps = {
  holeNumber: number;
  par: number;
  strokeIndex: number;
  meters?: number | null;
  className?: string;
};

export function GolfHoleLayout({
  holeNumber,
  par,
  strokeIndex,
  meters,
  className,
}: GolfHoleLayoutProps) {
  const reactId = useId().replace(/:/g, "");
  const uid = `hole-${holeNumber}-${reactId}`;
  const layout = buildHoleLayout(holeNumber, par, strokeIndex);
  const metersLabel =
    typeof meters === "number" && Number.isFinite(meters) && meters > 0
      ? `${Math.round(meters)} m`
      : null;

  return (
    <figure
      key={`${holeNumber}-${par}-${strokeIndex}`}
      className={[
        "golf-hole-layout relative overflow-hidden rounded-3xl border border-emerald-400/15",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      aria-label={`Hole ${holeNumber} layout: ${layout.shapeLabel}`}
    >
      <svg
        viewBox={`0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}`}
        className="h-auto w-full"
        role="img"
        aria-hidden={false}
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1a12" />
            <stop offset="45%" stopColor="#0d2418" />
            <stop offset="100%" stopColor="#08140e" />
          </linearGradient>
          <linearGradient id={`${uid}-fairway`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f9e57" />
            <stop offset="55%" stopColor="#248a48" />
            <stop offset="100%" stopColor="#1c6f3a" />
          </linearGradient>
          <radialGradient id={`${uid}-green`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#5ee08a" />
            <stop offset="55%" stopColor="#2fbf5f" />
            <stop offset="100%" stopColor="#1a8f42" />
          </radialGradient>
          <linearGradient id={`${uid}-sand`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8d2a0" />
            <stop offset="100%" stopColor="#c4a574" />
          </linearGradient>
          <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d9eb0" />
            <stop offset="100%" stopColor="#1a5f6e" />
          </linearGradient>
          <filter
            id={`${uid}-soft`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <rect
          width={layout.viewBoxWidth}
          height={layout.viewBoxHeight}
          fill={`url(#${uid}-sky)`}
        />

        {layout.roughBlobs.map((blob, index) => (
          <ellipse
            key={`rough-${index}`}
            cx={blob.cx}
            cy={blob.cy}
            rx={blob.rx}
            ry={blob.ry}
            fill="#143d24"
            opacity={0.55}
            filter={`url(#${uid}-soft)`}
          />
        ))}

        {layout.trees.map((tree, index) => (
          <g key={`tree-${index}`} opacity={0.85}>
            <circle cx={tree.x} cy={tree.y} r={tree.r} fill="#0f3d22" />
            <circle
              cx={tree.x - tree.r * 0.25}
              cy={tree.y - tree.r * 0.2}
              r={tree.r * 0.55}
              fill="#1a5c34"
            />
          </g>
        ))}

        {layout.waterPath ? (
          <path
            d={layout.waterPath}
            fill={`url(#${uid}-water)`}
            opacity={0.92}
            className="golf-hole-layout__water"
          />
        ) : null}

        <path
          d={layout.centerline}
          fill="none"
          stroke={`url(#${uid}-fairway)`}
          strokeWidth={layout.fairwayWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="golf-hole-layout__fairway"
        />

        <path
          d={layout.centerline}
          fill="none"
          stroke="#9dffb8"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeDasharray="3 7"
          opacity={0.35}
          className="golf-hole-layout__aim"
        />

        {layout.bunkers.map((bunker, index) => (
          <ellipse
            key={`bunker-${index}`}
            cx={bunker.cx}
            cy={bunker.cy}
            rx={bunker.rx}
            ry={bunker.ry}
            fill={`url(#${uid}-sand)`}
            transform={`rotate(${bunker.rotation} ${bunker.cx} ${bunker.cy})`}
            className="golf-hole-layout__bunker"
          />
        ))}

        <ellipse
          cx={layout.green.cx}
          cy={layout.green.cy}
          rx={layout.green.rx}
          ry={layout.green.ry}
          fill={`url(#${uid}-green)`}
          className="golf-hole-layout__green"
        />

        <g className="golf-hole-layout__flag">
          <line
            x1={layout.flag.x}
            y1={layout.flag.y}
            x2={layout.flag.x}
            y2={layout.flag.y - 28}
            stroke="#f4f7f4"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <path
            d={`M ${layout.flag.x} ${layout.flag.y - 28} L ${layout.flag.x + 14} ${layout.flag.y - 22} L ${layout.flag.x} ${layout.flag.y - 16} Z`}
            fill="#3dff8a"
          />
          <circle
            cx={layout.flag.x}
            cy={layout.flag.y}
            r={2.2}
            fill="#f4f7f4"
          />
        </g>

        <rect
          x={layout.tee.x}
          y={layout.tee.y}
          width={layout.tee.width}
          height={layout.tee.height}
          rx={2}
          fill="#d8e6d8"
          opacity={0.9}
        />
        <text
          x={layout.tee.x + layout.tee.width / 2}
          y={layout.tee.y + layout.tee.height + 11}
          textAnchor="middle"
          fill="#9ca89c"
          fontSize="8"
          fontFamily="var(--font-outfit), system-ui, sans-serif"
        >
          TEE
        </text>
      </svg>

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-[#050705]/95 via-[#050705]/55 to-transparent px-4 pb-3 pt-10">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
            Hole map
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {layout.shapeLabel}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl tabular-nums leading-none text-white">
            {holeNumber}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            Par {par}
            {metersLabel ? ` · ${metersLabel}` : ` · SI ${strokeIndex}`}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
