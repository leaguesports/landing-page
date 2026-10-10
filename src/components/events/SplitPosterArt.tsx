import type { SplitPosterModel } from "@/lib/events/split-poster";
import type { CSSProperties } from "react";
import { useId } from "react";

type Frame = "wide" | "compact";

type Box = {
  w: number;
  h: number;
  pad: number;
  nameSize: number;
  dateSize: number;
  labelSize: number;
  tracking: number;
  seam: number;
  vs: number;
};

const WIDE: Box = {
  w: 1216,
  h: 400,
  pad: 40,
  nameSize: 184,
  dateSize: 34,
  labelSize: 13,
  tracking: 2.6,
  seam: 6,
  vs: 46,
};

const COMPACT: Box = {
  w: 358,
  h: 200,
  pad: 14,
  nameSize: 62,
  dateSize: 0,
  labelSize: 9,
  tracking: 1.6,
  seam: 3,
  vs: 22,
};

function boxFor(frame: Frame): Box {
  return frame === "wide" ? WIDE : COMPACT;
}

/** Bebas is condensed. Shrink only when the word would cross the seam. */
function fitSize(text: string, maxWidth: number, maxSize: number, minSize: number): number {
  const widthAt = (size: number) => text.length * size * 0.46 + Math.max(text.length - 1, 0) * 1.2;
  let size = maxSize;
  while (size > minSize && widthAt(size) > maxWidth) size -= 2;
  return size;
}

function seamX(box: Box, y: number): number {
  const top = box.w * 0.56;
  const bottom = box.w * 0.44;
  return top + (bottom - top) * (y / box.h);
}

function displayFont(size: number): CSSProperties {
  return {
    fontFamily: "var(--font-bebas), Impact, sans-serif",
    fontSize: size,
    letterSpacing: "0.02em",
  };
}

function labelFont(size: number, tracking: number): CSSProperties {
  return {
    fontFamily: "var(--font-outfit), system-ui, sans-serif",
    fontSize: size,
    fontWeight: 700,
    letterSpacing: tracking,
  };
}

function svgProps(box: Box) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: `0 0 ${box.w} ${box.h}`,
    className: "block h-auto w-full",
    "aria-hidden": true as const,
    focusable: "false" as const,
  };
}

export function SplitPoster({ model }: { model: SplitPosterModel }) {
  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="sm:hidden">
        <SplitPosterArt model={model} frame="compact" />
      </div>
      <div className="hidden sm:block">
        <SplitPosterArt model={model} frame="wide" />
      </div>
    </div>
  );
}

export function SplitPosterArt({
  model,
  frame,
}: {
  model: SplitPosterModel;
  frame: Frame;
}) {
  const box = boxFor(frame);
  if (model.kind === "match") return <MatchArt model={model} box={box} frame={frame} />;
  if (model.kind === "race") return <RaceArt model={model} box={box} frame={frame} />;
  return <TitleArt model={model} box={box} />;
}

