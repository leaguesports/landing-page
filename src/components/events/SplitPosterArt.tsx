import type { NationMark, SplitPosterModel } from "@/lib/events/split-poster";
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
      <polygon
        points={left}
        fill={model.home.texture === "pinstripe" ? `url(#${pin})` : model.home.fill}
      />
      {model.home.texture === "halftone" ? (
        <polygon points={left} fill={`url(#${dots})`} mask={`url(#${mask})`} />
      ) : null}
      <polygon
        points={right}
        fill={model.away.texture === "pinstripe" ? `url(#${pin})` : model.away.fill}
      />
      {model.away.texture === "halftone" ? (
        <polygon points={right} fill={`url(#${dots})`} mask={`url(#${mask})`} />
      ) : null}
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

type Sash = { left: number; width: number; shift: number; h: number };

function sashOf(box: Box): Sash {
  const width = box.w * 0.18;
  return { left: box.w * 0.69 - width / 2, width, shift: box.w * 0.12, h: box.h };
}

function weightsFor(count: number, weights?: readonly number[]): number[] {
  const raw =
    weights && weights.length === count && weights.every((value) => value > 0)
      ? [...weights]
      : Array.from({ length: count }, () => 1);
  const total = raw.reduce((sum, value) => sum + value, 0);
  return raw.map((value) => value / total);
}

function verticalBand(sash: Sash, start: number, end: number): string {
  const { left, shift, h } = sash;
  return `${left + start},0 ${left + end},0 ${left + end - shift},${h} ${left + start - shift},${h}`;
}

function horizontalBand(sash: Sash, y0: number, y1: number): string {
  const { left, width, shift, h } = sash;
  const s0 = shift * (y0 / h);
  const s1 = shift * (y1 / h);
  return `${left - s0},${y0} ${left + width - s0},${y0} ${left + width - s1},${y1} ${left - s1},${y1}`;
}

function bandCenter(sash: Sash, start: number, end: number): { x: number; y: number; span: number } {
  const y = sash.h / 2;
  return {
    x: sash.left + (start + end) / 2 - sash.shift * (y / sash.h),
    y,
    span: end - start,
  };
}

function starPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let index = 0; index < 10; index += 1) {
    const distance = index % 2 === 0 ? radius : radius * 0.4;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    points.push(`${cx + Math.cos(angle) * distance},${cy + Math.sin(angle) * distance}`);
  }
  return points.join(" ");
}

function panelPoints(box: Box): string {
  const top = box.w * 0.56;
  const bottom = box.w * 0.44;
  return `${top},0 ${box.w},0 ${box.w},${box.h} ${bottom},${box.h}`;
}

function panelLeft(box: Box, y: number): number {
  return box.w * 0.56 - box.w * 0.12 * (y / box.h);
}

function markUsesPanel(mark: NationMark): boolean {
  return mark.kind !== "bands" && mark.kind !== "centre-block";
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
  const clip = `${raw}-nation`;
  const panel = markUsesPanel(model.mark);
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
      {panel ? (
        <NationPanel mark={model.mark} box={box} frame={frame} clip={clip} />
      ) : (
        <>
          <polygon
            points={`${box.w * 0.78},0 ${box.w},0 ${box.w},${box.h} ${box.w * 0.66},${box.h}`}
            fill={`url(#${pin})`}
          />
          <NationSash mark={model.mark} box={box} />
          {frame === "wide" ? <SpeedLines box={box} /> : null}
        </>
      )}
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
          fill={panel ? "#0B0B0B" : "none"}
          stroke="#fff"
          strokeOpacity={panel ? 0.9 : 0.5}
          strokeWidth={2}
          style={displayFont(120)}
        >
          {model.numeral}
        </text>
      ) : null}
    </svg>
  );
}

