"use client";

import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type VenueMapCanvasProps = {
  lat: number;
  lng: number;
  name: string;
};

export function VenueMapCanvas({ lat, lng, name }: VenueMapCanvasProps) {
  return (
    <div
      className="relative z-0 h-56 overflow-hidden rounded-2xl sm:h-64"
      role="img"
      aria-label={`Map showing ${name}`}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full bg-zinc-100"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{
            color: "#18181b",
            fillColor: "#16a34a",
            fillOpacity: 0.95,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
}
