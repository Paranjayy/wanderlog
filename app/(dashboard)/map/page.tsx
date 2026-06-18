"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { MapContainer } from "@/components/map/MapContainer";
import { AddPinModal } from "@/components/map/AddPinModal";

export default function MapPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const allPlaces = useQuery(api.places.getAllPublic);

  const [selectedPin, setSelectedPin] = useState<string | null>(null);
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
    <div className="relative h-full">
      <MapContainer
        pins={pins}
        onPinClick={(id) => setSelectedPin(id)}
        onMapClick={(lng, lat) => {
          setNewPinCoords({ lng, lat });
          setShowAddModal(true);
        }}
      />

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
