"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";
import { MapContainer } from "@/components/map/MapContainer";
import { AddPinModal } from "@/components/map/AddPinModal";
import { SearchBar } from "@/components/map/SearchBar";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { Id } from "../../../convex/_generated/dataModel";

const getContinent = (code: string): string => {
  const map: Record<string, string> = {
    af: "Africa",
    as: "Asia",
    eu: "Europe",
    na: "North America",
    sa: "South America",
    oc: "Oceania",
    an: "Antarctica",
  };
  return map[code?.slice(0, 2)] || "";
};

export default function MapPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const allPlaces = useQuery(api.places.getAllPublic);

  const [selectedPinId, setSelectedPinId] = useState<Id<"places"> | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lng: number; lat: number } | null>(null);

  // Reverse geocoding state
  const [geoName, setGeoName] = useState("");
  const [geoCountry, setGeoCountry] = useState("");
  const [geoContinent, setGeoContinent] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    setGeoName("");
    setGeoCountry("");
    setGeoContinent("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "User-Agent": "Wanderlog/1.0" } }
      );
      const data = await res.json();
      setGeoName(
        data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.display_name?.split(",")[0] ||
          ""
      );
      setGeoCountry(data.address?.country || "");
      setGeoContinent(getContinent(data.address?.country_code || ""));
    } catch {
      setGeoName("");
      setGeoCountry("");
      setGeoContinent("");
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const allTags = allPlaces
    ? [...new Set(allPlaces.flatMap((p) => p.tags))].sort()
    : [];

  const pins =
    allPlaces?.map((place) => ({
      id: place._id,
      lng: place.coordinates.lng,
      lat: place.coordinates.lat,
      type: place.type,
      name: place.name,
    })) ?? [];

  const filteredPins = activeTag
    ? pins.filter((pin) => {
        const place = allPlaces?.find((p) => p._id === pin.id);
        return place?.tags.includes(activeTag);
      })
    : pins;

  return (
    <div className="relative flex h-full">
      <div className="flex-1">
        {/* Search bar */}
        <div className="absolute left-4 top-4 z-10">
          <SearchBar
            onSelect={(lat, lng, _name) => {
              setFlyToCoords({ lng, lat });
            }}
          />
        </div>

        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <div className="absolute left-0 right-0 top-14 z-10 flex gap-2 overflow-x-auto bg-white/90 p-2 backdrop-blur dark:bg-gray-900/90">
            <button
              onClick={() => setActiveTag(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm ${
                !activeTag ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`shrink-0 rounded-full px-3 py-1 text-sm ${
                  activeTag === tag ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        <MapContainer
          pins={filteredPins}
          onPinClick={(id) => setSelectedPinId(id as Id<"places">)}
          onMapClick={(lng, lat) => {
            setNewPinCoords({ lng, lat });
            setShowAddModal(true);
            reverseGeocode(lat, lng);
          }}
          flyTo={flyToCoords}
        />
      </div>

      {/* PlaceCard - Desktop: side panel, Mobile: bottom sheet */}
      {selectedPinId && (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <PlaceCard placeId={selectedPinId} onClose={() => setSelectedPinId(null)} />
          </div>
          {/* Mobile */}
          <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] rounded-t-2xl shadow-2xl md:hidden">
            <PlaceCard placeId={selectedPinId} onClose={() => setSelectedPinId(null)} />
          </div>
        </>
      )}

      {currentUser && (
        <AddPinModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setNewPinCoords(null);
          }}
          coordinates={newPinCoords || { lng: 0, lat: 0 }}
          userId={currentUser._id}
          initialName={geoName}
          initialCountry={geoCountry}
          initialContinent={geoContinent}
          isLoadingLocation={isLoadingLocation}
        />
      )}
    </div>
  );
}
