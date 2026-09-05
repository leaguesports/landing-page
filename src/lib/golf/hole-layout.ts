/**
 * Deterministic stylized hole layouts for the scorecard.
 * Not GPS/GeoJSON — unique schematic vectors from hole number / par / SI.
 */

export type HoleLayoutShape =
  | "straight"
  | "dogleg-left"
  | "dogleg-right"
  | "s-curve";

export type HoleLayoutBunker = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation: number;
};

export type HoleLayoutTree = {
  x: number;
  y: number;
  r: number;
};

export type HoleLayout = {
  viewBoxWidth: number;
  viewBoxHeight: number;
  shape: HoleLayoutShape;
  shapeLabel: string;
  /** Fairway centerline from tee → green (SVG path d). */
  centerline: string;
  fairwayWidth: number;
  tee: { x: number; y: number; width: number; height: number };
  green: { cx: number; cy: number; rx: number; ry: number };
  flag: { x: number; y: number };
  bunkers: HoleLayoutBunker[];
  /** Optional water hazard path (closed). */
  waterPath: string | null;
  trees: HoleLayoutTree[];
  /** Rough accent blobs behind the fairway. */
  roughBlobs: Array<{ cx: number; cy: number; rx: number; ry: number }>;
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

function hashSeed(holeNumber: number, par: number, strokeIndex: number): number {
  return (
    (holeNumber * 73856093) ^
    (par * 19349663) ^
    (strokeIndex * 83492791) ^
    0x9e3779b9
  );
}

function pickShape(
  par: number,
  rand: () => number,
): HoleLayoutShape {
  if (par === 3) {
    return rand() < 0.72 ? "straight" : rand() < 0.5 ? "dogleg-left" : "dogleg-right";
  }
  const roll = rand();
  if (par === 5) {
    if (roll < 0.28) return "straight";
    if (roll < 0.52) return "dogleg-left";
    if (roll < 0.76) return "dogleg-right";
    return "s-curve";
  }
  if (roll < 0.22) return "straight";
  if (roll < 0.48) return "dogleg-left";
  if (roll < 0.74) return "dogleg-right";
  return "s-curve";
}

function shapeLabel(shape: HoleLayoutShape, par: number): string {
  switch (shape) {
    case "dogleg-left":
      return par === 3 ? "Slight left bend" : "Dogleg left";
    case "dogleg-right":
      return par === 3 ? "Slight right bend" : "Dogleg right";
    case "s-curve":
      return "Double bend";
    default:
      return par === 3 ? "Straight approach" : "Straight away";
  }
}

type Spine = {
  teeX: number;
  teeY: number;
  midX: number;
  midY: number;
  mid2X: number;
  mid2Y: number;
  greenX: number;
  greenY: number;
};

function buildSpine(
  shape: HoleLayoutShape,
  par: number,
  width: number,
  height: number,
  rand: () => number,
): Spine {
  const marginX = 36;
  const teeY = height - 28;
  const greenY = par === 3 ? 52 : par === 4 ? 44 : 38;
  const teeX = width * (0.42 + rand() * 0.16);
  const greenX = width * (0.38 + rand() * 0.24);
  const midY = height * (par === 3 ? 0.48 : par === 4 ? 0.52 : 0.58);
  const mid2Y = height * 0.34;

  const bend = (par === 3 ? 28 : par === 4 ? 48 : 58) * (0.75 + rand() * 0.5);

  let midX = (teeX + greenX) / 2;
  let mid2X = (midX + greenX) / 2;

  if (shape === "dogleg-left") {
    midX = Math.max(marginX, Math.min(width - marginX, midX - bend));
    mid2X = (midX + greenX) / 2;
  } else if (shape === "dogleg-right") {
    midX = Math.max(marginX, Math.min(width - marginX, midX + bend));
    mid2X = (midX + greenX) / 2;
  } else if (shape === "s-curve") {
    midX = Math.max(marginX, Math.min(width - marginX, midX - bend * 0.85));
    mid2X = Math.max(marginX, Math.min(width - marginX, ((midX + greenX) / 2) + bend * 0.7));
  } else {
    midX += (rand() - 0.5) * 18;
    mid2X = (midX + greenX) / 2;
  }

  return { teeX, teeY, midX, midY, mid2X, mid2Y, greenX, greenY };
}

function centerlinePath(spine: Spine, par: number): string {
  if (par === 3) {
    return `M ${spine.teeX.toFixed(1)} ${spine.teeY.toFixed(1)} Q ${spine.midX.toFixed(1)} ${spine.midY.toFixed(1)} ${spine.greenX.toFixed(1)} ${spine.greenY.toFixed(1)}`;
  }
  return `M ${spine.teeX.toFixed(1)} ${spine.teeY.toFixed(1)} C ${spine.teeX.toFixed(1)} ${(spine.teeY - 40).toFixed(1)}, ${spine.midX.toFixed(1)} ${(spine.midY + 30).toFixed(1)}, ${spine.midX.toFixed(1)} ${spine.midY.toFixed(1)} S ${spine.mid2X.toFixed(1)} ${spine.mid2Y.toFixed(1)}, ${spine.greenX.toFixed(1)} ${spine.greenY.toFixed(1)}`;
}

function pointAlongPar(
  spine: Spine,
  t: number,
  par: number,
): { x: number; y: number } {
  // Approximate Bezier samples for bunker placement.
  if (par === 3) {
    const u = 1 - t;
    return {
      x: u * u * spine.teeX + 2 * u * t * spine.midX + t * t * spine.greenX,
      y: u * u * spine.teeY + 2 * u * t * spine.midY + t * t * spine.greenY,
    };
  }
  // Two-stage lerp along control points (good enough for schematic accents).
  if (t < 0.5) {
    const local = t * 2;
    return {
      x: spine.teeX + (spine.midX - spine.teeX) * local,
      y: spine.teeY + (spine.midY - spine.teeY) * local,
    };
  }
  const local = (t - 0.5) * 2;
  return {
    x: spine.midX + (spine.greenX - spine.midX) * local,
    y: spine.midY + (spine.greenY - spine.midY) * local,
  };
}

/**
 * Build a unique schematic layout for a hole.
 * Same inputs always produce the same vectors.
 */
export function buildHoleLayout(
  holeNumber: number,
  par: number,
  strokeIndex: number,
): HoleLayout {
  const safePar = par >= 3 && par <= 5 ? par : 4;
  const rand = mulberry32(hashSeed(holeNumber, safePar, strokeIndex));
  const viewBoxWidth = 220;
  const viewBoxHeight = 300;
  const shape = pickShape(safePar, rand);
  const spine = buildSpine(shape, safePar, viewBoxWidth, viewBoxHeight, rand);

  const fairwayWidth =
    safePar === 3 ? 22 + rand() * 6 : safePar === 4 ? 26 + rand() * 8 : 30 + rand() * 10;

  const greenRx = 18 + rand() * 8;
  const greenRy = 14 + rand() * 6;

  const difficulty = strokeIndex <= 6 ? 2 : strokeIndex <= 12 ? 1 : 0;
  const bunkerCount =
    (safePar === 3 ? 1 : safePar === 4 ? 2 : 3) + difficulty + (rand() > 0.55 ? 1 : 0);

  const bunkers: HoleLayoutBunker[] = [];
  for (let i = 0; i < bunkerCount; i++) {
    const t =
      safePar === 3
        ? 0.55 + rand() * 0.35
        : 0.28 + (i / Math.max(1, bunkerCount - 1)) * 0.55 + (rand() - 0.5) * 0.08;
    const along = pointAlongPar(spine, Math.min(0.92, Math.max(0.18, t)), safePar);
    const side = i % 2 === 0 ? -1 : 1;
    const offset = fairwayWidth * (0.55 + rand() * 0.45) * side;
    bunkers.push({
      cx: along.x + offset,
      cy: along.y + (rand() - 0.5) * 12,
      rx: 9 + rand() * 7,
      ry: 5.5 + rand() * 4.5,
      rotation: (rand() - 0.5) * 50,
    });
  }

  let waterPath: string | null = null;
  if (safePar >= 4 && (strokeIndex <= 8 || rand() > 0.55)) {
    const side = rand() > 0.5 ? 1 : -1;
    const along = pointAlongPar(spine, 0.42 + rand() * 0.2, safePar);
    const cx = along.x + side * (fairwayWidth * 0.95 + 18);
    const cy = along.y;
    const rx = 20 + rand() * 16;
    const ry = 12 + rand() * 12;
    waterPath = `M ${(cx - rx).toFixed(1)} ${cy.toFixed(1)} Q ${cx.toFixed(1)} ${(cy - ry).toFixed(1)} ${(cx + rx).toFixed(1)} ${cy.toFixed(1)} Q ${cx.toFixed(1)} ${(cy + ry).toFixed(1)} ${(cx - rx).toFixed(1)} ${cy.toFixed(1)} Z`;
  } else if (safePar === 3 && rand() > 0.55) {
    const side = rand() > 0.5 ? 1 : -1;
    const cx = spine.greenX + side * (greenRx + 22);
    const cy = spine.greenY + 8;
    waterPath = `M ${(cx - 14).toFixed(1)} ${cy.toFixed(1)} Q ${cx.toFixed(1)} ${(cy - 12).toFixed(1)} ${(cx + 14).toFixed(1)} ${cy.toFixed(1)} Q ${cx.toFixed(1)} ${(cy + 10).toFixed(1)} ${(cx - 14).toFixed(1)} ${cy.toFixed(1)} Z`;
  }

  const trees: HoleLayoutTree[] = [];
  const treeCount = 4 + Math.floor(rand() * 5) + difficulty;
  for (let i = 0; i < treeCount; i++) {
    const t = 0.15 + rand() * 0.7;
    const along = pointAlongPar(spine, t, safePar);
    const side = rand() > 0.5 ? 1 : -1;
    trees.push({
      x: along.x + side * (fairwayWidth * 0.85 + 14 + rand() * 28),
      y: along.y + (rand() - 0.5) * 20,
      r: 3.5 + rand() * 3.5,
    });
  }

  const roughBlobs = [
    {
      cx: viewBoxWidth * 0.22,
      cy: viewBoxHeight * 0.35,
      rx: 40 + rand() * 20,
      ry: 55 + rand() * 25,
    },
    {
      cx: viewBoxWidth * 0.8,
      cy: viewBoxHeight * 0.55,
      rx: 35 + rand() * 25,
      ry: 50 + rand() * 30,
    },
    {
      cx: viewBoxWidth * 0.5,
      cy: viewBoxHeight * 0.18,
      rx: 50 + rand() * 20,
      ry: 28 + rand() * 16,
    },
  ];

  const teeWidth = 16 + rand() * 4;
  const teeHeight = 10;

  return {
    viewBoxWidth,
    viewBoxHeight,
    shape,
    shapeLabel: shapeLabel(shape, safePar),
    centerline: centerlinePath(spine, safePar),
    fairwayWidth,
    tee: {
      x: spine.teeX - teeWidth / 2,
      y: spine.teeY - teeHeight / 2,
      width: teeWidth,
      height: teeHeight,
    },
    green: {
      cx: spine.greenX,
      cy: spine.greenY,
      rx: greenRx,
      ry: greenRy,
    },
    flag: {
      x: spine.greenX + (rand() - 0.5) * greenRx * 0.5,
      y: spine.greenY - greenRy * 0.15,
    },
    bunkers,
    waterPath,
    trees,
    roughBlobs,
  };
}
