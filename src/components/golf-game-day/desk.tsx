import type { ReactNode } from "react";

const PATHS: Record<string, string> = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  bubble: '<path d="M12 4c4.8 0 8.5 3.2 8.5 7.2S16.8 18.4 12 18.4c-1 0-2-.1-2.9-.4L4.5 20l1.3-3.6C4.3 15 3.5 13.2 3.5 11.2 3.5 7.2 7.2 4 12 4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  flag: '<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  chevd: '<path d="M6 9l6 6 6-6"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 20h8"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7"/>',
  key: '<circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M17 5l2 2M15 7l2 2"/>',
};

export function GdIcon({
  name,
  size = 20,
  color = "currentColor",
}: {
  name: keyof typeof PATHS | string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none" }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? "" }}
    />
  );
}

export function Crumbs({ items }: { items: string[] }) {
  return (
    <div className="crumbs">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} style={{ display: "contents" }}>
          {index === items.length - 1 ? <b>{item}</b> : <span>{item}</span>}
          {index < items.length - 1 ? <span>/</span> : null}
        </span>
      ))}
    </div>
  );
}

export function SampleNote({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <div className="ex" style={{ padding: "0 0 32px" }}>
      Example data: names, scores, tees, pars and stroke index are placeholders, not verified Zebula course data.
    </div>
  );
}

export function DeskFrame({
  crumbs,
  eyebrow,
  title,
  right,
  sample,
  children,
  watch,
}: {
  crumbs: string[];
  eyebrow: string;
  title: string;
  right?: ReactNode;
  sample?: boolean;
  children: ReactNode;
  watch?: string;
}) {
  return (
    <div className="gd-desk">
      {watch ? (
        <div className="watchbar">
          <div className="wrap">
            <GdIcon name="eye" size={20} /> {watch}
          </div>
        </div>
      ) : null}
      <div className="wrap">
        <Crumbs items={crumbs} />
        <div className="ph">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
          </div>
          {right ? <div className="ph-right">{right}</div> : null}
        </div>
        {children}
        <SampleNote show={sample} />
      </div>
    </div>
  );
}

/** Placeholder QR matching the approved mockup pattern. */
export function ExampleQr() {
  const n = 25;
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const cells: string[] = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const inF = (X: number, Y: number) => x >= X && x < X + 7 && y >= Y && y < Y + 7;
      const F = [
        [0, 0],
        [n - 7, 0],
        [0, n - 7],
      ].find(([X, Y]) => inF(X, Y));
      let on = false;
      if (F) {
        const dx = x - F[0];
        const dy = y - F[1];
        on = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      } else if (
        [
          [0, 0],
          [n - 7, 0],
          [0, n - 7],
        ].some(([X, Y]) => x >= X - 1 && x <= X + 7 && y >= Y - 1 && y <= Y + 7)
      ) {
        on = false;
      } else on = next() < 0.48;
      if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  }
  return (
    <svg
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      width="100%"
      style={{ display: "block", background: "#fff" }}
      shapeRendering="crispEdges"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: `<g fill="#0b0b0b">${cells.join("")}</g>` }}
    />
  );
}

export function desktopDateLong(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00+02:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const month = pick("month").replace(/\.$/, "");
  return `${pick("weekday")}, ${pick("day")} ${month} ${pick("year")}`;
}

export function relationWord(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -3) return "Albatross";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  if (diff === 3) return "Triple";
  return diff > 0 ? `+${diff}` : String(diff);
}

const TEE_COLORS: Record<string, string> = {
  white: "#fff",
  yellow: "#facc15",
  red: "#ef4444",
  blue: "#2563eb",
  black: "#09090b",
};

export function teeFill(name: string): string {
  return TEE_COLORS[name.trim().toLowerCase()] ?? "#a1a1aa";
}
