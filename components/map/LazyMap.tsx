"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { DeadZone, LocationRecord } from "@/lib/types";
import { demoOsmGeoJson } from "@/lib/demoOsm";

type LazyMapProps = {
  location: LocationRecord;
  deadZones: DeadZone[];
  selectedDeadZone: DeadZone;
  presentationMode?: boolean;
  onSelectDeadZone: (deadZone: DeadZone) => void;
};

function MapCamera({ location, selectedDeadZone }: { location: LocationRecord; selectedDeadZone: DeadZone }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([selectedDeadZone.lat, selectedDeadZone.lng], 15, { duration: 0.7 });
  }, [map, selectedDeadZone]);

  useEffect(() => {
    map.setView([location.lat, location.lng], 14);
  }, [location, map]);

  return null;
}

function markerColor(deadZone: DeadZone) {
  if (deadZone.severity === "High") {
    return "var(--danger)";
  }

  if (deadZone.severity === "Medium") {
    return "var(--warning)";
  }

  return "var(--primary)";
}

const schoolIcon = L.divIcon({
  className: "greenlight-school-marker",
  html: '<div style="width:28px;height:28px;border-radius:8px;background:var(--primary);border:3px solid var(--surface);box-shadow:0 12px 28px rgba(0,0,0,.22)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export function LazyMap({ location, deadZones, selectedDeadZone, presentationMode = false, onSelectDeadZone }: LazyMapProps) {
  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Interactive local map</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Uses OpenStreetMap tiles when available, with local map layers and Greenlight barrier analysis.
          </p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--data)_14%,var(--surface))] px-3 py-2 text-sm font-bold text-[var(--data)]">
          {deadZones.length} barriers ranked
        </div>
      </div>
      <div className="map-shell">
        <MapContainer center={[location.lat, location.lng]} zoom={14} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={demoOsmGeoJson as GeoJSON.GeoJsonObject}
            style={(feature) => {
              const kind = feature?.properties?.kind;
              return {
                color: kind === "sidewalk_gap" ? "var(--danger)" : kind === "bike_conflict" ? "var(--warning)" : "var(--data)",
                weight: 5,
                opacity: 0.82,
                fillOpacity: 0.08
              };
            }}
            pointToLayer={(_, latlng) =>
              L.circleMarker(latlng, {
                radius: 8,
                color: "var(--data)",
                weight: 3,
                fillColor: "var(--surface)",
                fillOpacity: 1
              })
            }
          />
          <Marker position={[location.lat, location.lng]} icon={schoolIcon}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {location.address}
            </Popup>
          </Marker>
          {deadZones.map((deadZone) => (
            <CircleMarkerWithPulse
              key={deadZone.id}
              deadZone={deadZone}
              selected={selectedDeadZone.id === deadZone.id}
              presentationMode={presentationMode}
              onSelectDeadZone={onSelectDeadZone}
            />
          ))}
          <MapCamera location={location} selectedDeadZone={selectedDeadZone} />
        </MapContainer>
        <div className="map-floating-card left-[4.75rem] top-4 max-w-[270px]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Selected barrier</p>
          <p className="mt-1 font-heading text-base font-bold text-[var(--text-primary)]">{selectedDeadZone.name}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
            {selectedDeadZone.category} · confidence {Math.round(selectedDeadZone.confidence * 100)}%
          </p>
        </div>
        <div className="map-floating-card bottom-4 left-4 flex flex-wrap items-center gap-3">
          <LegendDot color="var(--danger)" label="High" />
          <LegendDot color="var(--warning)" label="Medium" />
          <LegendDot color="var(--primary)" label="Low" />
        </div>
        <div className="map-floating-card bottom-4 right-4 hidden text-xs font-bold text-[var(--text-secondary)] sm:block">
          Click markers or ranking cards
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function CircleMarkerWithPulse({
  deadZone,
  selected,
  presentationMode,
  onSelectDeadZone
}: {
  deadZone: DeadZone;
  selected: boolean;
  presentationMode: boolean;
  onSelectDeadZone: (deadZone: DeadZone) => void;
}) {
  const color = markerColor(deadZone);

  return (
    <>
      {selected && presentationMode ? (
        <CircleMarker
          center={[deadZone.lat, deadZone.lng]}
          radius={26}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.12,
            opacity: 0.44,
            weight: 2,
            className: "greenlight-map-pulse"
          }}
          interactive={false}
        />
      ) : null}
      <CircleMarker
        center={[deadZone.lat, deadZone.lng]}
        radius={selected ? 18 : 12}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: selected ? 0.65 : 0.42,
          weight: selected ? 4 : 2
        }}
        eventHandlers={{
          click: () => onSelectDeadZone(deadZone)
        }}
      >
        <Popup>
          <strong>{deadZone.name}</strong>
          <br />
          Score {deadZone.score} / {deadZone.severity}
        </Popup>
      </CircleMarker>
    </>
  );
}
