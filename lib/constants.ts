export const MAP_STYLES = {
  streets: "https://demotiles.maplibre.org/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

export const PIN_COLORS = {
  visited: "#22c55e",
  "want-to-visit": "#eab308",
  lived: "#3b82f6",
  current: "#ef4444",
} as const;

export const DEFAULT_CENTER = {
  lat: 20,
  lng: 0,
};

export const DEFAULT_ZOOM = 2;
