import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { worldVec } from "@/lib/openf1/coords";
import { sampleAt, type DriverTracks } from "@/lib/openf1/location-buffer";
import { HEADING_LOOKAHEAD_MS } from "@/lib/openf1/replay";
import type { ReplayCircuit, ReplayDriver } from "@/lib/openf1/replay";
import { buildGridFloor, buildNeonTrack, buildScenery, TRACK_DECK_Y } from "./track/buildNeonTrack";

const SURFACE = 0x0c0f0c;
const BRAND = 0x3dff8a;

type CarVisual = {
  driverNumber: number;
  group: THREE.Group;
};

export type ReplayEngine = {
  setPlaying: (playing: boolean) => void;
  setFollow: (driverNumber: number | null) => void;
  resize: () => void;
  dispose: () => void;
};

export function createReplayEngine(input: {
  canvas: HTMLCanvasElement;
  circuit: ReplayCircuit;
  drivers: ReplayDriver[];
  getPlayhead: () => number;
  getTracks: () => DriverTracks;
  getFollow: () => number | null;
  getPlaying: () => boolean;
}): ReplayEngine {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SURFACE);
  scene.fog = new THREE.Fog(SURFACE, 160, 720);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.4, 1400);
  const renderer = new THREE.WebGLRenderer({
    canvas: input.canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(SURFACE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const controls = new OrbitControls(camera, input.canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 10;
  controls.maxDistance = 360;
  controls.autoRotateSpeed = 0.45;

  scene.add(new THREE.AmbientLight(0xb8c4b8, 0.55));
  const sun = new THREE.DirectionalLight(0xe8ffe8, 0.45);
  sun.position.set(40, 80, 20);
  scene.add(sun);

  const { group: track, points } = buildNeonTrack(input.circuit);
  const root = new THREE.Group();
  root.add(track);
  root.add(buildScenery(points, input.circuit.circuitKey));
  scene.add(root);

  const box = new THREE.Box3().setFromObject(track);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.z, 40);
  root.add(buildGridFloor(span));

  const brandLight = new THREE.PointLight(BRAND, 12, span * 1.4, 1.6);
  brandLight.position.set(center.x, 18, center.z);
  root.add(brandLight);

  camera.position.set(center.x + span * 0.22, Math.max(48, span * 0.32), center.z + span * 0.34);
  controls.target.copy(center);
  controls.target.y = TRACK_DECK_Y;
  controls.update();

  const cars: CarVisual[] = [];
  const bodyH = 0.42;
  const cabinH = 0.32;
  const wingH = 0.14;
  const bodyGeom = new THREE.BoxGeometry(1.55, bodyH, 3.6);
  const cabinGeom = new THREE.BoxGeometry(1.05, cabinH, 1.2);
  const wingGeom = new THREE.BoxGeometry(2.15, wingH, 0.28);
  const glowGeom = new THREE.CircleGeometry(2.2, 18);
  const haloGeom = new THREE.RingGeometry(1.2, 1.55, 20);
  for (const driver of input.drivers) {
    const group = new THREE.Group();
    group.renderOrder = 8;
    const color = new THREE.Color(driver.teamColour);
    const bodyMat = new THREE.MeshBasicMaterial({ color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = bodyH / 2;
    const cabin = new THREE.Mesh(cabinGeom, bodyMat);
    cabin.position.set(0, bodyH + cabinH / 2, -0.15);
    const wing = new THREE.Mesh(wingGeom, bodyMat);
    wing.position.set(0, bodyH + cabinH - wingH / 2, -1.7);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeom), edgeMat);
    wire.position.copy(body.position);
    const glow = new THREE.Mesh(
      glowGeom,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.03;
    glow.renderOrder = 7;
    const halo = new THREE.Mesh(
      haloGeom,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.04;
    halo.renderOrder = 7;
    group.add(glow, halo, body, cabin, wing, wire);
    group.visible = false;
    root.add(group);
    cars.push({ driverNumber: driver.driverNumber, group });
  }

  const scratchPos = new THREE.Vector3();
  const scratchAhead = new THREE.Vector3();
  const scratchCam = new THREE.Vector3();
  const mapped = { x: 0, y: 0, z: 0 };

  let playing = false;
  let follow: number | null = null;
  let raf = 0;
  let disposed = false;

  function resize() {
    const parent = input.canvas.parentElement;
    const width = parent?.clientWidth || input.canvas.clientWidth || 640;
    const height = parent?.clientHeight || input.canvas.clientHeight || 420;
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function poseToWorld(
    x: number,
    y: number,
    _z: number,
    into: THREE.Vector3,
  ): THREE.Vector3 {
    // The neon ribbon is 2D (circuit outline has no z). OpenF1 GPS z is
    // circuit-local (~1900 at Monza, ~4100 at Spa) so applying it lifts cars
    // off the deck. Keep XZ from telemetry and sit on the ribbon.
    worldVec(x, y, 0, mapped);
    into.set(mapped.x, TRACK_DECK_Y, mapped.z);
    return into;
  }

  function tick() {
    if (disposed) return;
    const t = input.getPlayhead();
    const tracks = input.getTracks();
    follow = input.getFollow();
    playing = input.getPlaying();
    controls.autoRotate = !playing && follow === null;

    let followCar: THREE.Group | null = null;
    for (const car of cars) {
      const pose = sampleAt(tracks.get(car.driverNumber), t);
      if (!pose) {
        car.group.visible = false;
        continue;
      }
      car.group.visible = true;
      poseToWorld(pose.x, pose.y, pose.z, scratchPos);
      car.group.position.copy(scratchPos);
      const ahead = sampleAt(
        tracks.get(car.driverNumber),
        t + HEADING_LOOKAHEAD_MS,
      );
      if (ahead) {
        poseToWorld(ahead.x, ahead.y, ahead.z, scratchAhead);
        scratchAhead.y = scratchPos.y;
        if (scratchAhead.distanceToSquared(scratchPos) > 0.01) {
          car.group.lookAt(scratchAhead);
        }
      }
      if (follow === car.driverNumber) followCar = car.group;
    }

    if (followCar) {
      const backward = new THREE.Vector3(0, 0, 1)
        .applyQuaternion(followCar.quaternion)
        .multiplyScalar(18);
      scratchCam.copy(followCar.position).add(backward);
      scratchCam.y += 10;
      camera.position.lerp(scratchCam, 0.08);
      controls.target.lerp(followCar.position, 0.12);
    }

    controls.update();
    renderer.render(scene, camera);
    raf = window.requestAnimationFrame(tick);
  }

  const observer = new ResizeObserver(() => resize());
  if (input.canvas.parentElement) observer.observe(input.canvas.parentElement);
  resize();
  raf = window.requestAnimationFrame(tick);

  return {
    setPlaying(next) {
      playing = next;
    },
    setFollow(next) {
      follow = next;
      controls.enableRotate = next === null;
    },
    resize,
    dispose() {
      disposed = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj: THREE.Object3D) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          for (const item of material) item.dispose();
        } else if (material) {
          material.dispose();
        }
      });
    },
  };
}
