import * as THREE from "three";
import { worldVec } from "@/lib/openf1/coords";
import type { ReplayCircuit } from "@/lib/openf1/replay";

const BRAND = 0x3dff8a;

function circuitPoints(circuit: ReplayCircuit): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const mapped = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < circuit.x.length; i += 1) {
    worldVec(
      circuit.x[i]!,
      circuit.y[i]!,
      circuit.z[i] ?? 0,
      mapped,
      circuit.z0,
    );
    points.push(
      new THREE.Vector3(mapped.x, mapped.y + TRACK_DECK_Y, mapped.z),
    );
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (first && last && first.distanceTo(last) > 0.01) {
    points.push(first.clone());
  }
  return points;
}

function offsetPolyline(points: THREE.Vector3[], dist: number): THREE.Vector3[] {
  const count = points.length;
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < count; i += 1) {
    const prev = points[i === 0 ? count - 2 : i - 1]!;
    const next = points[(i + 1) % count]!;
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const p = points[i]!;
    out.push(new THREE.Vector3(p.x + nx * dist, p.y, p.z + nz * dist));
  }
  return out;
}

export const TRACK_RIBBON_WIDTH = 4.4;
export const TRACK_DECK_Y = 0.04;

function tubeFromPoints(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  tubularSegments = 400,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.15);
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, 8, true);
  return new THREE.Mesh(geometry, material);
}

