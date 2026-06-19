export const MAP_STYLES = {
  voyager: {
    label: "Colorful",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    icon: "🗺️",
  },
  positron: {
    label: "Light",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    icon: "☀️",
  },
  dark: {
    label: "Dark",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    icon: "🌙",
  },
  satellite: {
    label: "Satellite",
    url: "https://basemaps.cartocdn.com/gl/imagery-gl-style/style.json",
    icon: "🛰️",
  },
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
