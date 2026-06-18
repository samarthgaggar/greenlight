"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import type { LocationRecord } from "@/lib/types";

type LocationSearchProps = {
  locations: LocationRecord[];
  selectedLocation: LocationRecord;
  onSelectLocation: (location: LocationRecord) => void;
  onCustomLocation: (location: LocationRecord) => void;
};

type LocationSuggestion = LocationRecord & {
  category: string;
  matchText: string;
};

const indexedPlaces: LocationSuggestion[] = [
  {
    id: "lincoln-high",
    name: "Lincoln High School",
    address: "2162 24th Avenue, San Francisco, CA",
    lat: 37.7475,
    lng: -122.4812,
    type: "school",
    category: "High school",
    description: "Public high school result with school commute and bike-access context.",
    matchText: "lincoln high school san francisco sunset 24th avenue school"
  },
  {
    id: "mission-high",
    name: "Mission High School",
    address: "3750 18th Street, San Francisco, CA",
    lat: 37.7613,
    lng: -122.4275,
    type: "school",
    category: "High school",
    description: "Urban school result useful for walking, transit, and idling barrier analysis.",
    matchText: "mission high school 18th street san francisco school transit"
  },
  {
    id: "washington-high",
    name: "George Washington High School",
    address: "600 32nd Avenue, San Francisco, CA",
    lat: 37.7771,
    lng: -122.4914,
    type: "school",
    category: "High school",
    description: "Campus result with bike approach, curb access, and crossing context.",
    matchText: "george washington high school 32nd avenue richmond district school"
  },
  {
    id: "civic-center",
    name: "Civic Center Plaza",
    address: "335 McAllister Street, San Francisco, CA",
    lat: 37.7793,
    lng: -122.4184,
    type: "civic",
    category: "Civic place",
    description: "Civic destination result for transit, walking, refill, and public-space access analysis.",
    matchText: "civic center plaza city hall mcallister street san francisco"
  },
  {
    id: "dolores-park",
    name: "Mission Dolores Park",
    address: "Dolores Street & 19th Street, San Francisco, CA",
    lat: 37.7596,
    lng: -122.4269,
    type: "park",
    category: "Park",
    description: "Public park result with waste, refill, and access visibility context.",
    matchText: "mission dolores park 19th street san francisco park"
  }
];

export function LocationSearch({ locations, selectedLocation, onSelectLocation, onCustomLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    const demoSuggestions: LocationSuggestion[] = locations.map((location) => ({
      ...location,
      category: location.type === "school" ? "School" : location.type === "community" ? "Community place" : "Neighborhood",
      matchText: `${location.name} ${location.address} ${location.type} ${location.description}`.toLowerCase()
    }));
    const allPlaces = [...demoSuggestions, ...indexedPlaces];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allPlaces.slice(0, 6);
    }

    const queryTerms = normalizedQuery.split(/\s+/);
    const ranked = allPlaces
      .map((place) => {
        const haystack = `${place.matchText} ${place.name.toLowerCase()} ${place.address.toLowerCase()}`;
        const score = queryTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
        const startsWithBoost = place.name.toLowerCase().startsWith(normalizedQuery) ? 2 : 0;
        return { place, score: score + startsWithBoost };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.place);

    if (ranked.length > 0) {
      return ranked.slice(0, 7);
    }

    return [
      {
        id: `custom-${normalizedQuery.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "location"}`,
        name: query.trim(),
        address: "User-entered location",
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        type: "custom",
        category: "Custom place",
        description: "Use this typed place with Greenlight local barrier analysis.",
        matchText: normalizedQuery
      }
    ];
  }, [locations, query, selectedLocation.lat, selectedLocation.lng]);

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
  }

  return (
    <div className="soft-panel rounded-xl p-5">
      <h2 className="font-heading text-2xl font-bold">Location search</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Type a place and choose the correct result by name and address.
      </p>

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
          placeholder="Search schools, parks, streets, or neighborhoods"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="location-results"
        />

        {open ? (
          <div
            id="location-results"
            className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
          >
            {suggestions.map((location, index) => {
              const active = activeIndex === index;

              return (
                <button
                  key={location.id}
                  type="button"
                  className={`flex w-full items-start gap-3 border-b border-[var(--border)] p-3 text-left last:border-b-0 ${
                    active ? "bg-[color-mix(in_srgb,var(--data)_12%,var(--surface))]" : "bg-[var(--surface)] hover:bg-[var(--surface-elevated)]"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(location)}
                >
                  <span>
                    <span className="block text-sm font-bold text-[var(--text-primary)]">{location.name}</span>
                    <span className="mt-0.5 block text-sm text-[var(--text-secondary)]">{location.address}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{location.category}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <div>
          <p className="font-bold text-[var(--text-primary)]">{selectedLocation.name}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">{selectedLocation.address}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{selectedLocation.description}</p>
        </div>
      </div>
    </div>
  );
}
