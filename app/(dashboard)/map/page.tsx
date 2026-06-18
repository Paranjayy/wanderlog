"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { MapContainer } from "@/components/map/MapContainer";
import { AddPinModal } from "@/components/map/AddPinModal";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { Id } from "../../../convex/_generated/dataModel";

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

  const pins =
    allPlaces?.map((place) => ({
      id: place._id,
      lng: place.coordinates.lng,
      lat: place.coordinates.lat,
      type: place.type,
      name: place.name,
    })) ?? [];

  return (
    <div className="relative flex h-full">
      <div className="flex-1">
        <MapContainer
          pins={pins}
          onPinClick={(id) => setSelectedPinId(id as Id<"places">)}
          onMapClick={(lng, lat) => {
            setNewPinCoords({ lng, lat });
            setShowAddModal(true);
          }}
        />
      </div>

      {selectedPinId && (
        <PlaceCard placeId={selectedPinId} onClose={() => setSelectedPinId(null)} />
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
        />
      )}
    </div>
  );
}