function NationSash({ mark, box }: { mark: NationMark; box: Box }) {
  const sash = sashOf(box);
  if (mark.kind === "centre-block") {
    const widths = weightsFor(3, mark.weights);
    let cursor = 0;
    const bands = mark.colours.map((colour, index) => {
      const start = cursor;
      cursor += widths[index]! * sash.width;
      return { colour, start, end: cursor };
    });
    const middle = bands[1]!;
    const center = bandCenter(sash, middle.start, middle.end);
    const side = center.span * 0.46;
    return (
      <>
        {bands.map((band) => (
          <polygon key={band.colour} points={verticalBand(sash, band.start, band.end)} fill={band.colour} />
        ))}
        <rect
          x={center.x - side / 2}
          y={center.y - side / 2}
          width={side}
          height={side}
          fill={mark.block}
        />
      </>
    );
  }

  if (mark.kind !== "bands") return null;
  if (mark.direction === "horizontal") {
    const spans = weightsFor(mark.colours.length, mark.weights);
    let cursor = 0;
    return (
      <>
        {mark.colours.map((colour, index) => {
          const y0 = cursor;
          cursor += spans[index]! * sash.h;
          return <polygon key={`${colour}-${index}`} points={horizontalBand(sash, y0, cursor)} fill={colour} />;
        })}
      </>
    );
  }

  const spans = weightsFor(mark.colours.length, mark.weights);
  let cursor = 0;
  return (
    <>
      {mark.colours.map((colour, index) => {
        const start = cursor;
        cursor += spans[index]! * sash.width;
        return (
          <polygon key={`${colour}-${index}`} points={verticalBand(sash, start, cursor)} fill={colour} />
        );
      })}
    </>
  );
}

function Crescent({
  cx,
  cy,
  radius,
  colour,
  cut,
}: {
  cx: number;
  cy: number;
  radius: number;
  colour: string;
  cut: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={colour} />
      <circle cx={cx + radius * 0.45} cy={cy - radius * 0.06} r={radius * 0.76} fill={cut} />
    </g>
  );
}

function StarField({
  x,
  y,
  width,
  height,
  colour,
  columns,
  rows,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  colour: string;
  columns: number;
  rows: number;
}) {
  const padX = width * 0.12;
  const padY = height * 0.14;
  const cellW = (width - padX * 2) / columns;
  const cellH = (height - padY * 2) / rows;
  const radius = Math.min(cellW, cellH) * 0.34;
  const stars: { cx: number; cy: number }[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      stars.push({
        cx: x + padX + cellW * (column + 0.5),
        cy: y + padY + cellH * (row + 0.5),
      });
    }
  }
  return (
    <>
      {stars.map((star) => (
        <polygon key={`${star.cx}-${star.cy}`} points={starPoints(star.cx, star.cy, radius)} fill={colour} />
      ))}
    </>
  );
}

function serrationPoints(box: Box, teeth: number): string {
  const depth = box.w * 0.055;
  const parts = [`${panelLeft(box, 0)},0`];
  for (let index = 0; index < teeth; index += 1) {
    const mid = (index + 0.5) / teeth;
    const end = (index + 1) / teeth;
    parts.push(`${panelLeft(box, mid * box.h) + depth},${mid * box.h}`);
    parts.push(`${panelLeft(box, end * box.h)},${end * box.h}`);
  }
  return parts.join(" ");
}

function NationPanel({
  mark,
  box,
  frame,
  clip,
}: {
  mark: NationMark;
  box: Box;
  frame: Frame;
  clip: string;
}) {
  const ink = frame === "wide" ? 64 : 28;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <polygon points={panelPoints(box)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <PanelMark mark={mark} box={box} frame={frame} />
      </g>
      <rect x={box.w * 0.4} y={box.h - ink} width={box.w} height={ink} fill="#0B0B0B" />
    </>
  );
}