function MatchArt({
  model,
  box,
  frame,
}: {
  model: Extract<SplitPosterModel, { kind: "match" }>;
  box: Box;
  frame: Frame;
}) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pin = `${raw}-pin`;
  const dots = `${raw}-dots`;
  const fade = `${raw}-fade`;
  const mask = `${raw}-mask`;
  const top = box.w * 0.56;
  const bottom = box.w * 0.44;
  const left = `0,0 ${top},0 ${bottom},${box.h} 0,${box.h}`;
  const right = `${top},0 ${box.w},0 ${box.w},${box.h} ${bottom},${box.h}`;
  const midX = (top + bottom) / 2;
  const homeName = model.home.displayName.toLocaleUpperCase("en");
  const awayName = model.away.displayName.toLocaleUpperCase("en");
  const nameY = frame === "wide" ? box.h * 0.422 : box.h * 0.287;
  const awayY = frame === "wide" ? box.h * 0.91 : box.h * 0.94;
  const homeSize = fitSize(
    homeName,
    seamX(box, nameY) - box.pad - 28,
    box.nameSize,
    frame === "wide" ? 72 : 28,
  );
  const awaySize = fitSize(
    awayName,
    box.w - box.pad - seamX(box, awayY) - 28,
    box.nameSize,
    frame === "wide" ? 72 : 28,
  );
  const corner = (model.cornerTitle ?? "").toLocaleUpperCase("en");
  const dot = frame === "wide" ? 10 : 6;
  const nameX = frame === "wide" ? 34 : 12;

  return (
    <svg {...svgProps(box)}>
      <defs>
        <pattern
          id={pin}
          width={frame === "wide" ? 12 : 7}
          height={frame === "wide" ? 12 : 7}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-35)"
        >
          <rect width="100%" height="100%" fill="#111111" />
          <rect width={frame === "wide" ? 2.5 : 1.5} height="100%" fill="#fff" opacity="0.16" />
        </pattern>
        <pattern id={dots} width={dot} height={dot} patternUnits="userSpaceOnUse">
          <circle cx={dot / 2} cy={dot / 2} r={dot * 0.24} fill="#000" opacity="0.16" />
        </pattern>
        <linearGradient id={fade} x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={mask}>
          <rect width={box.w} height={box.h} fill={`url(#${fade})`} />
        </mask>
      </defs>
      <polygon points={left} fill={model.home.fill} />
      {model.home.texture === "halftone" ? (
        <polygon points={left} fill={`url(#${dots})`} mask={`url(#${mask})`} />
      ) : null}
      <polygon
        points={right}
        fill={model.away.texture === "pinstripe" ? `url(#${pin})` : model.away.fill}
      />
      <line x1={top} y1={0} x2={bottom} y2={box.h} stroke="#fff" strokeWidth={box.seam} />
      <text x={nameX} y={nameY} fill={model.home.ink} style={displayFont(homeSize)}>
        {homeName}
      </text>
      <text
        x={box.w - nameX}
        y={awayY}
        textAnchor="end"
        fill={model.away.ink}
        style={displayFont(awaySize)}
      >
        {awayName}
      </text>
      <circle cx={midX} cy={box.h / 2} r={box.vs} fill="#fff" />
      <circle
        cx={midX}
        cy={box.h / 2}
        r={box.vs * 0.85}
        fill="none"
        stroke="#0B0B0B"
        strokeWidth={frame === "wide" ? 1.5 : 1}
      />
      <text
        x={midX}
        y={box.h / 2 + box.vs * 0.36}
        textAnchor="middle"
        fill="#0B0B0B"
        style={displayFont(box.vs)}
      >
        VS
      </text>
      {frame === "wide" && model.home.epithet ? (
        <text x={box.pad} y={326} fill={model.home.ink} style={labelFont(box.labelSize, box.tracking)}>
          {model.home.epithet.toLocaleUpperCase("en")}
        </text>
      ) : null}
      {frame === "wide" ? (
        <text x={box.pad} y={360} fill={model.home.ink} style={displayFont(box.dateSize)}>
          {model.dateLine}
        </text>
      ) : (
        <text
          x={box.pad}
          y={box.h - 14}
          fill={model.home.ink}
          style={labelFont(box.labelSize, box.tracking)}
        >
          {(model.metaDate ?? model.dateLine).toLocaleUpperCase("en")}
        </text>
      )}
      {frame === "wide" && model.away.epithet ? (
        <text
          x={box.w - box.pad}
          y={52}
          textAnchor="end"
          fill={model.away.ink}
          style={labelFont(box.labelSize, box.tracking)}
        >
          {model.away.epithet.toLocaleUpperCase("en")}
        </text>
      ) : null}
      {corner ? (
        <text
          x={box.w - (frame === "wide" ? box.pad : 14)}
          y={frame === "wide" ? 88 : 22}
          textAnchor="end"
          fill={model.away.ink}
          style={
            frame === "wide" ? displayFont(box.dateSize) : labelFont(box.labelSize, box.tracking)
          }
        >
          {corner}
        </text>
      ) : null}
    </svg>
  );
}

function sashPoints(box: Box, index: number, count: number): string {
  const band = box.w * (count === 1 ? 0.12 : 0.06);
  const shift = box.w * 0.12;
  const center = box.w * 0.69;
  const origin = center - (count * band) / 2;
  const x0 = origin + index * band;
  const x1 = x0 + band;
  return `${x0},0 ${x1},0 ${x1 - shift},${box.h} ${x0 - shift},${box.h}`;
}