function ribbonFromEdges(
  left: THREE.Vector3[],
  right: THREE.Vector3[],
): THREE.BufferGeometry {
  const count = Math.min(left.length, right.length);
  const positions = new Float32Array(count * 2 * 3);
  for (let i = 0; i < count; i += 1) {
    const l = left[i]!;
    const r = right[i]!;
    const o = i * 6;
    positions[o] = l.x;
    positions[o + 1] = l.y;
    positions[o + 2] = l.z;
    positions[o + 3] = r.x;
    positions[o + 4] = r.y;
    positions[o + 5] = r.z;
  }
  const indices: number[] = [];
  const segs = count - 1;
  for (let i = 0; i < segs; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c, b, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function buildNeonTrack(circuit: ReplayCircuit): {
  group: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
} {
  const points = circuitPoints(circuit);
  const curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.15);
  const group = new THREE.Group();
  group.name = "neon-track";

  const half = TRACK_RIBBON_WIDTH / 2;
  const inner = offsetPolyline(points, half);
  const outer = offsetPolyline(points, -half);

  const ribbonMat = new THREE.MeshBasicMaterial({
    color: 0x101a12,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
  const ribbon = new THREE.Mesh(ribbonFromEdges(inner, outer), ribbonMat);
  ribbon.renderOrder = 0;
  group.add(ribbon);

  const edgeMat = new THREE.MeshBasicMaterial({ color: BRAND });
  const glowMat = new THREE.MeshBasicMaterial({
    color: BRAND,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  group.add(tubeFromPoints(inner, 0.09, edgeMat, 420));
  group.add(tubeFromPoints(outer, 0.09, edgeMat, 420));
  group.add(tubeFromPoints(inner, 0.32, glowMat, 280));
  group.add(tubeFromPoints(outer, 0.32, glowMat, 280));

  const dashCount = 160;
  const dashGeom = new THREE.BoxGeometry(0.18, 0.05, 0.7);
  const dashMat = new THREE.MeshBasicMaterial({
    color: BRAND,
    transparent: true,
    opacity: 0.55,
  });
  const dashes = new THREE.InstancedMesh(dashGeom, dashMat, dashCount);
  const dummy = new THREE.Object3D();
  const spaced = curve.getSpacedPoints(dashCount);
  let visible = 0;
  for (let i = 0; i < spaced.length; i += 1) {
    if (i % 2 === 1) continue;
    const p = spaced[i]!;
    const n = spaced[(i + 1) % spaced.length]!;
    dummy.position.copy(p);
    dummy.position.y = p.y + 0.06;
    dummy.lookAt(n.x, n.y, n.z);
    dummy.updateMatrix();
    dashes.setMatrixAt(visible, dummy.matrix);
    visible += 1;
  }
  dashes.count = visible;
  dashes.instanceMatrix.needsUpdate = true;
  group.add(dashes);

  return { group, curve, points };
}

export function buildGridFloor(span: number): THREE.Group {
  const group = new THREE.Group();
  const size = Math.max(180, span * 2.4);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ color: 0x0c0f0c }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.04;
  group.add(plane);

  const minor = new THREE.GridHelper(size, 80, 0x1a2418, 0x141c16);
  minor.position.y = 0.01;
  for (const material of Array.isArray(minor.material) ? minor.material : [minor.material]) {
    material.transparent = true;
    material.opacity = 0.35;
  }
  group.add(minor);

  const major = new THREE.GridHelper(size, 16, 0x3dff8a, 0x1f2a1c);
  major.position.y = 0.02;
  for (const material of Array.isArray(major.material) ? major.material : [major.material]) {
    material.transparent = true;
    material.opacity = 0.22;
  }
  group.add(major);
  return group;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildScenery(
  points: THREE.Vector3[],
  seed = 39,
): THREE.Group {
  const group = new THREE.Group();
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  const pad = 28;
  const rand = mulberry32(seed);
  const sampled = points.filter((_, i) => i % 6 === 0);

  const nearTrack = (x: number, z: number, minDist: number) => {
    for (const p of sampled) {
      const dx = p.x - x;
      const dz = p.z - z;
      if (dx * dx + dz * dz < minDist * minDist) return true;
    }
    return false;
  };

  const treeGeom = new THREE.ConeGeometry(0.7, 2.4, 5);
  const treeMat = new THREE.MeshBasicMaterial({
    color: BRAND,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const treeCount = 90;
  const trees = new THREE.InstancedMesh(treeGeom, treeMat, treeCount);
  const dummy = new THREE.Object3D();
  let placed = 0;
  let attempts = 0;
  while (placed < treeCount && attempts < 800) {
    attempts += 1;
    const x = minX - pad + rand() * (maxX - minX + pad * 2);
    const z = minZ - pad + rand() * (maxZ - minZ + pad * 2);
    if (nearTrack(x, z, 8)) continue;
    dummy.position.set(x, 1.1, z);
    dummy.rotation.y = rand() * Math.PI;
    dummy.scale.setScalar(0.7 + rand() * 1.1);
    dummy.updateMatrix();
    trees.setMatrixAt(placed, dummy.matrix);
    placed += 1;
  }
  trees.count = placed;
  trees.instanceMatrix.needsUpdate = true;
  group.add(trees);

  const boxGeom = new THREE.BoxGeometry(1, 1, 1);
  const boxMat = new THREE.MeshBasicMaterial({
    color: 0x151c16,
    transparent: true,
    opacity: 0.7,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: BRAND,
    transparent: true,
    opacity: 0.25,
  });
  for (let i = 0; i < 12; i += 1) {
    let x = 0;
    let z = 0;
    let ok = false;
    for (let n = 0; n < 40; n += 1) {
      x = minX - pad + rand() * (maxX - minX + pad * 2);
      z = minZ - pad + rand() * (maxZ - minZ + pad * 2);
      if (!nearTrack(x, z, 14)) {
        ok = true;
        break;
      }
    }
    if (!ok) continue;
    const w = 4 + rand() * 8;
    const h = 2 + rand() * 6;
    const d = 3 + rand() * 6;
    const mesh = new THREE.Mesh(boxGeom, boxMat);
    mesh.position.set(x, h / 2, z);
    mesh.scale.set(w, h, d);
    group.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeom), edgeMat);
    edges.position.copy(mesh.position);
    edges.scale.copy(mesh.scale);
    group.add(edges);
  }

  return group;
}
