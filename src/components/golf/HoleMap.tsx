"use client";

import { useId, useRef } from "react";
import type { HoleLayout, Point } from "@/lib/golf/hole-layout";
import { clientToLayoutPoint } from "@/lib/golf/hole-layout";

type HoleMapProps = {
  layout: HoleLayout;
  target: Point;
  onTargetChange: (point: Point) => void;
  shotMeters: number;
  remainingMeters: number;
  holeNumber: number;
  par: number;
  strokeIndex: number;
};

export function HoleMap({
  layout,
  target,
  onTargetChange,
  shotMeters,
  remainingMeters,
  holeNumber,
  par,
  strokeIndex,
}: HoleMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradId = useId().replace(/:/g, "");
  const fairwayId = `${gradId}-fw`;
  const roughId = `${gradId}-rg`;
  const waterId = `${gradId}-wt`;

  function placeFromEvent(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return;
    onTargetChange(clientToLayoutPoint(svg, clientX, clientY, layout));
  }

  const midLabel = {
    x: (layout.tee.x + target.x) / 2 + 10,
    y: (layout.tee.y + target.y) / 2,
  };
  const remainLabel = {
    x: (target.x + layout.green.x) / 2 + 12,
    y: (target.y + layout.green.y) / 2,
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
      className="relative z-[1] h-full w-full touch-none select-none"
      role="img"
      aria-label={`Hole ${holeNumber} map. Tap to place your landing spot.`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        placeFromEvent(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        placeFromEvent(event.clientX, event.clientY);
      }}
    >
      <defs>
        <linearGradient id={roughId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f1a12" />
          <stop offset="55%" stopColor="#132016" />
          <stop offset="100%" stopColor="#0c140e" />
        </linearGradient>
        <linearGradient id={fairwayId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f6b3a" />
          <stop offset="45%" stopColor="#2a8a4a" />
          <stop offset="100%" stopColor="#1a5c32" />
        </linearGradient>
        <radialGradient id={waterId} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#3b82c4" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </radialGradient>
        <filter
          id={`${gradId}-soft`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <rect
        width={layout.viewBox.width}
        height={layout.viewBox.height}
        fill={`url(#${roughId})`}
      />

      <ellipse
        cx={layout.viewBox.width * 0.5}
        cy={layout.viewBox.height * 0.55}
        rx={layout.viewBox.width * 0.55}
        ry={layout.viewBox.height * 0.42}
        fill="#14301c"
        opacity={0.45}
        filter={`url(#${gradId}-soft)`}
      />

      <path d={layout.roughPath} fill="#163820" opacity={0.9} />
      <path d={layout.fairwayPath} fill={`url(#${fairwayId})`} />
      <path
        d={layout.fairwayPath}
        fill="none"
        stroke="#3dff8a"
        strokeOpacity={0.12}
        strokeWidth={1.2}
      />

      {layout.trees.map((tree, index) => (
        <g key={`t-${index}`} opacity={0.75}>
          <circle cx={tree.cx} cy={tree.cy} r={tree.r} fill="#0a1a0e" />
          <circle
            cx={tree.cx - tree.r * 0.2}
            cy={tree.cy - tree.r * 0.15}
            r={tree.r * 0.55}
            fill="#142818"
          />
        </g>
      ))}

      {layout.hazards.map((hazard, index) =>
        hazard.kind === "bunker" ? (
          <ellipse
            key={`h-${index}`}
            cx={hazard.cx}
            cy={hazard.cy}
            rx={hazard.rx}
            ry={hazard.ry}
            fill="#c4a574"
            stroke="#9a7b4f"
            strokeWidth={0.8}
            opacity={0.92}
          />
        ) : (
          <ellipse
            key={`h-${index}`}
            cx={hazard.cx}
            cy={hazard.cy}
            rx={hazard.rx}
            ry={hazard.ry}
            fill={`url(#${waterId})`}
            stroke="#60a5fa"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        ),
      )}

      <ellipse
        cx={layout.green.x}
        cy={layout.green.y}
        rx={layout.greenRx}
        ry={layout.greenRy}
        fill="#3dff8a"
        fillOpacity={0.35}
        stroke="#3dff8a"
        strokeOpacity={0.55}
        strokeWidth={1.2}
      />
      <ellipse
        cx={layout.green.x}
        cy={layout.green.y}
        rx={layout.greenRx * 0.55}
        ry={layout.greenRy * 0.55}
        fill="#4ade80"
        fillOpacity={0.25}
      />
      <line
        x1={layout.green.x}
        y1={layout.green.y}
        x2={layout.green.x}
        y2={layout.green.y - 22}
        stroke="#f4f7f4"
        strokeWidth={1.4}
      />
      <polygon
        points={`${layout.green.x},${layout.green.y - 22} ${layout.green.x + 12},${layout.green.y - 17} ${layout.green.x},${layout.green.y - 12}`}
        fill="#ef4444"
      />

      <path
        d={`M ${layout.tee.x} ${layout.tee.y} L ${target.x} ${target.y}`}
        fill="none"
        stroke="#f4f7f4"
        strokeWidth={1.6}
        strokeDasharray="5 5"
        strokeOpacity={0.85}
        className="shot-path-draw"
      />
      <path
        d={`M ${target.x} ${target.y} L ${layout.green.x} ${layout.green.y}`}
        fill="none"
        stroke="#3dff8a"
        strokeWidth={1.4}
        strokeDasharray="4 6"
        strokeOpacity={0.55}
      />

      <circle
        cx={layout.tee.x}
        cy={layout.tee.y}
        r={7}
        fill="#0c0f0c"
        stroke="#3dff8a"
        strokeWidth={2}
      />
      <circle cx={layout.tee.x} cy={layout.tee.y} r={2.5} fill="#3dff8a" />

      <g className="shot-target-pulse">
        <circle
          cx={target.x}
          cy={target.y}
          r={14}
          fill="none"
          stroke="#ef4444"
          strokeWidth={1.5}
          opacity={0.85}
        />
        <line
          x1={target.x - 18}
          y1={target.y}
          x2={target.x + 18}
          y2={target.y}
          stroke="#ef4444"
          strokeWidth={1.4}
        />
        <line
          x1={target.x}
          y1={target.y - 18}
          x2={target.x}
          y2={target.y + 18}
          stroke="#ef4444"
          strokeWidth={1.4}
        />
        <circle cx={target.x} cy={target.y} r={3} fill="#ef4444" />
      </g>

      <g transform={`translate(${midLabel.x}, ${midLabel.y})`}>
        <rect
          x={-22}
          y={-10}
          width={44}
          height={18}
          rx={9}
          fill="#050705"
          fillOpacity={0.82}
          stroke="rgba(255,255,255,0.12)"
        />
        <text
          textAnchor="middle"
          y={3}
          fill="#f4f7f4"
          fontSize={10}
          fontFamily="var(--font-outfit), system-ui, sans-serif"
        >
          {Math.round(shotMeters)}m
        </text>
      </g>

      <g transform={`translate(${remainLabel.x}, ${remainLabel.y})`}>
        <rect
          x={-20}
          y={-9}
          width={40}
          height={16}
          rx={8}
          fill="#050705"
          fillOpacity={0.7}
        />
        <text
          textAnchor="middle"
          y={2.5}
          fill="#9ca89c"
          fontSize={9}
          fontFamily="var(--font-outfit), system-ui, sans-serif"
        >
          {Math.round(remainingMeters)}m
        </text>
      </g>

      <g transform={`translate(${layout.viewBox.width - 78}, 16)`}>
        <rect
          width={66}
          height={58}
          rx={10}
          fill="#050705"
          fillOpacity={0.78}
          stroke="rgba(255,255,255,0.1)"
        />
        <text
          x={33}
          y={20}
          textAnchor="middle"
          fill="#f4f7f4"
          fontSize={16}
          fontFamily="var(--font-bebas), Impact, sans-serif"
        >
          {holeNumber}
        </text>
        <text
          x={33}
          y={34}
          textAnchor="middle"
          fill="#9ca89c"
          fontSize={8}
          fontFamily="var(--font-outfit), system-ui, sans-serif"
        >
          PAR {par}
        </text>
        <text
          x={33}
          y={46}
          textAnchor="middle"
          fill="#9ca89c"
          fontSize={8}
          fontFamily="var(--font-outfit), system-ui, sans-serif"
        >
          {Math.round(layout.lengthMeters)} m
        </text>
        <text
          x={33}
          y={56}
          textAnchor="middle"
          fill="#6b7a6b"
          fontSize={7}
          fontFamily="var(--font-outfit), system-ui, sans-serif"
        >
          SI {strokeIndex}
        </text>
      </g>
    </svg>
  );
}
