"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { DeadZone, LocationRecord } from "@/lib/types";
import { demoOsmGeoJson } from "@/lib/demoOsm";

type LazyMapProps = {
  location: LocationRecord;
  deadZones: DeadZone[];
  selectedDeadZone: DeadZone;
  presentationMode?: boolean;
  onSelectDeadZone: (deadZone: DeadZone) => void;
};

const demoMapOrigin = { lat: 37.7749, lng: -122.4194 };

function MapCamera({ selectedDeadZone }: { location: LocationRecord; selectedDeadZone: DeadZone }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([selectedDeadZone.lat, selectedDeadZone.lng], 16, { duration: 0.7 });
  }, [map, selectedDeadZone]);

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
  html: '<div class="map-school-pin"><span>G</span></div>',
  iconSize: [34, 42],
  iconAnchor: [17, 36]
});

export function LazyMap({ location, deadZones, selectedDeadZone, presentationMode = false, onSelectDeadZone }: LazyMapProps) {
  const localizedGeoJson = useMemo(() => localizeGeoJson(location), [location]);

  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">Interactive local map</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Select a marker or ranking card.</p>
        </div>
        <div className="rounded-lg bg-[color-mix(in_srgb,var(--data)_14%,var(--surface))] px-3 py-2 text-sm font-bold text-[var(--data)]">
          {deadZones.length} barriers ranked
        </div>
      </div>
      <div className="map-shell">
        <MapContainer center={[location.lat, location.lng]} zoom={15} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            key={`${location.id}-${location.lat}-${location.lng}`}
            data={localizedGeoJson as GeoJSON.GeoJsonObject}
            style={(feature) => {
              const kind = feature?.properties?.kind;
              return {
                color: kind === "sidewalk_gap" ? "var(--danger)" : kind === "bike_conflict" ? "var(--warning)" : "var(--data)",
                weight: kind === "school" ? 2 : 5,
                opacity: 0.86,
                fillColor: kind === "school" ? "var(--primary)" : "var(--data)",
                fillOpacity: kind === "school" ? 0.09 : 0.08,
                dashArray: kind === "sidewalk_gap" ? "8 8" : undefined
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
            <BarrierMarker
              key={deadZone.id}
              deadZone={deadZone}
              selected={selectedDeadZone.id === deadZone.id}
              presentationMode={presentationMode}
              onSelectDeadZone={onSelectDeadZone}
            />
          ))}
          <MapCamera location={location} selectedDeadZone={selectedDeadZone} />
        </MapContainer>
        <div className="map-floating-card left-[4.75rem] top-3 max-w-[240px]">
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

function localizeGeoJson(location: LocationRecord) {
  const latOffset = location.lat - demoMapOrigin.lat;
  const lngOffset = location.lng - demoMapOrigin.lng;

  function transformCoordinate(coordinate: unknown): unknown {
    if (
      Array.isArray(coordinate) &&
      coordinate.length >= 2 &&
      typeof coordinate[0] === "number" &&
      typeof coordinate[1] === "number"
    ) {
      return [Number((coordinate[0] + lngOffset).toFixed(6)), Number((coordinate[1] + latOffset).toFixed(6))];
    }

    if (Array.isArray(coordinate)) {
      return coordinate.map(transformCoordinate);
    }

    return coordinate;
  }

  return {
    ...demoOsmGeoJson,
    features: demoOsmGeoJson.features.map((feature) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: transformCoordinate(feature.geometry.coordinates)
      }
    }))
  };
}

function markerLetter(deadZone: DeadZone) {
  if (deadZone.category.toLowerCase().includes("bike")) return "B";
  if (deadZone.category.toLowerCase().includes("walking")) return "W";
  if (deadZone.category.toLowerCase().includes("transit")) return "T";
  if (deadZone.category.toLowerCase().includes("waste")) return "C";
  if (deadZone.category.toLowerCase().includes("air")) return "I";
  return "R";
}

function barrierIcon(deadZone: DeadZone, selected: boolean) {
  const color = markerColor(deadZone);

  return L.divIcon({
    className: "greenlight-barrier-marker",
    html: `<button class="map-barrier-pin ${selected ? "is-selected" : ""}" style="--pin-color:${color}" aria-label="${deadZone.name}"><span class="map-barrier-letter">${markerLetter(deadZone)}</span><span class="map-barrier-score">${deadZone.score}</span></button>`,
    iconSize: selected ? [48, 56] : [42, 50],
    iconAnchor: selected ? [24, 48] : [21, 42]
  });
}

function BarrierMarker({
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
      {selected ? (
        <CircleMarker
          center={[deadZone.lat, deadZone.lng]}
          radius={presentationMode ? 32 : 25}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.1,
            opacity: 0.5,
            weight: 2,
            className: presentationMode ? "greenlight-map-pulse" : undefined
          }}
          interactive={false}
        />
      ) : null}
      <CircleMarker
        center={[deadZone.lat, deadZone.lng]}
        radius={selected ? 10 : 7}
        pathOptions={{
          color,
          fillColor: "var(--surface)",
          fillOpacity: 0.7,
          opacity: 0.7,
          weight: 2
        }}
        interactive={false}
      />
      <Marker
        position={[deadZone.lat, deadZone.lng]}
        icon={barrierIcon(deadZone, selected)}
        eventHandlers={{
          click: () => onSelectDeadZone(deadZone)
        }}
      >
        <Tooltip direction="top" offset={[0, -36]} opacity={0.96}>
          {deadZone.name}
        </Tooltip>
        <Popup>
          <strong>{deadZone.name}</strong>
          <br />
          Score {deadZone.score} / {deadZone.severity}
        </Popup>
      </Marker>
    </>
  );
}