function PanelMark({ mark, box, frame }: { mark: NationMark; box: Box; frame: Frame }) {
  if (mark.kind === "canton-stars" || mark.kind === "canton-crescent") {
    const count = mark.kind === "canton-stars" ? 7 : 6;
    const cantonW = box.w * 0.2;
    const cantonH = box.h * (mark.kind === "canton-stars" ? 4 / 7 : 0.5);
    const cantonX = box.w * 0.58;
    return (
      <>
        {Array.from({ length: count }, (_, index) => (
          <rect
            key={index}
            x={0}
            y={(index * box.h) / count}
            width={box.w}
            height={box.h / count + 0.5}
            fill={index % 2 === 0 ? mark.stripe : mark.paper}
          />
        ))}
        <rect x={cantonX} y={0} width={cantonW} height={cantonH} fill={mark.canton} />
        {mark.kind === "canton-stars" ? (
          <StarField
            x={cantonX}
            y={0}
            width={cantonW}
            height={cantonH}
            colour={mark.star}
            columns={frame === "wide" ? 4 : 3}
            rows={frame === "wide" ? 3 : 2}
          />
        ) : (
          <Crescent
            cx={cantonX + cantonW * 0.5}
            cy={cantonH * 0.5}
            radius={Math.min(cantonW, cantonH) * 0.28}
            colour={mark.crescent}
            cut={mark.canton}
          />
        )}
      </>
    );
  }

  if (mark.kind === "half-crescent") {
    return (
      <>
        <rect width={box.w} height={box.h / 2} fill={mark.top} />
        <rect y={box.h / 2} width={box.w} height={box.h / 2} fill={mark.bottom} />
        <Crescent
          cx={box.w * 0.68}
          cy={box.h * 0.25}
          radius={box.h * 0.12}
          colour={mark.crescent}
          cut={mark.top}
        />
      </>
    );
  }

  if (mark.kind === "disc") {
    const centered = mark.align === "center";
    return (
      <>
        <rect width={box.w} height={box.h} fill={mark.field} />
        <circle
          cx={box.w * (centered ? 0.78 : 0.68)}
          cy={box.h / 2}
          r={box.h * (centered ? 0.28 : 0.2)}
          fill={mark.disc}
        />
      </>
    );
  }

  if (mark.kind === "diamond") {
    const cx = box.w * 0.78;
    const cy = box.h / 2;
    const rx = box.w * 0.11;
    const ry = box.h * 0.34;
    return (
      <>
        <rect width={box.w} height={box.h} fill={mark.field} />
        <polygon
          points={`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`}
          fill={mark.diamond}
        />
        <circle cx={cx} cy={cy} r={Math.min(rx, ry) * 0.42} fill={mark.disc} />
      </>
    );
  }

  if (mark.kind === "pale") {
    const x0 = box.w * 0.5;
    const span = (box.w - x0) / 3;
    const cx = x0 + span * 1.5;
    const cy = box.h / 2;
    const radius = Math.min(span, box.h * 0.34) * 0.42;
    return (
      <>
        <rect x={x0} width={span} height={box.h} fill={mark.hoist} />
        <rect x={x0 + span} width={span} height={box.h} fill={mark.centre} />
        <rect x={x0 + span * 2} width={box.w} height={box.h} fill={mark.hoist} />
        <polygon
          points={`${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`}
          fill={mark.mark}
        />
      </>
    );
  }

  if (mark.kind === "union") {
    const left = box.w * 0.62;
    const bar = frame === "wide" ? 22 : 10;
    const midX = left + (box.w - left) * 0.42;
    return (
      <>
        <rect width={box.w} height={box.h} fill={mark.field} />
        <line
          x1={left}
          y1={0}
          x2={box.w}
          y2={box.h}
          stroke={mark.saltire}
          strokeWidth={bar * 1.35}
        />
        <line
          x1={left}
          y1={box.h}
          x2={box.w}
          y2={0}
          stroke={mark.saltire}
          strokeWidth={bar * 1.35}
        />
        <rect x={left} y={box.h / 2 - bar} width={box.w - left} height={bar * 2} fill={mark.cross} />
        <rect x={midX - bar} y={0} width={bar * 2} height={box.h} fill={mark.cross} />
      </>
    );
  }

  if (mark.kind === "dots") {
    const dots = [
      { x: 0.7, y: 0.3, s: 0.05 },
      { x: 0.84, y: 0.4, s: 0.034 },
      { x: 0.76, y: 0.58, s: 0.055 },
      { x: 0.64, y: 0.5, s: 0.03 },
      { x: 0.88, y: 0.72, s: 0.028 },
    ];
    return (
      <>
        <rect width={box.w} height={box.h} fill={mark.field} />
        {dots.map((dot) => (
          <circle
            key={`${dot.x}-${dot.y}`}
            cx={box.w * dot.x}
            cy={box.h * dot.y}
            r={box.h * dot.s}
            fill={mark.dot}
          />
        ))}
      </>
    );
  }

  if (mark.kind === "serrated") {
    return (
      <>
        <rect width={box.w} height={box.h} fill={mark.field} />
        <polygon points={serrationPoints(box, mark.teeth)} fill={mark.hoist} />
      </>
    );
  }

  if (mark.kind === "hoist") {
    return (
      <>
        <rect width={box.w} height={box.h} fill={mark.hoist} />
        {mark.bands.map((colour, index) => (
          <rect
            key={`${colour}-${index}`}
            x={box.w * 0.7}
            y={(index * box.h) / mark.bands.length}
            width={box.w}
            height={box.h / mark.bands.length + 0.5}
            fill={colour}
          />
        ))}
      </>
    );
  }

  if (mark.kind === "crescent") {
    return (
      <>
        {mark.bands.map((colour, index) => (
          <rect
            key={`${colour}-${index}`}
            y={(index * box.h) / 3}
            width={box.w}
            height={box.h / 3 + 0.5}
            fill={colour}
          />
        ))}
        <Crescent
          cx={box.w * 0.76}
          cy={box.h / 2}
          radius={box.h * 0.11}
          colour={mark.crescent}
          cut={mark.bands[1]}
        />
      </>
    );
  }

  return null;
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
