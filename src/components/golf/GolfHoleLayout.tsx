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

/** Classic blueprint ink — green lines on black, no solid fills. */
const INK = {
  paper: "#050805",
  grid: "#0d2a14",
  line: "#3dff8a",
  lineDim: "#1a6b3a",
  lineSoft: "#249655",
  hatch: "#2fbf5f",
  label: "#6ee7a0",
} as const;

export function GolfHoleLayout({
  holeNumber,
  par,
  strokeIndex,
  meters,
  className,
}: GolfHoleLayoutProps) {
  const reactId = useId().replace(/:/g, "");
  const uid = `bp-${holeNumber}-${reactId}`;
  const layout = buildHoleLayout(holeNumber, par, strokeIndex);
  const metersValue =
    typeof meters === "number" && Number.isFinite(meters) && meters > 0
      ? Math.round(meters)
      : null;
  const metersLabel = metersValue != null ? `${metersValue} m` : null;

  const w = layout.viewBoxWidth;
  const h = layout.viewBoxHeight;
  const gridStep = 12;

  // Dimension chain: tee → mid → green (schematic lengths from meters or par estimate)
  const teePt = layout.stations[0];
  const midPt = layout.stations[Math.floor(layout.stations.length / 2)];
  const greenPt = layout.stations[layout.stations.length - 1];
  const totalM =
    metersValue ??
    (par === 3 ? 150 : par === 4 ? 360 : 480);
  const midM = Math.round(totalM * 0.55);

  return (
    <figure
      key={`${holeNumber}-${par}-${strokeIndex}`}
      className={[
        "golf-hole-layout relative overflow-hidden rounded-3xl border border-emerald-500/25",
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
              strokeWidth={0.5}
            />
          </pattern>
          {/* Diagonal hatch like classic blueprints */}
          <pattern
            id={`${uid}-hatch`}
            width={5}
            height={5}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={5}
              stroke={INK.hatch}
              strokeWidth={0.7}
              opacity={0.55}
            />
          </pattern>
          <pattern
            id={`${uid}-hatch-dense`}
            width={4}
            height={4}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={4}
              stroke={INK.hatch}
              strokeWidth={0.65}
              opacity={0.45}
            />
          </pattern>
          <clipPath id={`${uid}-fairway-clip`}>
            <path d={layout.fairwayOutline} />
          </clipPath>
        </defs>

        {/* Black blueprint sheet + green grid */}
        <rect width={w} height={h} fill={INK.paper} />
        <rect width={w} height={h} fill={`url(#${uid}-grid)`} />

        {/* Outer plate frame (double line) */}
        <rect
          x={5}
          y={5}
          width={w - 10}
          height={h - 10}
          fill="none"
          stroke={INK.lineDim}
          strokeWidth={1}
        />
        <rect
          x={8}
          y={8}
          width={w - 16}
          height={h - 16}
          fill="none"
          stroke={INK.lineDim}
          strokeWidth={0.6}
          opacity={0.7}
        />

        {/* Title block */}
        <g
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fill={INK.label}
        >
          <text x={14} y={22} fontSize="7" letterSpacing="0.16em">
            HOLE {holeNumber} · PAR {par} · SI {strokeIndex}
          </text>
          <text x={14} y={32} fontSize="6.5" fill={INK.lineSoft}>
            {layout.shapeLabel.toUpperCase()}
            {metersLabel ? ` · ${metersLabel}` : ""}
          </text>
        </g>

        {/* Trees — simple plan symbols (circle + cross) */}
        {layout.trees.map((tree, index) => (
          <g key={`tree-${index}`} opacity={0.55}>
            <circle
              cx={tree.x}
              cy={tree.y}
              r={tree.r}
              fill="none"
              stroke={INK.lineSoft}
              strokeWidth={0.8}
            />
            <line
              x1={tree.x - tree.r * 0.55}
              y1={tree.y}
              x2={tree.x + tree.r * 0.55}
              y2={tree.y}
              stroke={INK.lineSoft}
              strokeWidth={0.7}
            />
            <line
              x1={tree.x}
              y1={tree.y - tree.r * 0.55}
              x2={tree.x}
              y2={tree.y + tree.r * 0.55}
              stroke={INK.lineSoft}
              strokeWidth={0.7}
            />
          </g>
        ))}

        {/* Water — outline + reverse hatch */}
        {layout.waterPath ? (
          <g className="golf-hole-layout__water">
            <path
              d={layout.waterPath}
              fill={`url(#${uid}-hatch-dense)`}
              stroke="none"
            />
            <path
              d={layout.waterPath}
              fill="none"
              stroke={INK.line}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </g>
        ) : null}

        {/* Fairway hatch (clipped to corridor) + double edge walls */}
        <path
          d={layout.fairwayOutline}
          fill={`url(#${uid}-hatch)`}
          stroke="none"
          opacity={0.35}
          clipPath={`url(#${uid}-fairway-clip)`}
        />
        <path
          d={layout.fairwayLeft}
          fill="none"
          stroke={INK.line}
          strokeWidth={1.35}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="golf-hole-layout__fairway"
        />
        <path
          d={layout.fairwayRight}
          fill="none"
          stroke={INK.line}
          strokeWidth={1.35}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="golf-hole-layout__fairway"
        />
        {/* Centerline (dashed survey line) */}
        <path
          d={layout.centerline}
          fill="none"
          stroke={INK.lineSoft}
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeDasharray="3 4"
          opacity={0.75}
        />

        {/* Bunkers — double ellipse + hatch */}
        {layout.bunkers.map((bunker, index) => (
          <g
            key={`bunker-${index}`}
            transform={`rotate(${bunker.rotation} ${bunker.cx} ${bunker.cy})`}
            className="golf-hole-layout__bunker"
          >
            <ellipse
              cx={bunker.cx}
              cy={bunker.cy}
              rx={bunker.rx}
              ry={bunker.ry}
              fill={`url(#${uid}-hatch-dense)`}
              stroke="none"
              opacity={0.5}
            />
            <ellipse
              cx={bunker.cx}
              cy={bunker.cy}
              rx={bunker.rx}
              ry={bunker.ry}
              fill="none"
              stroke={INK.line}
              strokeWidth={1.15}
            />
            <ellipse
              cx={bunker.cx}
              cy={bunker.cy}
              rx={Math.max(2, bunker.rx - 2.2)}
              ry={Math.max(1.5, bunker.ry - 1.8)}
              fill="none"
              stroke={INK.lineSoft}
              strokeWidth={0.7}
            />
          </g>
        ))}

        {/* Green — double ring + light hatch */}
        <ellipse
          cx={layout.green.cx}
          cy={layout.green.cy}
          rx={layout.green.rx}
          ry={layout.green.ry}
          fill={`url(#${uid}-hatch)`}
          stroke="none"
          opacity={0.3}
        />
        <ellipse
          cx={layout.green.cx}
          cy={layout.green.cy}
          rx={layout.green.rx}
          ry={layout.green.ry}
          fill="none"
          stroke={INK.line}
          strokeWidth={1.5}
          className="golf-hole-layout__green"
        />
        <ellipse
          cx={layout.green.cx}
          cy={layout.green.cy}
          rx={layout.green.rx - 2.5}
          ry={layout.green.ry - 2.5}
          fill="none"
          stroke={INK.lineSoft}
          strokeWidth={0.85}
        />

        {/* Flag — plan symbol */}
        <g className="golf-hole-layout__flag">
          <line
            x1={layout.flag.x}
            y1={layout.flag.y}
            x2={layout.flag.x}
            y2={layout.flag.y - 22}
            stroke={INK.line}
            strokeWidth={1.1}
            strokeLinecap="round"
          />
          <path
            d={`M ${layout.flag.x} ${layout.flag.y - 22} L ${layout.flag.x + 10} ${layout.flag.y - 18} L ${layout.flag.x} ${layout.flag.y - 14} Z`}
            fill="none"
            stroke={INK.line}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
          <circle
            cx={layout.flag.x}
            cy={layout.flag.y}
            r={1.8}
            fill="none"
            stroke={INK.line}
            strokeWidth={1}
          />
        </g>

        {/* Tee box — double rectangle */}
        <rect
          x={layout.tee.x}
          y={layout.tee.y}
          width={layout.tee.width}
          height={layout.tee.height}
          fill={`url(#${uid}-hatch)`}
          stroke="none"
          opacity={0.35}
        />
        <rect
          x={layout.tee.x}
          y={layout.tee.y}
          width={layout.tee.width}
          height={layout.tee.height}
          fill="none"
          stroke={INK.line}
          strokeWidth={1.2}
        />
        <rect
          x={layout.tee.x + 1.8}
          y={layout.tee.y + 1.8}
          width={Math.max(2, layout.tee.width - 3.6)}
          height={Math.max(2, layout.tee.height - 3.6)}
          fill="none"
          stroke={INK.lineSoft}
          strokeWidth={0.7}
        />
        <text
          x={layout.tee.x + layout.tee.width / 2}
          y={layout.tee.y + layout.tee.height + 10}
          textAnchor="middle"
          fill={INK.label}
          fontSize="7"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          letterSpacing="0.14em"
        >
          TEE
        </text>

        {/* Dimension line (tee → green) — like floor-plan callouts */}
        {teePt && midPt && greenPt ? (
          <g
            stroke={INK.lineSoft}
            fill={INK.label}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="6.5"
          >
            {/* Offset dimension to the side of the hole */}
            <line
              x1={Math.min(teePt.x, greenPt.x) - 28}
              y1={teePt.y}
              x2={Math.min(teePt.x, greenPt.x) - 28}
              y2={greenPt.y}
              strokeWidth={0.8}
            />
            <line
              x1={Math.min(teePt.x, greenPt.x) - 32}
              y1={teePt.y}
              x2={Math.min(teePt.x, greenPt.x) - 24}
              y2={teePt.y}
              strokeWidth={0.8}
            />
            <line
              x1={Math.min(teePt.x, greenPt.x) - 32}
              y1={greenPt.y}
              x2={Math.min(teePt.x, greenPt.x) - 24}
              y2={greenPt.y}
              strokeWidth={0.8}
            />
            <line
              x1={Math.min(teePt.x, greenPt.x) - 32}
              y1={midPt.y}
              x2={Math.min(teePt.x, greenPt.x) - 24}
              y2={midPt.y}
              strokeWidth={0.8}
            />
            <text
              x={Math.min(teePt.x, greenPt.x) - 36}
              y={(teePt.y + midPt.y) / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${Math.min(teePt.x, greenPt.x) - 36} ${(teePt.y + midPt.y) / 2})`}
            >
              {midM}
            </text>
            <text
              x={Math.min(teePt.x, greenPt.x) - 36}
              y={(midPt.y + greenPt.y) / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${Math.min(teePt.x, greenPt.x) - 36} ${(midPt.y + greenPt.y) / 2})`}
            >
              {totalM - midM}
            </text>
            <text
              x={w - 14}
              y={h - 14}
              textAnchor="end"
              fill={INK.lineSoft}
              fontSize="6"
              letterSpacing="0.12em"
            >
              TOTAL {totalM} M
            </text>
          </g>
        ) : null}

        {/* Corner registration ticks */}
        <g stroke={INK.lineDim} strokeWidth={1} fill="none">
          <path d="M 12 20 L 12 12 L 20 12" />
          <path d={`M ${w - 20} 12 L ${w - 12} 12 L ${w - 12} 20`} />
          <path d={`M 12 ${h - 20} L 12 ${h - 12} L 20 ${h - 12}`} />
          <path
            d={`M ${w - 20} ${h - 12} L ${w - 12} ${h - 12} L ${w - 12} ${h - 20}`}
          />
        </g>
      </svg>
    </figure>
  );
}
