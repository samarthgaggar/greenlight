"use client";

import { KeyboardEvent, useDeferredValue, useMemo, useState } from "react";
import bayAreaHighSchools from "@/data/bay-area-high-schools.json";
import { buildLocationIndex, rankLocationSuggestions } from "@/lib/locationSearch";
import type { LocationRecord } from "@/lib/types";

type LocationSearchProps = {
  locations: LocationRecord[];
  selectedLocation: LocationRecord;
  onSelectLocation: (location: LocationRecord) => void;
  onCustomLocation: (location: LocationRecord) => void;
};

export function LocationSearch({ locations, selectedLocation, onSelectLocation, onCustomLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const locationIndex = useMemo(
    () =>
      buildLocationIndex([
        ...locations,
        ...((bayAreaHighSchools as LocationRecord[]).filter((school) => school.name !== "Greenlight High School"))
      ]),
    [locations]
  );

  const suggestions = useMemo<LocationRecord[]>(() => {
    const ranked = rankLocationSuggestions(locationIndex, deferredQuery, 8);

    if (ranked.length > 0) {
      return ranked;
    }

    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return [
      {
        id: `custom-${normalizedQuery.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "location"}`,
        name: deferredQuery.trim(),
        address: "User-entered location",
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        type: "custom",
        category: "Custom place",
        description: "Use this typed place with Greenlight local barrier analysis."
      }
    ];
  }, [deferredQuery, locationIndex, selectedLocation.lat, selectedLocation.lng]);

  function selectSuggestion(location: LocationRecord) {
    if (location.type === "custom") {
      onCustomLocation(location);
    } else {
      onSelectLocation(location);
    }

    setQuery(location.name);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const activeSuggestion = suggestions[activeIndex] ?? suggestions[0];
      if (activeSuggestion) {
        selectSuggestion(activeSuggestion);
      }
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="soft-panel rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">Location search</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Search Bay Area high schools and choose the exact campus by address.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
          {locationIndex.length} indexed places
        </span>
      </div>

      <label className="mt-5 block text-sm font-bold text-[var(--text-primary)]" htmlFor="location-search">
        Search for a location
      </label>
      <div className="relative mt-2">
        <input
          id="location-search"
          className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--data)]"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by school, city, district, address, or ZIP"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="location-results"
          aria-haspopup="listbox"
          aria-activedescendant={open && suggestions[activeIndex] ? `location-option-${activeIndex}` : undefined}
        />

        {open ? (
          <div
            id="location-results"
            role="listbox"
            aria-label="Location suggestions"
            className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 max-h-[26rem] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
          >
            {suggestions.map((location, index) => {
              const active = activeIndex === index;

              return (
                <button
                  key={location.id}
                  id={`location-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-start justify-between gap-3 border-b border-[var(--border)] p-3 text-left last:border-b-0 ${
                    active ? "bg-[var(--data-soft)]" : "bg-[var(--surface)] hover:bg-[var(--surface-elevated)]"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(location)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[var(--text-primary)]">{location.name}</span>
                    <span className="mt-0.5 block text-sm text-[var(--text-secondary)]">{location.address}</span>
                    <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      <span>{location.category ?? "Location"}</span>
                      {location.district ? <span>{location.district}</span> : null}
                      {typeof location.distanceFromSf === "number" ? <span>{location.distanceFromSf} mi from SF</span> : null}
                    </span>
                  </span>
                  {location.priorityArea ? (
                    <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--primary)_55%,var(--border))] px-2 py-1 text-xs font-bold text-[var(--primary)]">
                      Tri-Valley
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <p className="font-bold text-[var(--text-primary)]">{selectedLocation.name}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">{selectedLocation.address}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{selectedLocation.description}</p>
        {selectedLocation.district || selectedLocation.enrollment ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {[selectedLocation.district, selectedLocation.enrollment ? `${selectedLocation.enrollment.toLocaleString()} students` : null]
              .filter(Boolean)
              .join(" / ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
