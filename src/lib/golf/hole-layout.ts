/** Procedural hole layouts for the in-round shot planner (SVG viewBox units). */

export type Point = { x: number; y: number };

export type HoleHazard =
  | { kind: "bunker"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "water"; cx: number; cy: number; rx: number; ry: number };

export type HoleLayout = {
  viewBox: { width: number; height: number };
  /** Approximate meters from tee to green center. */
  lengthMeters: number;
  tee: Point;
  green: Point;
  greenRx: number;
  greenRy: number;
  /** Closed path for rough surround (darker). */
  roughPath: string;
  /** Closed path for fairway. */
  fairwayPath: string;
  hazards: HoleHazard[];
  /** Soft tree clusters for atmosphere. */
  trees: Array<{ cx: number; cy: number; r: number }>;
  /** Default landing spot (fairway aim). */
  defaultTarget: Point;
};

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fallback yardage when CMS has no tee distance. */
export function defaultHoleMeters(par: number): number {
  if (par <= 3) return 150;
  if (par >= 5) return 470;
  return 340;
}

function catmullClosed(points: Point[]): string {
  if (points.length < 3) return "";
  const pts = [...points, points[0]!, points[1]!, points[2]!];
  let d = `M ${points[0]!.x.toFixed(1)} ${points[0]!.y.toFixed(1)}`;
  for (let i = 0; i < points.length; i++) {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const p2 = pts[i + 2]!;
    const p3 = pts[i + 3]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d} Z`;
}

function offsetRibbon(
  centerline: Point[],
  halfWidth: number,
): { left: Point[]; right: Point[] } {
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i < centerline.length; i++) {
    const prev = centerline[Math.max(0, i - 1)]!;
    const next = centerline[Math.min(centerline.length - 1, i + 1)]!;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * halfWidth;
    const ny = (dx / len) * halfWidth;
    const p = centerline[i]!;
    left.push({ x: p.x + nx, y: p.y + ny });
    right.push({ x: p.x - nx, y: p.y - ny });
  }
  return { left, right };
}

export type BuildHoleLayoutInput = {
  holeNumber: number;
  par: number;
  meters?: number | null;
};

/**
 * Build a portrait hole map (tee near top, green near bottom).
 * Seeded by hole number so the same hole looks stable across sessions.
 */
export function buildHoleLayout(input: BuildHoleLayoutInput): HoleLayout {
  const width = 280;
  const height = 520;
  const lengthMeters =
    typeof input.meters === "number" && input.meters > 40
      ? input.meters
      : defaultHoleMeters(input.par);

  const rand = mulberry32(input.holeNumber * 9973 + input.par * 131);
  const dogleg = (rand() - 0.5) * (input.par === 3 ? 18 : 42);
  const midBend = (rand() - 0.5) * (input.par === 3 ? 10 : 28);

  const tee: Point = { x: width * 0.5 + dogleg * 0.15, y: 48 };
  const green: Point = {
    x: width * 0.5 - dogleg * 0.35,
    y: height - 72,
  };
  const mid: Point = {
    x: width * 0.5 + midBend,
    y: height * (input.par === 3 ? 0.45 : 0.42),
  };
  const mid2: Point = {
    x: width * 0.5 + dogleg * 0.55,
    y: height * 0.68,
  };

  const centerline: Point[] =
    input.par === 3
      ? [tee, mid, green]
      : input.par === 5
        ? [
            tee,
            { x: tee.x + midBend * 0.4, y: height * 0.28 },
            mid,
            mid2,
            green,
          ]
        : [tee, mid, mid2, green];

  const fairwayHalf =
    input.par === 3 ? 22 : input.par === 5 ? 28 : 26;
  const roughHalf = fairwayHalf + 34;

  const fairwayRibbon = offsetRibbon(centerline, fairwayHalf);
  const roughRibbon = offsetRibbon(centerline, roughHalf);

  const fairwayOutline = [
    ...fairwayRibbon.left,
    ...[...fairwayRibbon.right].reverse(),
  ];
  const roughOutline = [
    ...roughRibbon.left,
    ...[...roughRibbon.right].reverse(),
  ];

  const greenRx = 18 + rand() * 6;
  const greenRy = 14 + rand() * 5;

  const hazards: HoleHazard[] = [];
  const bunkerCount = input.par === 3 ? 1 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 3);
  for (let i = 0; i < bunkerCount; i++) {
    const t = 0.35 + rand() * 0.5;
    const along = samplePolyline(centerline, t);
    const side = rand() > 0.5 ? 1 : -1;
    hazards.push({
      kind: "bunker",
      cx: along.x + side * (fairwayHalf + 6 + rand() * 10),
      cy: along.y + (rand() - 0.5) * 16,
      rx: 10 + rand() * 8,
      ry: 6 + rand() * 5,
    });
  }

  if (input.par >= 4 && rand() > 0.35) {
    hazards.push({
      kind: "water",
      cx: green.x + (rand() > 0.5 ? 36 : -36),
      cy: green.y + 18 + rand() * 10,
      rx: 22 + rand() * 10,
      ry: 12 + rand() * 6,
    });
  }

  const trees: Array<{ cx: number; cy: number; r: number }> = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const t = 0.12 + rand() * 0.75;
    const along = samplePolyline(centerline, t);
    trees.push({
      cx: along.x + side * (roughHalf + 8 + rand() * 22),
      cy: along.y + (rand() - 0.5) * 24,
      r: 5 + rand() * 7,
    });
  }

  const aimT = input.par === 3 ? 0.55 : 0.48;
  const defaultTarget = samplePolyline(centerline, aimT);

  return {
    viewBox: { width, height },
    lengthMeters,
    tee,
    green,
    greenRx,
    greenRy,
    roughPath: catmullClosed(roughOutline),
    fairwayPath: catmullClosed(fairwayOutline),
    hazards,
    trees,
    defaultTarget,
  };
}

function samplePolyline(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0]!;
  const clamped = Math.min(1, Math.max(0, t));
  const segments: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(
      points[i + 1]!.x - points[i]!.x,
      points[i + 1]!.y - points[i]!.y,
    );
    segments.push(d);
    total += d;
  }
  let remain = clamped * total;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (remain <= seg || i === segments.length - 1) {
      const u = seg === 0 ? 0 : remain / seg;
      const a = points[i]!;
      const b = points[i + 1]!;
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
      };
    }
    remain -= seg;
  }
  return points[points.length - 1]!;
}

/** Euclidean map units → meters using tee→green as scale. */
export function mapDistanceMeters(
  layout: HoleLayout,
  a: Point,
  b: Point,
): number {
  const mapLen = Math.hypot(
    layout.green.x - layout.tee.x,
    layout.green.y - layout.tee.y,
  );
  if (mapLen < 1) return 0;
  const px = Math.hypot(b.x - a.x, b.y - a.y);
  return (px / mapLen) * layout.lengthMeters;
}

export function clampPointToView(
  layout: HoleLayout,
  point: Point,
): Point {
  return {
    x: Math.min(layout.viewBox.width - 8, Math.max(8, point.x)),
    y: Math.min(layout.viewBox.height - 8, Math.max(8, point.y)),
  };
}

/** Client SVG → layout coords. */
export function clientToLayoutPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  layout: HoleLayout,
): Point {
  const rect = svg.getBoundingClientRect();
  const x =
    ((clientX - rect.left) / Math.max(rect.width, 1)) * layout.viewBox.width;
  const y =
    ((clientY - rect.top) / Math.max(rect.height, 1)) * layout.viewBox.height;
  return clampPointToView(layout, { x, y });
}
