"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES } from "@/lib/constants";

interface MapContainerProps {
  onMapClick?: (lng: number, lat: number) => void;
  pins?: Array<{
    id: string;
    lng: number;
    lat: number;
    type: string;
    name: string;
  }>;
  onPinClick?: (pinId: string) => void;
  flyTo?: { lng: number; lat: number; zoom?: number } | null;
}

const styleKeys = Object.keys(MAP_STYLES) as (keyof typeof MAP_STYLES)[];

export function MapContainer({
  onMapClick,
  pins = [],
  onPinClick,
  flyTo,
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>("voyager");
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.voyager.url,
      center: [0, 20],
      zoom: 2,
      attributionControl: {},
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ maxWidth: 200 }), "bottom-left");

    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Fly to location when flyTo changes
  useEffect(() => {
    if (flyTo && map.current) {
      map.current.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: flyTo.zoom ?? 12,
        duration: 2000,
      });
    }
  }, [flyTo]);

  // Switch map style
  const switchStyle = (styleKey: keyof typeof MAP_STYLES) => {
    if (!map.current) return;
    map.current.setStyle(MAP_STYLES[styleKey].url);
    setCurrentStyle(styleKey);
  };

  // Add heatmap layer
  const addHeatmapLayer = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    if (pins.length === 0) return;

    const sourceId = "places-source";
    const layerId = "places-heatmap";

    // Remove existing source/layer if any
    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: pins.map((p) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [p.lng, p.lat] },
          properties: { type: p.type },
        })),
      },
    });

    map.current.addLayer({
      id: layerId,
      type: "heatmap",
      source: sourceId,
      maxzoom: 15,
      paint: {
        "heatmap-weight": 1,
        "heatmap-intensity": 0.8,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 255, 0, 0)",
          0.3,
          "rgba(34, 197, 94, 0.4)",
          0.6,
          "rgba(34, 197, 94, 0.7)",
          1,
          "rgba(34, 197, 94, 1)",
        ],
        "heatmap-radius": 30,
        "heatmap-opacity": 0.7,
      },
    });
  }, [pins]);

  // Remove heatmap layer
  const removeHeatmapLayer = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const sourceId = "places-source";
    const layerId = "places-heatmap";

    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
  }, []);

  // Toggle heatmap
  useEffect(() => {
    if (showHeatmap) {
      addHeatmapLayer();
    } else {
      removeHeatmapLayer();
    }
  }, [showHeatmap, addHeatmapLayer, removeHeatmapLayer]);

  // Re-add heatmap when style changes and heatmap is enabled
  useEffect(() => {
    if (showHeatmap && map.current) {
      const onStyleLoad = () => addHeatmapLayer();
      if (map.current.isStyleLoaded()) {
        addHeatmapLayer();
      } else {
        map.current.on("load", onStyleLoad);
      }
    }
  }, [currentStyle, showHeatmap, addHeatmapLayer]);

  // Quick action: My Location
  const handleMyLocation = () => {
    if (!map.current) return;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 12,
          duration: 2000,
        });
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  // Quick action: Zoom to fit all pins
  const handleZoomToFit = () => {
    if (!map.current || pins.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    pins.forEach((pin) => {
      bounds.extend([pin.lng, pin.lat]);
    });

    if (pins.length === 1) {
      map.current.flyTo({
        center: [pins[0].lng, pins[0].lat],
        zoom: 12,
        duration: 2000,
      });
    } else {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 2000,
      });
    }
  };

  // Update markers when pins change
  useEffect(() => {
    if (!map.current) return;

    const onStyleLoad = () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();

      pins.forEach((pin) => {
        const el = document.createElement("div");
        el.className = "cursor-pointer";
        el.style.cssText = `
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: ${getPinColor(pin.type)};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        `;
        el.textContent = getPinEmoji(pin.type);
        el.title = pin.name;

        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.3)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map.current!);

        // Add popup with place name
        const popup = new maplibregl.Popup({
          offset: 20,
          closeButton: false,
          className: "place-popup",
        }).setText(pin.name);

        marker.setPopup(popup);

        if (onPinClick) {
          marker.getElement().addEventListener("click", () => onPinClick(pin.id));
        }

        markers.current.set(pin.id, marker);
      });
    };

    if (map.current.isStyleLoaded()) {
      onStyleLoad();
    } else {
      map.current.on("load", onStyleLoad);
    }
  }, [pins, onPinClick, currentStyle]);

  return (
    <div className="relative h-full w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Style Selector */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800">
        {styleKeys.map((key) => (
          <button
            key={key}
            onClick={() => switchStyle(key)}
            title={MAP_STYLES[key].label}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              currentStyle === key
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <span>{MAP_STYLES[key].icon}</span>
            <span className="hidden sm:inline">{MAP_STYLES[key].label}</span>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800">
        <button
          onClick={handleMyLocation}
          title="My Location"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <span>📍</span>
          <span className="hidden sm:inline">My Location</span>
        </button>
        {pins.length > 0 && (
          <button
            onClick={handleZoomToFit}
            title="Zoom to fit all pins"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">Fit All</span>
          </button>
        )}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          title={showHeatmap ? "Hide heatmap" : "Show heatmap"}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
            showHeatmap
              ? "bg-emerald-600 text-white"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <span>🌡️</span>
          <span className="hidden sm:inline">Heatmap</span>
        </button>
      </div>

      {/* Custom CSS for popups */}
      <style jsx global>{`
        .place-popup .maplibregl-popup-content {
          background: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          color: #333;
        }
        .dark .place-popup .maplibregl-popup-content {
          background: #1a1a1a;
          color: #ededed;
        }
        .place-popup .maplibregl-popup-tip {
          border-top-color: white;
        }
        .dark .place-popup .maplibregl-popup-tip {
          border-top-color: #1a1a1a;
        }
      `}</style>
    </div>
  );
}

function getPinColor(type: string): string {
  const colors: Record<string, string> = {
    visited: "#22c55e",
    "want-to-visit": "#eab308",
    lived: "#3b82f6",
    current: "#ef4444",
  };
  return colors[type] || "#6b7280";
}

function getPinEmoji(type: string): string {
  const emojis: Record<string, string> = {
    visited: "✓",
    "want-to-visit": "★",
    lived: "♡",
    current: "●",
  };
  return emojis[type] || "📍";
}