function RaceArt({
  model,
  box,
  frame,
}: {
  model: Extract<SplitPosterModel, { kind: "race" }>;
  box: Box;
  frame: Frame;
}) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pin = `${raw}-pin`;
  const leadSize = fitSize(
    model.lead,
    box.w * 0.52,
    frame === "wide" ? 158 : 58,
    frame === "wide" ? 72 : 32,
  );
  const restLine = model.rest ? `${model.rest} GP` : "GP";
  const restSize = fitSize(restLine, box.w * 0.52, leadSize, frame === "wide" ? 72 : 32);
  const leadY = frame === "wide" ? 150.6 : 54.6;
  const restY = frame === "wide" ? 286.5 : leadY + restSize * 0.86;

  return (
    <svg {...svgProps(box)}>
      <defs>
        <pattern
          id={pin}
          width={frame === "wide" ? 12 : 7}
          height={frame === "wide" ? 12 : 7}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-35)"
        >
          <rect width="100%" height="100%" fill="#0B0B0B" />
          <rect width={frame === "wide" ? 2.5 : 1.5} height="100%" fill="#fff" opacity="0.08" />
        </pattern>
      </defs>
      <rect width={box.w} height={box.h} fill="#0B0B0B" />
      <polygon
        points={`${box.w * 0.78},0 ${box.w},0 ${box.w},${box.h} ${box.w * 0.66},${box.h}`}
        fill={`url(#${pin})`}
      />
      {model.stripes.map((colour, index) => (
        <polygon
          key={`${colour}-${index}`}
          points={sashPoints(box, index, model.stripes.length)}
          fill={colour}
        />
      ))}
      {frame === "wide" ? <SpeedLines box={box} /> : null}
      <text x={frame === "wide" ? 35 : 12} y={leadY} fill="#fff" style={displayFont(leadSize)}>
        {model.lead}
      </text>
      <text x={frame === "wide" ? 35 : 12} y={restY} fill="#fff" style={displayFont(restSize)}>
        {model.rest ? <tspan>{model.rest} </tspan> : null}
        <tspan fill="none" stroke="#F3EFE6" strokeWidth={frame === "wide" ? 3 : 1.4}>
          GP
        </tspan>
      </text>
      <text
        x={frame === "wide" ? 40 : 14}
        y={frame === "wide" ? 360 : box.h - 14}
        fill="#fff"
        style={frame === "wide" ? displayFont(34) : labelFont(9, 1.6)}
      >
        {frame === "wide"
          ? model.dateLine
          : (model.metaDate ?? model.dateLine).toLocaleUpperCase("en")}
      </text>
      {frame === "wide" && model.weekendLine ? (
        <text
          x={box.w - 40}
          y={360}
          textAnchor="end"
          fill="#fff"
          style={labelFont(13, 2.6)}
        >
          {model.weekendLine}
        </text>
      ) : null}
      {frame === "compact" ? (
        <text x={box.w - 14} y={box.h - 14} textAnchor="end" fill="#fff" style={labelFont(9, 1.6)}>
          RACE DAY
        </text>
      ) : null}
      {frame === "wide" && model.numeral ? (
        <text
          x={box.w - 40}
          y={140}
          textAnchor="end"
          fill="none"
          stroke="#fff"
          strokeOpacity={0.5}
          strokeWidth={2}
          style={displayFont(120)}
        >
          {model.numeral}
        </text>
      ) : null}
    </svg>
  );
}

function SpeedLines({ box }: { box: Box }) {
  const lines = [
    { y: 0.58, w: 0.21, o: 0.47 },
    { y: 0.52, w: 0.16, o: 0.17 },
    { y: 0.64, w: 0.18, o: 0.42 },
    { y: 0.75, w: 0.14, o: 0.45 },
    { y: 0.48, w: 0.22, o: 0.19 },
    { y: 0.69, w: 0.15, o: 0.36 },
  ];
  return (
    <>
      {lines.map((line) => (
        <rect
          key={line.y}
          x={box.w * (0.98 - line.w)}
          y={box.h * line.y}
          width={box.w * line.w}
          height={2}
          fill="#fff"
          opacity={line.o}
        />
      ))}
    </>
  );
}

function TitleArt({
  model,
  box,
}: {
  model: Extract<SplitPosterModel, { kind: "title" }>;
  box: Box;
}) {
  const line = model.headline.toLocaleUpperCase("en");
  const size = fitSize(line, box.w - box.pad * 2, Math.min(box.nameSize, 120), 28);
  return (
    <svg {...svgProps(box)}>
      <rect width={box.w} height={box.h} fill={model.fill} />
      <polygon
        points={`0,0 ${box.w * 0.62},0 ${box.w * 0.5},${box.h} 0,${box.h}`}
        fill="#2c3646"
      />
      <text x={box.pad} y={box.h * 0.48} fill="#fff" style={displayFont(size)}>
        {line}
      </text>
      {model.dateLine ? (
        <text
          x={box.pad}
          y={box.h - box.pad}
          fill="#fff"
          style={displayFont(Math.max(box.dateSize, 18))}
        >
          {model.dateLine}
        </text>
      ) : null}
    </svg>
  );
}
