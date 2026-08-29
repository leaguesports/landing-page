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
        className="h-full w-full bg-[#141814]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{
            color: "#0c0f0c",
            fillColor: "#3dff8a",
            fillOpacity: 0.95,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
}
