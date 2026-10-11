"use client";

import type { PosterFlag } from "@/lib/events/poster-flags";
import type { SplitPosterModel } from "@/lib/events/split-poster";
import { useEffect, useId, useState, type CSSProperties } from "react";

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
  if (model.kind === "race") {
    return (
      <div className="overflow-hidden rounded-2xl">
        <RacePoster model={model} />
      </div>
    );
  }
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
  if (model.kind === "race") return <RacePoster model={model} />;
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

function titleSize(text: string): string {
  const px = Math.min(150, Math.floor(720 / Math.max(text.length * 0.36, 1)));
  const cqw = (px / 1280) * 100;
  return `clamp(22px, ${cqw.toFixed(2)}cqw, ${px}px)`;
}

const FLAG_GRADIENT =
  "linear-gradient(90deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.25) 45%, rgba(0,0,0,.05) 100%), linear-gradient(0deg, rgba(0,0,0,.35), transparent 40%)";

function FlagBand({ flag }: { flag: PosterFlag }) {
  const src = flag.kind === "image" ? flag.src : "";
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  return (
    <div
      className="absolute inset-y-0 right-0 overflow-hidden"
      style={{ width: "48.4375%", clipPath: "polygon(34% 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      {flag.kind === "image" && !failed ? (
        <img
          src={flag.src}
          alt=""
          className="block h-full w-full object-cover"
          style={{ objectPosition: flag.objectPosition, filter: "saturate(0.9)" }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          data-flag-fallback
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: flag.kind === "fallback" ? flag.fill : "#3a4658" }}
        >
          <span
            className="font-display leading-none text-transparent"
            style={{ WebkitTextStroke: "2px #fff", fontSize: "clamp(36px, 8cqw, 96px)" }}
          >
            {flag.initials}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: FLAG_GRADIENT }} />
    </div>
  );
}

function RacePoster({ model }: { model: Extract<SplitPosterModel, { kind: "race" }> }) {
  return (
    <div className="@container relative w-full bg-black" style={{ aspectRatio: "1280 / 400" }}>
      <FlagBand flag={model.flag} />
      <div className="absolute top-[12%] left-[5%] z-10 w-[62%]">
        <p
          className="font-sans font-bold uppercase text-white"
          style={{ fontSize: "clamp(10px, 1.05cqw, 13px)", letterSpacing: "0.2em" }}
        >
          {model.kicker}
        </p>
        <p className="font-display leading-[0.9] text-white" style={{ fontSize: titleSize(model.headline) }}>
          {model.headline}
        </p>
        {model.circuit ? (
          <p
            className="mt-[0.7em] font-sans tracking-[0.04em] text-[#bbb]"
            style={{ fontSize: "clamp(12px, 1.56cqw, 20px)" }}
          >
            {model.circuit}
          </p>
        ) : null}
      </div>
      <p
        className="absolute bottom-[7.5%] left-[5%] z-10 font-display leading-none text-white"
        style={{ fontSize: "clamp(13px, 2.2cqw, 28px)", letterSpacing: "0.02em" }}
      >
        {model.dateLine}
      </p>
    </div>
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
