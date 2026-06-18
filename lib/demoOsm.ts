export const demoOsmGeoJson = {
  type: "FeatureCollection",
  name: "Greenlight Local OSM Layer",
  features: [
    {
      type: "Feature",
      properties: {
        kind: "bike_conflict",
        name: "Bike approach conflict",
        source: "Synthetic OSM-style local data"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.4218, 37.7759],
          [-122.4206, 37.7751]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        kind: "sidewalk_gap",
        name: "Missing sidewalk segment",
        source: "Synthetic OSM-style local data"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.4185, 37.7741],
          [-122.4171, 37.7735]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        kind: "transit_stop",
        name: "Frequent route stop",
        source: "Synthetic OSM-style local data"
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4152, 37.7785]
      }
    },
    {
      type: "Feature",
      properties: {
        kind: "school",
        name: "Greenlight High School",
        source: "Synthetic OSM-style local data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.4204, 37.7753],
            [-122.4186, 37.7753],
            [-122.4186, 37.7738],
            [-122.4204, 37.7738],
            [-122.4204, 37.7753]
          ]
        ]
      }
    }
  ]
} as const;
