"use client";

import dynamic from "next/dynamic";
import type { DeadZone, LocationRecord } from "@/lib/types";

const LazyMap = dynamic(() => import("@/components/map/LazyMap").then((mod) => mod.LazyMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-sm font-bold text-[var(--text-secondary)]">
      Loading local map...
    </div>
  )
});

type MapViewProps = {
  location: LocationRecord;
  deadZones: DeadZone[];
  selectedDeadZone: DeadZone;
  presentationMode?: boolean;
  onSelectDeadZone: (deadZone: DeadZone) => void;
};

export function MapView(props: MapViewProps) {
  return <LazyMap {...props} />;
}
