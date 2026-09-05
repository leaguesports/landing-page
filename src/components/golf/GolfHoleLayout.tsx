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

/** Blueprint line colors — stroke only, no fills. */
const INK = {
  grid: "#1a3a5c",
  fairway: "#5eead4",
  aim: "#94a3b8",
  green: "#4ade80",
  bunker: "#fbbf24",
  water: "#38bdf8",
  tee: "#e2e8f0",
  tree: "#64748b",
  flag: "#f8fafc",
  flagFill: "none",
  label: "#7dd3fc",
  muted: "#64748b",
} as const;

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

  const w = layout.viewBoxWidth;
  const h = layout.viewBoxHeight;
  const gridStep = 20;

  return (
    <figure
      key={`${holeNumber}-${par}-${strokeIndex}`}
      className={[
        "golf-hole-layout relative overflow-hidden rounded-3xl border border-sky-400/20",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      aria-label={`Hole ${holeNumber} blueprint: ${layout.shapeLabel}`}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-hidden={false}
      >
        <defs>
          <pattern
            id={`${uid}-grid`}
            width={gridStep}
            height={gridStep}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
              fill="none"
              stroke={INK.grid}
              strokeWidth={0.6}
            />
          </pattern>
        </defs>

        {/* Blueprint sheet */}
        <rect width={w} height={h} fill="#071525" />
        <rect width={w} height={h} fill={`url(#${uid}-grid)`} opacity={0.9} />

        {/* Border frame */}
        <rect
          x={6}
          y={6}
          width={w - 12}
          height={h - 12}
          fill="none"
          stroke="#1e4a6e"
          strokeWidth={1}
        />

        {/* Trees — outline ticks only */}
        {layout.trees.map((tree, index) => (
          <g key={`tree-${index}`} opacity={0.7}>
            <circle
              cx={tree.x}
              cy={tree.y}
              r={tree.r}
              fill="none"
              stroke={INK.tree}
              strokeWidth={1}
            />
            <line
              x1={tree.x}
              y1={tree.y - tree.r}
              x2={tree.x}
              y2={tree.y + tree.r}
              stroke={INK.tree}
              strokeWidth={0.75}
            />
            <line
              x1={tree.x - tree.r}
              y1={tree.y}
              x2={tree.x + tree.r}
              y2={tree.y}
              stroke={INK.tree}
              strokeWidth={0.75}
            />
          </g>
        ))}

        {/* Water — outline only */}
        {layout.waterPath ? (
          <path
            d={layout.waterPath}
            fill="none"
            stroke={INK.water}
            strokeWidth={1.5}
            strokeLinejoin="round"
            className="golf-hole-layout__water"
          />
        ) : null}

        {/* Fairway — thin colored line only (no fill) */}
        <path
          d={layout.centerline}
          fill="none"
          stroke={INK.fairway}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="golf-hole-layout__fairway"
        />
        <path
          d={layout.centerline}
          fill="none"
          stroke={INK.aim}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity={0.45}
          className="golf-hole-layout__aim"
        />

        {/* Bunkers — outline ellipses */}
        {layout.bunkers.map((bunker, index) => (
          <ellipse
            key={`bunker-${index}`}
            cx={bunker.cx}
            cy={bunker.cy}
            rx={bunker.rx}
            ry={bunker.ry}
            fill="none"
            stroke={INK.bunker}
            strokeWidth={1.35}
            transform={`rotate(${bunker.rotation} ${bunker.cx} ${bunker.cy})`}
            className="golf-hole-layout__bunker"
          />
        ))}

        {/* Green — outline only */}
        <ellipse
          cx={layout.green.cx}
          cy={layout.green.cy}
          rx={layout.green.rx}
          ry={layout.green.ry}
          fill="none"
          stroke={INK.green}
          strokeWidth={1.75}
          className="golf-hole-layout__green"
        />
        {/* Green inner ring */}
        <ellipse
          cx={layout.green.cx}
          cy={layout.green.cy}
          rx={layout.green.rx * 0.55}
          ry={layout.green.ry * 0.55}
          fill="none"
          stroke={INK.green}
          strokeWidth={0.9}
          opacity={0.45}
          strokeDasharray="3 3"
        />

        {/* Flag — line drawing */}
        <g className="golf-hole-layout__flag">
          <line
            x1={layout.flag.x}
            y1={layout.flag.y}
            x2={layout.flag.x}
            y2={layout.flag.y - 26}
            stroke={INK.flag}
            strokeWidth={1.25}
            strokeLinecap="round"
          />
          <path
            d={`M ${layout.flag.x} ${layout.flag.y - 26} L ${layout.flag.x + 12} ${layout.flag.y - 21} L ${layout.flag.x} ${layout.flag.y - 16} Z`}
            fill="none"
            stroke={INK.green}
            strokeWidth={1.25}
            strokeLinejoin="round"
          />
          <circle
            cx={layout.flag.x}
            cy={layout.flag.y}
            r={2}
            fill="none"
            stroke={INK.flag}
            strokeWidth={1.1}
          />
        </g>

        {/* Tee box — outline */}
        <rect
          x={layout.tee.x}
          y={layout.tee.y}
          width={layout.tee.width}
          height={layout.tee.height}
          rx={1.5}
          fill="none"
          stroke={INK.tee}
          strokeWidth={1.35}
        />
        <text
          x={layout.tee.x + layout.tee.width / 2}
          y={layout.tee.y + layout.tee.height + 11}
          textAnchor="middle"
          fill={INK.label}
          fontSize="8"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          letterSpacing="0.12em"
        >
          TEE
        </text>

        {/* Corner registration marks */}
        <g stroke="#2a5a82" strokeWidth={1} fill="none">
          <path d="M 10 18 L 10 10 L 18 10" />
          <path d={`M ${w - 18} 10 L ${w - 10} 10 L ${w - 10} 18`} />
          <path d={`M 10 ${h - 18} L 10 ${h - 10} L 18 ${h - 10}`} />
          <path
            d={`M ${w - 18} ${h - 10} L ${w - 10} ${h - 10} L ${w - 10} ${h - 18}`}
          />
        </g>

        {/* Line key */}
        <g
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="7"
          fill={INK.muted}
        >
          <line x1={14} y1={20} x2={28} y2={20} stroke={INK.fairway} strokeWidth={1.5} />
          <text x={32} y={22} fill={INK.label}>
            fairway
          </text>
          <line x1={78} y1={20} x2={92} y2={20} stroke={INK.green} strokeWidth={1.5} />
          <text x={96} y={22} fill={INK.label}>
            green
          </text>
          <line x1={130} y1={20} x2={144} y2={20} stroke={INK.bunker} strokeWidth={1.5} />
          <text x={148} y={22} fill={INK.label}>
            bunker
          </text>
          <line x1={14} y1={32} x2={28} y2={32} stroke={INK.water} strokeWidth={1.5} />
          <text x={32} y={34} fill={INK.label}>
            water
          </text>
        </g>
      </svg>

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-[#071525]/95 via-[#071525]/50 to-transparent px-4 pb-3 pt-10">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
            Hole blueprint
          </p>
          <p className="mt-0.5 truncate font-mono text-sm text-sky-100">
            {layout.shapeLabel}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl tabular-nums leading-none text-white">
            {holeNumber}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-slate-400">
            Par {par}
            {metersLabel ? ` · ${metersLabel}` : ` · SI ${strokeIndex}`}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
