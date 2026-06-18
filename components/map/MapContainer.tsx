"use client";

import { useEffect, useRef } from "react";
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
}

export function MapContainer({
  onMapClick,
  pins = [],
  onPinClick,
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.streets,
      center: [0, 20],
      zoom: 2,
      attributionControl: {},
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers when pins change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    // Add new markers
    pins.forEach((pin) => {
      const el = document.createElement("div");
      el.className = "cursor-pointer";
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${getPinColor(pin.type)};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map.current!);

      if (onPinClick) {
        marker
          .getElement()
          .addEventListener("click", () => onPinClick(pin.id));
      }

      markers.current.set(pin.id, marker);
    });
  }, [pins, onPinClick]);

  return (
    <div
      ref={mapContainer}
      className="h-full w-full"
      style={{ minHeight: "calc(100vh - 64px)" }}
    />
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
