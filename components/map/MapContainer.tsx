"use client";

import { useEffect, useRef, useState } from "react";
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
