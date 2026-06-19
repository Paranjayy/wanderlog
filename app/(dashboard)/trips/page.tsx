"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";
import { TripWizard } from "@/components/trips/TripWizard";
import { Id } from "../../../convex/_generated/dataModel";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES } from "@/lib/constants";

export default function TripsPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const trips = useQuery(
    api.trips.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const [showWizard, setShowWizard] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<Id<"trips"> | null>(null);
  const selectedTrip = useQuery(
    api.trips.getById,
    selectedTripId ? { tripId: selectedTripId } : "skip"
  );

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !selectedTrip?.places?.length) return;

    if (map.current) {
      map.current.remove();
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.streets,
      center: [0, 20],
      zoom: 2,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    const places = selectedTrip.places;
    if (places.length === 0) return;

    const coordinates: [number, number][] = places.map((p) => [
      p.coordinates.lng,
      p.coordinates.lat,
    ]);

    places.forEach((place, index) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #22c55e;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      `;
      el.textContent = String(index + 1);

      new maplibregl.Marker({ element: el })
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<strong>${place.name}</strong><br/>${place.country}`
          )
        )
        .addTo(map.current!);
    });

    if (coordinates.length > 1) {
      map.current.on("load", () => {
        map.current!.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          },
        });

        map.current!.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#22c55e",
            "line-width": 3,
            "line-dasharray": [2, 1],
          },
        });
      });
    }

    const bounds = new maplibregl.LngLatBounds();
    coordinates.forEach((coord) => bounds.extend(coord));
    map.current.fitBounds(bounds, { padding: 50 });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [selectedTrip]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <button
          onClick={() => setShowWizard(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          + New Trip
        </button>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500">No trips yet. Create your first trip!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <div
              key={trip._id}
              onClick={() => setSelectedTripId(trip._id)}
              className={`cursor-pointer rounded-lg border p-4 transition hover:shadow-md ${
                selectedTripId === trip._id
                  ? "border-emerald-500 bg-emerald-50"
                  : ""
              }`}
            >
              <h3 className="font-semibold">{trip.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(trip.startDate).toLocaleDateString()} —{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </p>
              {trip.description && (
                <p className="mt-2 text-sm text-gray-600">{trip.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span>{trip.placeIds.length} places</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTrip && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedTrip.name} Route</h2>
            <button
              onClick={() => setSelectedTripId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div
              ref={mapContainer}
              className="h-[400px] w-full"
            />
          </div>

          {selectedTrip.places && selectedTrip.places.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Places in Order</h3>
              <div className="space-y-2">
                {selectedTrip.places.map((place, index) => (
                  <div
                    key={place._id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{place.name}</p>
                      <p className="text-sm text-gray-500">
                        {place.country}, {place.continent}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showWizard && currentUser && (
        <TripWizard
          userId={currentUser._id}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
