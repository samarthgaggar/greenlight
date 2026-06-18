import type { LocationRecord } from "@/lib/types";

export type IndexedLocation = LocationRecord & {
  category: string;
  searchText: string;
  tokens: string[];
};

const priorityZips = new Set(["94568", "94566"]);

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueTokens(value: string) {
  return Array.from(new Set(normalize(value).split(/\s+/).filter(Boolean)));
}

export function buildLocationIndex(locations: LocationRecord[]) {
  const seen = new Set<string>();

  return locations
    .filter((location) => {
      const key = `${location.name}-${location.address}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((location): IndexedLocation => {
      const category =
        location.category ??
        (location.type === "school" ? "High school" : location.type === "community" ? "Community place" : "Neighborhood");
      const searchText = normalize(
        [
          location.name,
          location.address,
          location.description,
          location.district,
          location.county,
          location.zip,
          category,
          location.type
        ]
          .filter(Boolean)
          .join(" ")
      );

      return {
        ...location,
        category,
        searchText,
        tokens: uniqueTokens(searchText)
      };
    });
}

export function rankLocationSuggestions(index: IndexedLocation[], query: string, limit = 8) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [...index]
      .sort((a, b) => Number(Boolean(b.priorityArea)) - Number(Boolean(a.priorityArea)) || (a.distanceFromSf ?? 999) - (b.distanceFromSf ?? 999))
      .slice(0, limit);
  }

  const terms = uniqueTokens(normalizedQuery);

  return index
    .map((location) => {
      const name = normalize(location.name);
      const address = normalize(location.address);
      const cityZip = normalize(`${location.address} ${location.zip ?? ""}`);
      const zipPrefix = location.zip?.slice(0, 5) ?? "";
      let score = 0;

      if (name === normalizedQuery) score += 80;
      if (name.startsWith(normalizedQuery)) score += 48;
      if (name.includes(normalizedQuery)) score += 28;
      if (address.includes(normalizedQuery)) score += 18;
      if (cityZip.includes(normalizedQuery)) score += 18;
      if (zipPrefix === normalizedQuery) score += 60;
      if (priorityZips.has(zipPrefix)) score += 10;
      if (location.priorityArea) score += 8;

      for (const term of terms) {
        if (term.length <= 1) continue;
        if (name.split(" ").some((token) => token.startsWith(term))) score += 14;
        if (address.split(" ").some((token) => token.startsWith(term))) score += 8;
        if (location.tokens.includes(term)) score += 7;
        if (location.tokens.some((token) => token.startsWith(term))) score += 4;
      }

      const distance = location.distanceFromSf ?? 100;
      score += Math.max(0, 8 - distance / 14);

      return { location, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || (a.location.distanceFromSf ?? 999) - (b.location.distanceFromSf ?? 999))
    .slice(0, limit)
    .map((result) => result.location);
}
